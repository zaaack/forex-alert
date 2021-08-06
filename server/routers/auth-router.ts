import * as trpc from '@trpc/server'
import { Symbols } from '../consts'
import * as yup from 'yup'
import { logger } from 'foy'
import { createRouter } from '../trpc'
import { captcha } from '../services/captcha'
import { encoder } from '../services/encoder'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
import { keyBy } from 'smoldash'
import { User } from '.prisma/client'


const MaxWrongPwdAttempts = 3
const baseAuthSchema = yup.object({
  mail: yup.string().email().required(),
  pwd: yup.string().min(6).max(50).required(),
})
export const registerSchema = baseAuthSchema.concat(yup.object({
  code: yup.string().required(),
  nickname: yup.string(),
}))
export const loginSchema = baseAuthSchema.concat(yup.object({
  remember: yup.boolean().default(false),
}))

export function userToMe(u: User | null) {
  if (!u) return null
  return {
    id: u.id,
    mail: u.mail,
    nickname: u.nickname,
    plan: u.plan,
    planExpiresAt: u.planExpiresAt,
  }
}

export const authRouter = createRouter()
  .query('me', {
    async resolve({ ctx, input }) {
      return userToMe(await ctx.getMe())
    },
  })
  .mutation('register', {
    input: registerSchema,
    async resolve({ ctx, input }) {
      if (!captcha.check(ctx.req, input.code)) {
        throw new trpc.HTTPError(`Invalid captcha`, {
          code: 'INVALID_CAPTCHA',
          statusCode: 400,
        })
      }
      console.log('data', {
        mail: input.mail,
        pushMail: input.mail,
        nickname: input.nickname || `${input.mail.split('@')[0]}`,
        pwd: encoder.encode(input.pwd),
        token: nanoid(),
        tokenExpiresAt: dayjs()
          .add( 7, 'd')
          .toDate(),
        plan: 'FREE',
      })
      let u = await ctx.user.create({
        data: {
          mail: input.mail,
          pushMail: input.mail,
          nickname: input.nickname || `${input.mail.split('@')[0]}`,
          pwd: encoder.encode(input.pwd),
          token: nanoid(),
          tokenExpiresAt: dayjs()
            .add( 7, 'd')
            .toDate(),
          plan: 'FREE',
        },
      }).catch(err => {
        if (err.message.includes('mail') &&err.message.includes('Unique')) {
          throw trpc.httpError.badRequest('mail alread exists')
        }
        throw err
      })
      ctx.setToken(u, false)
      return userToMe(u)!
    },
  })
  .mutation('verifyMail',{
    input: yup.object({
      mail: yup.string().email().required(),
      code: yup.string().required(),
    }),
    async resolve({ctx, input}) {
      if (!captcha.check(ctx.req, input.code)) {
        throw trpc.httpError.badRequest(`Invalid captcha`)
      }
      return { mail: input.mail }
    }
  })
  .mutation('login', {
    input: loginSchema,
    async resolve({ ctx, input }) {
      let u = await ctx.user.findFirst({
        where: {
          mail: input.mail,
        },
      })
      if (!u) {
        throw trpc.httpError.badRequest(`mail is not registered`)
      }
      if (u.wrongPwdAttempts >= MaxWrongPwdAttempts && dayjs().isBefore(u.lockLoginExpiration)) {
        throw trpc.httpError.badRequest(`too many wrong passwords, please retry after ${-dayjs().diff(u.lockLoginExpiration, 'h')} hours`)
      }
      if (u.pwd !== encoder.encode(input.pwd)) {
        await ctx.user.update({
          data: {
            wrongPwdAttempts: u.wrongPwdAttempts + 1,
            lockLoginExpiration: dayjs().add(3, 'h').toDate(),
          },
          where: {
            id: u.id,
          },
        })
        throw trpc.httpError.badRequest(`wrong password, ${MaxWrongPwdAttempts - u.wrongPwdAttempts}`)
      }
      u = await ctx.user.update({
        data: {
          token: nanoid(),
          tokenExpiresAt: dayjs()
            .add(input.remember ? 365 : 7, 'd')
            .toDate(),
        },
        where: {
          id: u.id,
        },
      })
      ctx.setToken(u, input.remember)
      return userToMe(u)!
    },
  })
  .mutation('logout', {
    async resolve({ ctx }) {
      const me = await ctx.getMe()

      if (me) {
        await ctx.user.update({
          data: {
            token: '',
            tokenExpiresAt: new Date,
          },
          where: {
            id: me.id,
          },
        })
      }
      ctx.res.clearCookie('uid')
      ctx.res.clearCookie('utk')
      return {}
    }
  })

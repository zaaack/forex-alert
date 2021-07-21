import * as trpc from '@trpc/server'
import { Symbols } from '../consts'
import * as yup from 'yup'
import { logger } from 'foy'
import { createRouter } from '../trpc'
import { captcha } from '../services/captcha'
import { encoder } from '../services/encoder'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'
// import y from 'yup'

// create context based of incoming request
// set as optional here so it can also be re-used for `getStaticProps()`

// const YupSymbol = y.object({
//   symbol: y.string().oneOf(Symbols)
// })

export const registerSchema = yup.object({
  mail: yup.string().email().required(),
  pwd: yup.string().min(6).max(50).required(),
  code: yup.string().required(),
  remember: yup.boolean().default(false),
})
export const loginSchema = registerSchema
export const authRouter = createRouter()
  .query('me', {
    async resolve({ ctx, input }) {
      return ctx.getMe()
    },
  })
  .mutation('register', {
    input: registerSchema,
    async resolve({ ctx, input }) {
      if (!captcha.check(ctx.req, input.code)) {
        throw trpc.httpError.badRequest(`Invalid captcha`)
      }
      let u = await ctx.user.create({
        data: {
          ...input,
          nickname: `${input.mail.split('@')[0]}`,
          pwd: encoder.encode(input.pwd),
          tokenExpiresAt: dayjs()
            .add(input.remember ? 365 : 7, 'd')
            .toDate(),
          plan: 'FREE',
        },
      })
      ctx.setToken(u, input.remember)
      return {...u, token: null}
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
      if (!captcha.check(ctx.req, input.code)) {
        throw trpc.httpError.badRequest(`Invalid captcha`)
      }
      let u = await ctx.user.findFirst({
        where: {
          mail: input.mail,
        },
      })
      if (!u) {
        throw trpc.httpError.badRequest(`mail is not registered`)
      }
      if (u.pwd !== encoder.encode(input.pwd)) {
        throw trpc.httpError.badRequest(`wrong password`)
      }
      if (dayjs().isAfter(u.tokenExpiresAt)) {
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
      }
      ctx.setToken(u, input.remember)
      return {...u, token: null}
    },
  })

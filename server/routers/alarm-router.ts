import * as trpc from '@trpc/server'
import { Symbols } from '../consts'
import * as yup from 'yup'
import { logger } from 'foy'
import { createRouter } from '../trpc'
import { captcha } from '../services/captcha'
import { encoder } from '../services/encoder'
import { nanoid } from 'nanoid'
import dayjs from 'dayjs'

export const alarmRouter = createRouter()
  .query('list', {
    async resolve({ ctx, input }) {
      return
    },
  })
  .mutation('add', {
    input: yup.object().shape({
      symbols: yup.array().of(yup.string()).required(),
      type: yup.string().required(),
      params: yup.object().required(),
    }),
    async resolve({ ctx, input }) {
      const me = await ctx.getMe()
    },
  })

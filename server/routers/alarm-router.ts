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
      return ctx.alarm.findMany({
        where: {
          userId: (await ctx.getMeOrError()).id,
        },
        orderBy: [{
          id: 'desc',
        }]
      })
    },
  })
  .query('messages', {
    input: yup.object({
      alarmId: yup.number(),
      skip: yup.number().integer().min(0).default(0),
      take: yup.number().integer().min(0).max(100).default(10),
    }),
    async resolve({ ctx, input }) {
      const where = {
        userId: (await ctx.getMeOrError()).id,
        alarmId: input.alarmId,
      }
      const total = await ctx.message.count({where})
      return {
        list: await ctx.message.findMany({
          where,
          skip: input.skip,
          take: input.take,
          include: {
            alarm: {
              select: {
                name: true,
                id: true,
              }
            }
          },
        }),
        total,
      }
    }
  })
  .mutation('createOrUpdate', {
    input: yup.object({
      id: yup.number().optional(),
      // alarmData
      name: yup.string().required(),
      symbols: yup.array().of(yup.string().required()).required(),
      periods: yup.array().of(yup.number().required()).required(),
      conds: yup.array().required(),
      enable: yup.boolean().default(true).required(),
    }),
    async resolve({ ctx, input }) {
      const me = await ctx.getMeOrError()
      if (input.id) {
        return ctx.alarm.updateMany({
          data: {
            ...input,
            userId: me.id,
            updatedAt: new Date(),
          },
          where: {
            id: input.id,
            userId: me.id,
          }
        })
      } else {
        return ctx.alarm.create({
          data: {
            ...input,
            userId: me.id,
          },
        })
      }
    },
  })
  .mutation('delete', {
    input: yup.number().required(),
    async resolve({ ctx, input }) {
      const me = await ctx.getMeOrError()
      return ctx.alarm.deleteMany({
        where: {
          id: input,
          userId: me.id,
        }
      })
    },
  })

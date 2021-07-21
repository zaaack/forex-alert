import * as trpc from '@trpc/server'
import { Config, Mt4 } from './mt4-server'
import { Symbols } from './consts'
import * as yup from 'yup'
import { logger } from 'foy'
import {createRouter} from './trpc'
// import y from 'yup'

// create context based of incoming request
// set as optional here so it can also be re-used for `getStaticProps()`

// const YupSymbol = y.object({
//   symbol: y.string().oneOf(Symbols)
// })

export const configSchema = yup
  .object({
    // // double break start
    // Break1Buy: z.number(),
    // Break1Direction: DirectionSchema,
    // Break1BuyWidth: z.number().int(),
    // Break2Buy: z.number(),
    // Break2BuyWidth: z.number().int(),
    // Break2Direction: DirectionSchema,
    // remainBreakTimes: z.number().int(),
    // // double break end
    // //
  })
export const authRouter = createRouter()
  .query('me', {
    async resolve({ ctx, input }) {
      return ctx.user
    },
  })
  .mutation('update', {
    input: configSchema,
    async resolve({ ctx, input }) {
    },
  })
  .mutation('sendOrder', {
    async resolve({ ctx, input }) {
    },
  })

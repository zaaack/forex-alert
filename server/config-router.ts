import * as trpc from '@trpc/server'
import { Config, Mt4 } from './mt4-server'
import { Symbols } from './consts'
import * as z from 'zod'
import { ZodEnum, ZodString } from 'zod'
import { logger } from 'foy'
// import y from 'yup'

// create context based of incoming request
// set as optional here so it can also be re-used for `getStaticProps()`
export const createContext = async () => {
  return {}
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}
const ZodSymbol = z.object({
  symbol: z.enum(Symbols as any) as any as ZodString,
  // symbol: z.enum(Symbols),
})
// const YupSymbol = y.object({
//   symbol: y.string().oneOf(Symbols)
// })

const DirectionSchema = z.enum(['Both', 'OnlyLong', 'OnlyShort'])
export const configSchema = z
  .object({
    Dir: DirectionSchema,
    ProfitLossRatioForMoveSL: z.number().int(),
    Ma1: z.number().int(),
    Ma2: z.number().int(),
    Ma3: z.number().int(),
    StopLossMode: z.enum(['SLMode_MA', 'SLMode_PEAK','SLMode_HALF','SLMode_NONE','SLMode_DC']),
    SLPeakPeriod: z.number().int(),
    GtPrice: z.number(),
    LtPrice: z.number(),
    StopLossDollars: z.number(),
    remainCrossTimes: z.number().int(),
    PeriodTimes: z.number().int().min(1),
    SeparatePos: z.number().int().min(1),
    crossPushPeriod: z.number().int().min(1),
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
  .merge(ZodSymbol)
export const configRouter = createRouter()
  .query('get', {
    input: ZodSymbol,
    async resolve({ ctx, input }) {
      let config = Mt4.emacross.config[input.symbol] || Config.empty
      return {
        config: {...config, symbol: input.symbol},
        profits: Mt4.emacross.profits,
        connectedSymbols: Mt4.emacross.connectedSymbols.map((s) => {
          let r = Mt4.emacross.config[s].remainCrossTimes
          const io = Mt4.emacross.instantOrders[s]
          return {
            label: `${s}${r ? `(${r})` : ''}${io? '(io)': ''}`,
            value: s,
            _isMarked: r || io,
          }
        }).sort((a, b) => a._isMarked? -1: 1),
      }
    },
  })
  .mutation('update', {
    input: configSchema,
    async resolve({ ctx, input }) {
      Mt4.emacross.updateConfig(input)
      return {...Mt4.emacross.config[input.symbol], symbol: input.symbol}
    },
  })
  .mutation('sendOrder', {
    input: z.object({
      type: z.enum(['buy', 'sell', 'cancel']),
      stoploss: z.number().optional(),
    }).merge(ZodSymbol),
    async resolve({ ctx, input }) {
      if (input.type ==='cancel') {
        delete Mt4.emacross.instantOrders[input.symbol]
      } else {
        Mt4.emacross.instantOrders[input.symbol] = input as any
      }
      if (!input.stoploss) {
        delete input.stoploss
      }
      logger.info("set instantOrders:", input, Mt4.emacross.instantOrders)
      return Mt4.emacross.instantOrders
    },
  })
  .mutation('closeOrder', {
    input: z.object({
      symbols: z.array(z.enum(Symbols as any) as any as ZodString),
    }),
    async resolve({ ctx, input }) {
      Mt4.emacross.closeOrders = {
        all: input.symbols.length === 0,
        symbols: input.symbols.reduce((acc, s) => {
          acc[s] = true
          return acc
        }, {} as any),
      }
      logger.info("set closeOrders:", input, Mt4.emacross.closeOrders)
      return Mt4.emacross.closeOrders
    },
  })

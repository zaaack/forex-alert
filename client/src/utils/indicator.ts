
import * as talib from 'talib-binding'
import yup from 'yup'
import { Candle } from './candles'

export interface Indicator {
  name: string
  params: {
    name: string
    default: any
    schema: yup.BaseSchema
  }[]
  calc(candles: Candle[], params: object, index: number): number
}

export const Indicators: Indicator[] = [
  { name: 'Open', params: [], calc: (c, p, i) => c[i].open },
  { name: 'Close', params: [], calc: (c, p, i) => c[i].close },
  { name: 'High', params: [], calc: (c, p, i) => c[i].high },
  { name: 'Low', params: [], calc: (c, p, i) => c[i].low },
  {
    name: 'MA',
    params: [
      {
        name: 'period',
        default: 9,
        schema: yup.number().min(1).max(300).integer(),
      },
      {
        name: 'source',
        default: 'close',
        schema: yup.string().oneOf(['close', 'high', 'low', 'open']),
      },
      {
        name: 'type',
        default: 'SMA',
        schema: yup.string().oneOf(['SMA', 'EMA']),
      },
    ],
    calc: (c, p: { period: number; source: 'close' | 'open' | 'high' | 'low', type: 'EMA' | 'SMA' }, i) =>
      talib.MA(
        c.map((c) => c[p.source]),
        p.period,
        p.type === 'SMA' ? talib.MATypes.SMA : talib.MATypes.EMA,
      )[i],
  },
]

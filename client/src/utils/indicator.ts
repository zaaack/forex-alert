import { ExtendedComponentSchema } from 'formiojs'
// import * as talib from 'talib-binding'
import yup from 'yup'
import { Candle } from './candles'
export type Indicator = {
  name: 'Close' | 'High' | 'Low' | 'Open'
} | {
  name: 'MA',
  period: number
  type: 'SMA' | 'EMA'
  source: 'close' | 'high' | 'low' | 'open'
}
export interface IndicatorForm {
  name: string
  fields?: ExtendedComponentSchema[]
  // calc(candles: Candle[], params: object, index: number): number
}

export const Indicators: IndicatorForm[] = [
  { name: 'Open',
  // calc: (c, p, i) => c[i].open
 },
  { name: 'Close',
  // calc: (c, p, i) => c[i].close
},
  { name: 'High',
  // calc: (c, p, i) => c[i].high
},
  { name: 'Low',
  // calc: (c, p, i) => c[i].low
},
  {
    name: 'MA',
    fields: [
      {
        label: 'period',
        key: 'period',
        type: 'number',
        labelPosition: 'left',
        labelMargin: 1,
        input: true,
        defaultValue: 9,
        validate: {
          min: 1,
          max: 500,
          integer: true,
        } as any,
      },
      {
        label: 'source',
        key: 'source',
        type: 'select',
        labelPosition: 'left',
        labelMargin: 1,
        input: true,
        dataSrc: 'values',
        defaultValue: 'close',
        data: {
          values: ['close', 'high', 'low', 'open'],
        },
      },
      {
        label: 'type',
        key: 'type',
        type: 'select',
        labelPosition: 'left',
        labelMargin: 1,
        input: true,
        dataSrc: 'values',
        defaultValue: 'EMA',
        data: {
          values: ['SMA', 'EMA'],
        },
      },
    ],
    // params: [
    //   {
    //     name: 'period',
    //     default: 9,
    //     schema: yup.number().min(1).max(300).integer(),
    //   },
    //   {
    //     name: 'source',
    //     default: 'close',
    //     schema: yup.string().oneOf(['close', 'high', 'low', 'open']),
    //   },
    //   {
    //     name: 'type',
    //     default: 'SMA',
    //     schema: yup.string().oneOf(['SMA', 'EMA']),
    //   },
    // ],
    // calc: (
    //   c,
    //   p: { period: number; source: 'close' | 'open' | 'high' | 'low'; type: 'EMA' | 'SMA' },
    //   i,
    // ) =>
    //   talib.MA(
    //     c.map((c) => c[p.source]),
    //     p.period,
    //     p.type === 'SMA' ? talib.MATypes.SMA : talib.MATypes.EMA,
    //   )[i],
  },
  {
    name: 'Constant',
    fields: [
      {
        label: 'value',
        key: 'value',
        type: 'number',
        labelPosition: 'left',
        labelMargin: 1,
        input: true,
        defaultValue: 1,
      },
    ]
  },
]

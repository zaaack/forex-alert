import { ExtendedComponentSchema } from 'formiojs'
// import * as talib from 'talib-binding'
import yup from 'yup'
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

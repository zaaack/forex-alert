import type { ExtendedComponentSchema } from 'formiojs'
import * as talib from 'talib-binding'
import { Candle } from '../../../server/utils/candles'
talib.CDLABANDONEDBABY
export type KIndicator = {
  name: 'Close' | 'High' | 'Low' | 'Open'
}
export type MAIndicator = {
  name: 'MA'
  period: number
  type:number
  source: 'close' | 'high' | 'low' | 'open'
}
export type ConstantIndicator = {
  name: 'constant'
  value: number
}
export type Indicator = KIndicator | MAIndicator | ConstantIndicator

export interface IndicatorForm {
  name: string
  fields?: ExtendedComponentSchema[]
  calc(candles: Candle[], params: any, index: number): number
}

export const Indicators: IndicatorForm[] = [
  { name: 'Open', calc: (c, p, i) => c[i].open },
  { name: 'Close', calc: (c, p, i) => c[i].close },
  { name: 'High', calc: (c, p, i) => c[i].high },
  { name: 'Low', calc: (c, p, i) => c[i].low },
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
          values: [
            { label: 'SMA', value: talib.MATypes.SMA },
            { label: 'EMA', value: talib.MATypes.EMA },
          ],
        },
      },
    ],
    calc: (c, p: MAIndicator, i) =>
      talib.MA(
        c.map((c) => c[p.source]),
        p.period,
        p.type,
      )[i],
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
    ],
    calc: (c, p: ConstantIndicator, i) => p.value,
  },
]

export const IndicatorCalcs: { [key: string]: IndicatorForm['calc'] } = Indicators.reduce((acc: any, indicator) => {
  acc[indicator.name] = indicator.calc
  return acc
}, {} as any)

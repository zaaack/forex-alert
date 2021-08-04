import {Periods} from '../consts';

export interface Candle {
  time: number //unix time
  close: number
  high: number
  low: number
  open: number
  volumn: number
}

const calcStartIdx = (candles: Candle[], count: number) => {
  const time = candles.map((c) => c.time)
  return time.length - count + time.slice(-count).findIndex((t) => t % (15 * 60 * count) === 0)
}
export type SupportHour = typeof Periods[number]
export function mergeM15ToHours(candles: Candle[], hour: SupportHour) {
  const count = hour * 4
  candles = candles.slice(0, calcStartIdx(candles, count))
  const newCandles: Candle[] = []
  candles = candles.reverse()
  for (let i = 0, j = 0; i < candles.length; i++) {
    if (i % count === 0) {
      const newCandle = {
        time: candles[i].time,
        open: candles[i].open,
        high: Math.max(...candles.slice(i, i + count).map((c) => c.high)),
        low: Math.min(...candles.slice(i, i + count).map((c) => c.low)),
        close: candles[i + count].close,
        volumn: candles
          .slice(i, i + count)
          .map((c) => c.volumn)
          .reduce((a, b) => a + b, 0),
      }
      if (!newCandle.close) {
        newCandle.close = candles
          .slice(i, i + count)
          .map((c) => c.close)
          .slice(-1)[0]
      }
      newCandles.push(newCandle)
      j++
    }
  }
  return newCandles.reverse()
}

export function appendM15ToHours(candles: Candle[], m15Candle: Candle, hour: SupportHour) {
  const count = hour
  if (m15Candle.time - candles[0].time === count * (15 * 60)) {
    candles.push(m15Candle)
  } else {
    const lastCandle = candles[0]
    lastCandle.close = m15Candle.close
    lastCandle.high = Math.max(m15Candle.high, lastCandle.high)
    lastCandle.low = Math.min(m15Candle.low, lastCandle.low)
  }
  return candles
}

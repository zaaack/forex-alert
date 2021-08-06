import { Dayjs } from 'dayjs';
import {HourMinutes, Period, PeriodsHours} from '../consts';

export interface Candle {
  time: number //unix time
  close: number
  high: number
  low: number
  open: number
  volume: number
  done: boolean
}

const calcStartIdx = (candles: Candle[], count: number) => {
  const time = candles.map((c) => c.time)
  return time.length - count + time.slice(-count).findIndex((t) => t % (15 * 60 * count) === 0)
}
export type SupportHour = typeof PeriodsHours[number]
export function mergeM15ToHours(candles: Candle[], hour: SupportHour) {
  const count = hour * 4
  candles = candles.slice(0, calcStartIdx(candles, count))
  const newCandles: Candle[] = []
  candles = candles.reverse()
  for (let i = 0, j = 0; i < candles.length; i++) {
    if (i % count === 0) {
      const newCandle: Candle = {
        time: candles[i].time,
        open: candles[i].open,
        high: Math.max(...candles.slice(i, i + count).map((c) => c.high)),
        low: Math.min(...candles.slice(i, i + count).map((c) => c.low)),
        close: candles[i + count].close,
        volume: candles
          .slice(i, i + count)
          .map((c) => c.volume)
          .reduce((a, b) => a + b, 0),
          done: true,
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

export function appendM15ToHours(candles: Candle[], m15Candle: Candle, period: Period) {
  if (m15Candle.time - candles[0].time >= period * 60) {
    candles[0].done = true
    candles.unshift({
      ...m15Candle,
      done: false,
    })
    candles.pop()
    return true
  } else {
    const first = candles[0]
    first.close = m15Candle.close
    first.high = Math.max(m15Candle.high, first.high)
    first.low = Math.min(m15Candle.low, first.low)
    return false
  }
}


export function appendPriceToM15(candles: Candle[], price: number, time: Dayjs) {
  const first = candles[0]
  const nextBarTime = (first.time + 15 * 60)* 1000
  if (time.isBefore(nextBarTime)) {
    first.close = price
    first.high = Math.max(first.high, price)
    first.low = Math.min(first.low, price)
    return false
  } else {
    first.done = true
    const newCandle: Candle = {
      time: nextBarTime,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 0,
      done: false,
    }
    candles.unshift(newCandle)
    candles.pop()
    return true
  }
}

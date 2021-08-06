import { logger } from 'foy'
import { HourMinutes, Period, PeriodNames, Periods, Symbol, Symbols } from '../consts'
import { appendM15ToHours, appendPriceToM15, Candle } from '../utils/candles'
import { oanda } from './oanda'
import Event from 'events'

export class ForexData extends Event {
  pairs = new Map<Symbol, Map<Period, Candle[]>>()

  constructor() {
    super()
  }

  async init() {
    await Promise.all(
      Symbols.map(async (symbol) => {
        await Promise.all(
          Periods.map(async (p) => {
            const candles = await oanda.instruments(symbol, {
              count: 600,
              period: p,
            })
            let map = this.pairs.get(symbol)
            if (!map) {
              map = new Map<Period, Candle[]>()
              this.pairs.set(symbol, map)
            }
            map.set(p, candles)
            if (p === Period.M15) {
              oanda.stream(symbol, (price, time) => {
                let isNewCandle = appendPriceToM15(candles, price, time)
                if (isNewCandle) {
                  logger.log('new M15:', candles[0], candles[1])
                  const newM15 = candles[0]
                  Periods.forEach((p) => {
                    if (p > Period.M15) {
                      appendM15ToHours(candles, newM15, p)
                      logger.info(`new ${Period[p]}:`, candles[0], candles[1])
                      this.emit(Period[p])
                    }
                  })
                  this.emit(Period[p])
                }
              })
            }
          }),
        )
      }),
    )
  }
}

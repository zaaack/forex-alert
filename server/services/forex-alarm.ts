import { Alarm, User } from ".prisma/client";
import { prisma } from "../trpc";
import Schedule from 'node-schedule'
import { Period, Periods, Symbol } from "../consts";
import { logger } from "foy";
import { ForexData } from "./forex-data";
import dayjs from "dayjs";
import { Candle } from "../utils/candles";
import { Condition } from "../../client/src/pages/home/alarm-builder/conds";
import { IndicatorCalcs } from "../../client/src/utils/indicator";
import LRU from 'quick-lru'
import * as talib from 'talib-binding'

export class ForexAlarm {
  forexData = new ForexData()
  cache = new LRU<number, User>({
    maxSize: 3000,
    maxAge: 1000 * 60 * 10,
  })
  constructor() {
  }

  async start() {
    await this.forexData.init()
    Periods.forEach(period => {
      let rule= '10 */15 * * * 1-5'
      let hours = period/60
      if (hours < 1) {
        rule = `10 */${period} * * * 1-5`
      } else if (hours < 24) {
        rule = `10 0 */${hours} * * 1-5`
      } else {
        const d =  hours / 24
        rule = `10 0 0 */${d} * 1-5`
      }
      Schedule.scheduleJob(
        rule,
        async () => {
          let alarms = await prisma.alarm.findMany({
            where: {
              periods: {has: period},
              enable: true,
            },
          })
          logger.info('trigger alarm:', rule)
          alarms.forEach(alarm=> {
            this.checkAlarm(alarm, period)
          })
        }
      );
    })
  }
  checkAlarm(alarm: Alarm, period: Period) {
    const forex = this.forexData.pairs
    alarm.symbols.forEach((symbol)=> {
      const candles = forex.get(symbol as Symbol)?.get(period)
      if (!candles) {
        logger.info('no forex data for symbol:', symbol, 'period:', period)
        return
      }
      if (dayjs().isAfter((candles[0].time + period * 60)*1000)) { // 超出一根K, 停盘了
        logger.info('marktclose:', 'now:',dayjs().toISOString(), 'candletime:', dayjs(candles[0].time*1000).toISOString(), 'alarm:', alarm.id, 'symbol:', symbol, 'period:', period)
        return
      }
      this.checkSymbolPeriod(candles, alarm, symbol as Symbol, period)
    })
  }

  checkSymbolPeriod(candles: Candle[], alarm: Alarm, symbol: Symbol, period: Period) {
    const conds = alarm.conds as any as Condition[]
    let trigger1 = this.checkConds(candles, conds, 1)
    let trigger2 = this.checkConds(candles, conds, 2)
    if (trigger1 && !trigger2) {
      logger.info('trigger alarm:', alarm.id, 'trigger1:', trigger1)
      this.sendPushs(alarm, symbol, period)
    }
  }

  checkConds(candles: Candle[], conds: Condition[], index: number) {
    let isTrigger = false
    for (const cond of conds) {
      if (cond.name === 'Compare') {
        const ind1 = IndicatorCalcs[cond.indicator1.name](candles, cond.indicator1, index)
        const ind2 = IndicatorCalcs[cond.indicator2.name](candles, cond.indicator2, index)
        const fit =  cond.compare === '>' ? ind1 > ind2 : ind1 < ind2
        isTrigger = cond.join === 'and' ? isTrigger && fit : isTrigger || fit
      } else if (cond.name === 'CandlePattern') {
        const cs = candles.slice(5)
        let rets = talib[cond.pattern](
          cs.map(c => c.open),
          cs.map(c => c.high),
          cs.map(c => c.low),
          cs.map(c => c.close),
        )[index]
        let fit = Math.abs(rets) >= cond.similarity
        isTrigger = cond.join === 'and' ? isTrigger && fit : isTrigger || fit
      }
    }
    return isTrigger
  }

  async sendPushs(alarm: Alarm, symbol: Symbol, period: Period) {
    let user = this.cache.get(alarm.userId) || null
    if (!user) {
      user = await prisma.user.findFirst({ where: { id: alarm.userId } })
      if (user) {
        this.cache.set(user.id, user)
      } else { // 用户删除了
        await prisma.alarm.delete({ where: { id: alarm.id } })
        return
      }
    }

    logger.log('pushMail', user.pushMail, alarm.id, symbol, period)
    await prisma.message.create({
      data: {
        alarmId: alarm.id,
        userId: user.id,
        period,
        symbol,
      }
    })

  }

  _lastCleanMsgsTime = 0
  async cleanMsgs(user: User) {
    if (dayjs().isBefore(dayjs(this._lastCleanMsgsTime).add(1, 'w'))) {
      return
    }
    this._lastCleanMsgsTime = Date.now()
    let msg = await prisma.message.findFirst({
      where: {
        userId: user.id,
      },
      skip: 200,
      take: 1,
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    })
    if (msg) {
      let ret= await prisma.message.deleteMany({
        where: {
          id: {
            lt: msg.id,
          }
        }
      })
      logger.info('clean msgs:', ret)
    }
  }
}

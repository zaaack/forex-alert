import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { logger } from 'foy'
import { inspect } from 'util'
import { Period, Symbol,  } from '../../consts'
import { OandaCandles, periodToOanda, oandaToCandles, symbolToOanda, StreamData } from './utils'

const conf = {
  accountId: '101-011-13962699-001',
  apiToken: 'c2d30e5515589e123d0f3a2a1a59642b-b5e5358285b005e3ded2fd4493f58db5',
}

class Api {
  get(path: string, options?: AxiosRequestConfig) {
    logger.debug('get:', path, options?.params)
    let start = Date.now()
    return axios
      .get(`https://api-fxpractice.oanda.com/v3${path}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${conf.apiToken}`,
        },
        ...options,
      })
      .catch((err) => {
        logger.error(err.message, err.response.data)
        throw new Error('请求异常')
      })
      .then((res) => {
        logger.info('fetch success:', path)
        return res
      })
  }
  instruments(
    symbol: Symbol,
    params: {
      count?: number
      price?: 'M' | 'B' | 'A' // 用哪个价格绘制K线，mid, bid(低的做空), ask(高的做多)
      period: Period // 周期
    },
  ) {
    return this.get(`/instruments/${symbolToOanda(symbol)}/candles`, {
      params: {
        price: params.price||'B',
        count: params.count || 600,
        granularity: periodToOanda(params.period),
      },
    })
      .then<OandaCandles>((r) => r.data)
      .then(oandaToCandles)
      .catch((err) => {
        logger.error(err.message, err.response?.data)
        throw err
      })
  }

  async stream(symbol: Symbol, callback: (price: number, time: Dayjs) => void) {
    let res = await axios.get(
      `https://stream-fxpractice.oanda.com/v3/accounts/${conf.accountId}/pricing/stream?instruments=${symbolToOanda(symbol)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${conf.apiToken}`,
        },
        responseType: 'stream',
      },
    ).catch(e => {
      logger.error(e.message, e.response.data.data)
      throw new Error('请求失败')
    })
    const handleError = (err: Error) => {
      logger.error('price stream 遭遇异常，5s后重试', err)
      setTimeout((symbol: Symbol, callback: (price: number, time: Dayjs) =>void, res: AxiosResponse<any>) => {
        this.stream(symbol, callback)
        res.data.close()
      }, 5000, symbol, callback, res)
    }
    res.data.on('close', handleError)
    res.data.on('error', logger.error)
    res.data.on('data', (data: string | Buffer) => {
      if (typeof data !== 'string') {
        data = data.toString('utf8')
      }
      data
        .split('\n')
        .filter(Boolean)
        .map((data: string) => {
          let d:StreamData
          try {
            d = JSON.parse(data)
            // logger.info('data', data)
          } catch (error) {
            logger.error(data)
            throw error
          }
          logger.log(d)
          if (d.type === 'PRICE') {
            d.bids.forEach((b) => {
              callback(Number(b.price), dayjs(d.time))
            })
          }
        })
    })
  }
}

export const oanda = new Api()

oanda.instruments('EURUSD', {count: 1, period: Period.M15}).then(r => {
  console.log(r)
})

oanda.stream('EURUSD', (price, time) => {
  logger.log(price, time)
})

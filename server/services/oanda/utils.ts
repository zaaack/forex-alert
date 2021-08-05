import { Period, Symbol } from "../../consts"
import { Candle } from "../../utils/candles"

export interface OandaCandles {
  candles: OandaCandle[];
  granularity: string;
  instrument: string;
}

export interface OandaCandle {
  complete: boolean;
  bid: OandaBid;
  mid: OandaBid
  time: string;
  volume: number;
}

export interface OandaBid {
  c: string;
  h: string;
  l: string;
  o: string;
}

export interface StreamData {
  type: 'PRICE'
  asks: StreamAsk[]
  bids: StreamBid[]
  closeoutAsk: string
  closeoutBid: string
  instrument: string
  status: string
  time: string
}

export interface StreamAsk {
  liquidity: number
  price: string
}

export interface StreamBid {
  liquidity: number
  price: string
}


export function oandaToCandles(candles: OandaCandles): Candle[] {
  let c = candles.candles.slice().reverse() // 最近的在索引 0
  return c.map((c) => ({
    close: Number(c.bid.c),
    high: Number(c.bid.h),
    low: Number(c.bid.l),
    open: Number(c.bid.o),
    time: Number(new Date(c.time).getTime() / 1000),
    volume: Number(c.volume),
    done: c.complete,
  }))
}

export function periodToOanda(period: Period): OandaPeriod {
  let ret=null as any
  ret = Period[period]
  return ret
}

export function symbolToOanda(symbol: Symbol): OandaSymbol {
  let ret = null as any
  ret = (
    {
      US30: 'US30_USD',
      USOilCash: 'WTICO_USD',
    } as any
  )[symbol]
  if (!ret) {
    ret = symbol.slice(0, -3) + '_'+ symbol.slice(-3)
  }
  return ret
}



export enum OandaPeriod {
  M1 = 'M1',
  M2 = 'M2',
  M3 = 'M3',
  M5 = 'M5',
  M15 = 'M15',
  M30 = 'M30',
  H1 = 'H1',
  H2 = 'H2',
  H3 = 'H3',
  H4 = 'H4',
  H6 = 'H6',
  H8 = 'H8',
  H12 = 'H12',
  D = 'D',
}

export enum OandaSymbol {
  EUR_USD = 'EUR_USD',
  EUR_JPY = 'EUR_JPY',
  USD_CHF = 'USD_CHF',
  GBP_JPY = 'GBP_JPY',
  GBP_USD = 'GBP_USD',
  EUR_GBP = 'EUR_GBP',
  WTICO_USD = 'WTICO_USD',
  XAU_USD = 'XAU_USD',
  AUD_CHF = 'AUD_CHF',
  AUD_JPY = 'AUD_JPY',
  CAD_CHF = 'CAD_CHF',
  CAD_JPY = 'CAD_JPY',
  USD_JPY = 'USD_JPY',
  AUD_USD = 'AUD_USD',
  USD_CAD = 'USD_CAD',
  NZD_USD = 'NZD_USD',
  US30_USD = 'US30_USD',
}

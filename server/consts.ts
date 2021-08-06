export const Symbols=[
  "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "GBPJPY",
  "EURJPY", "EURGBP",  "XAUUSD", "USOilCash",
  "BTCUSD", "US30",
] as const

export type Symbol = typeof Symbols[number]
export const PeriodsHours = [0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 24] as const
export const HourMinutes = 60
export const Periods = PeriodsHours.map(p=> p * HourMinutes)

export enum Period {
  M15 = 0.25 * HourMinutes,
  M30 = 0.5 * HourMinutes,
  H1 = 1 * HourMinutes,
  H2 = 2 * HourMinutes,
  H3 = 3 * HourMinutes,
  H4 = 4 * HourMinutes,
  H6 = 6 * HourMinutes,
  H8 = 8 * HourMinutes,
  H12 = 12 * HourMinutes,
  D = 24 * HourMinutes,
}

export const PeriodNames = Object.keys(Period).filter(p => !/^\d/.test(p))

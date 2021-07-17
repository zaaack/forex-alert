export const Symbols=[
  "GBPUSD", "EURUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD",
  "EURGBP", "GBPJPY", "EURJPY", "AUDJPY", "CADJPY", "NZDJPY",
  "USDCHF", "GBPCHF", "EURCHF", "AUDCHF", "CADCHF", "NZDCHF",
  "AUDCAD", "CHFJPY", "XAUUSD", "USOilCash", "BTCUSD",
  "US30", "ChinaA50", "HK50", "JP225", "DE30"
] as const

export type Symbol = typeof Symbols[number]

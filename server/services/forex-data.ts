import { Period, Symbol, Symbols } from "../consts";
import { Candle } from "../utils/candles";


class ForexData {
  pairs = new Map<Symbol, Map<Period, Candle[]>>()

  constructor() {
    this.init()
  }

  init() {
    for (const symbol of Symbols) {

    }
  }
}

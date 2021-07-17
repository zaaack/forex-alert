import net from 'net'
import { fs, Logger, LogLevels } from 'foy'
import { push } from './wx-push'
import readline from 'readline'
import * as z from 'zod'
import Path from 'path'
import { Symbol, Symbols } from './consts'
import OS from 'os'
import cron from 'node-schedule'
let lastTime = new Date()
const logger = new Logger({
  logTime: true,
  async onLog(info) {
    if (info.levelNum<= LogLevels.debug) return
    if (info.time.getTime() - lastTime.getTime()>=1000* 60 * 60 * 24) { // 记录一天
      await fs.rename('./server.log', `./server-1.log`)
    }
    lastTime = info.time
    await fs.appendFile('./server.log', `${info.message}\n`)
  },
})
let L = logger.log
// 2021.05.30 09:09:50.123	EmaCross GBPUSD,M1: pipeName: \\.\pipe\tmp\mt4_emacross_GBPUSD

type Direction = 'Both' | 'OnlyLong' | 'OnlyShort'
export interface Config {
  symbol: string
  Dir: Direction
  ProfitLossRatioForMoveSL: number
  Ma1: number
  Ma2: number
  Ma3: number
  StopLossMode: 'SLMode_MA' | 'SLMode_PEAK' | 'SLMode_HALF' | 'SLMode_NONE' | 'SLMode_DC'
  SLPeakPeriod: number
  GtPrice: number
  LtPrice: number
  StopLossDollars: number
  remainCrossTimes: number
  PeriodTimes: number
  SeparatePos: number
  crossPushPeriod: number
}

export namespace Config {
  export const empty: Config = {
    symbol: 'GBPUSD',
    Dir: 'Both',
    ProfitLossRatioForMoveSL: 2,
    Ma1: 9,
    Ma2: 25,
    Ma3: 120,
    StopLossMode: 'SLMode_PEAK',
    SLPeakPeriod: 30,
    GtPrice: -1,
    LtPrice: -1,
    StopLossDollars: 5,
    remainCrossTimes: 0,
    PeriodTimes: 1,
    SeparatePos: 2,
    crossPushPeriod: 15,
  }
}

export interface ConfigMap {
  [k: string]: Config
}

const PushWholeHours = [7, 8, 9, 12, 13, 19, 20, 21]
const PushHours = Array.from(new Set([9, 10, 11, 14, 15, 16, 17, 21].concat(PushWholeHours))).sort()

export class Mt4 {
  config: ConfigMap = {}
  connectedSymbols: string[] = []
  hasNewConfigSymbols: string[] = []
  instantOrders: {
    [k: string]: {
      symbol: string
      stoploss: number
      type: 'buy' | 'sell'
    }
  } = {}
  closeOrders?: {
    all: boolean
    symbols: { [k: string]: boolean }
  }
  profits: { [k: string]: number } = {}
  crosses: {
    //交叉信息
    symbol: Symbol
    type: 'up' | 'down'
  }[] = []
  static readonly emacross = new Mt4()
  private get stateFile() {
    return `./db/${this.pipeName.split(Path.sep).slice(-1)[0]}_state.json`
  }
  constructor(private pipeName = `/tmp/mt4_emacross`) {
    this.pipeName =
      process.platform === 'win32' ? '\\\\.\\pipe' + pipeName.replace(/\//g, '\\') : pipeName
    this.restoreState()
    this._connect()
    cron.scheduleJob(`0 7-21 * * 1-5`, () => {
      this.pushCrosses()
    })
  }
  restoreState() {
    try {
      const state = fs.readJsonSync(this.stateFile)
      this.config = Object.assign({}, state.config)
      this.crosses = state.crosses || []
      logger.info('load state:', this.stateFile)
    } catch (error) {}
  }
  socket: net.Socket = null as any
  server: net.Server = null as any
  lastContectTime = 0

  private _connect() {
    if (fs.existsSync(this.pipeName)) {
      try {
        fs.unlinkSync(this.pipeName)
      } catch (error) {}
    }
    this.server = net
      .createServer((socket) => {
        socket.on('connect', () => {
          L('pipe: on connection')
        })
        let rl = readline.createInterface(socket)
        rl.on('line', (data) => {
          this.lastContectTime = Date.now()
          let dataObj = JSON.parse(data.toString())
          let L = logger.info
          if (dataObj.command==='request_config'){
            L = logger.debug
          }
          L('pipe receive:', data.toString())
          switch (dataObj.command) {
            case 'request_config': {
              let reply = {} as any
              if (this.config) {
                // init:true 时代表EA重新加载，总是重新获取 conifg
                if (this.hasNewConfigSymbols.length || dataObj.init) {
                  const newConfig = this.hasNewConfigSymbols.length
                    ? this.hasNewConfigSymbols.reduce((acc, s) => {
                        acc[s] = this.config[s]
                        return acc
                      }, {} as ConfigMap)
                    : this.config
                  Object.assign(reply, { ...newConfig, command: 'set_config' })
                  this.hasNewConfigSymbols = []
                  if (dataObj.init) {
                    this.connectedSymbols = dataObj.symbols || ['GBPUSD']
                  }
                  reply.init = dataObj.init
                } else {
                  Object.assign(reply, { command: 'no_new_config' })
                }
              } else {
                Object.assign(reply, { command: 'no_config' })
              }
              // 执行 即时订单
              if (Object.keys(this.instantOrders).length) {
                reply.instant_orders = this.instantOrders
                this.instantOrders = {}
              }
              // 执行关闭订单
              if (this.closeOrders) {
                reply.close_orders = this.closeOrders
                this.closeOrders = void 0
              }
              // 更新 盈利信息
              this.profits = dataObj.profits
              this.send(reply)
              break
            }
            case 'set_config': {
              for (const symbol of Symbols) {
                if (dataObj[symbol]) {
                  this.updateConfig(dataObj[symbol], false)
                }
              }
              break
            }
            case 'push': {
              let period = dataObj.period
              if (period < 60) {
                period = `M${period}`
              } else if (period >= 60 && period < 24 * 60) {
                period = `H${period / 60}`
              } else if (period >= 24 * 60) {
                period = `D${period / 24 / 60}`
              }
              push.send(`[${dataObj.symbol}][${period}] ${dataObj.msg}`)
              break
            }
            case 'cross_push': {
              ;(dataObj.ups || []).forEach((symbol: Symbol) => {
                this.crosses.push({ symbol, type: 'up' })
              })
              ;(dataObj.downs || []).forEach((symbol: Symbol) => {
                this.crosses.push({ symbol, type: 'down' })
              })
              const hour = new Date().getHours() + 1
              if (PushWholeHours.includes(hour)) {
                this.pushCrosses()
              }
              this.saveState()
              break
            }
          }
        })
        socket.on('error', (err) => {
          logger.error('pipe error:', err)
        })
        socket.on('end', () => {
          logger.info('pipe end')
        })
        socket.on('close', (hadError) => {
          logger.info('pipe closed:', hadError ? 'had error' : '')
        })
        this.socket = socket
      })
      .listen(this.pipeName, () => {
        logger.info('pipe listen at:', this.pipeName)
      })
      .on('error', (err) => {
        logger.error('pipe server error', err)
      })
      .on('close', () => {
        logger.info('pipe server close')
        this.socket.destroy()
        this.server.close()
        setTimeout(() => {
          logger.info('pipe reconnect')
          this._connect()
        }, 5000)
      })
  }
  pushCrosses() {
    const msg = this.crosses
      .sort((a, b) => Symbols.indexOf(a.symbol) - Symbols.indexOf(b.symbol))
      .map((c) => `${c.symbol}--cross${c.type},`)
      .join('\n')
    this.crosses = []
    push.send(msg)
    this.saveState()
  }

  send(msg: any) {
    let L=logger.info
    if (msg.command==='no_new_config') {
      L = logger.debug
    }
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg)
    }
    L('pipe send', msg)
    this.socket.write(msg + '\r\n')
  }

  updateConfig(config: Config, hasNewConfig = true) {
    logger.info('updateConfig:', config, '\nhasNewConfig:', hasNewConfig)
    this.config[config.symbol] = config
    if (hasNewConfig) {
      this.hasNewConfigSymbols.push(config.symbol)
    }
    this.saveState()
  }

  saveState() {
    fs.outputJson(this.stateFile, { config: this.config, crosses: this.crosses }, { space: 2 })
  }
}

import net from 'net'
import { fs, Logger } from 'foy'
import readline from 'readline'
import Path from 'path'
import Axios from 'axios'
import cheerio from 'cheerio'

const _format=Logger.defaultProps.format!

const logger = new Logger({format: (...args) => {
  return `[${new Date().toLocaleString()}]${_format(...args)}`
} })
export class Mt4 {
  static readonly signal = new Mt4()
  constructor(private pipeName = `/tmp/mt4_signal`) {
    this.pipeName =
      process.platform === 'win32' ? '\\\\.\\pipe' + pipeName.replace(/\//g, '\\') : pipeName
    this.parseSignal()
    this._connect()
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
          logger.info('pipe: on connection')
        })
        let rl = readline.createInterface(socket)
        rl.on('line', async (data) => {
          this.lastContectTime = Date.now()
          logger.info('pipe receive:', data.toString())
          let dataObj = JSON.parse(data.toString())
          switch (dataObj.command) {
            case 'request_config': {
              let reply = {
                command: 'sync_orders',
              } as any
              const orders = await this.parseSignal().catch(e=>logger.error(e.message, e.stack))
              if (orders) {
                reply.orders = orders
              }
              this.send(reply)
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

  send(msg: any) {
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg)
    }
    logger.info('pipe send', msg)
    this.socket.write(msg + '\r\n')
  }

  async parseSignal() {
    let res = await Axios.get('http://massyart.com/ringsignal/api/forex/?v=52', { timeout: 10*1000 })
    const $=cheerio.load(res.data)
    const orders: any[] = []
    $('.single_wrapper').each(function(i, el) {
      const $el = $(el)!
      const isActive = $el.html()!.includes('Active')
      if (!isActive) return
      const isSell = $el.hasClass('sell')
      const isBuy = $el.hasClass('buy')
      const symbol = $el.find('.single_signal .pull-center').text()
      const $detail = $el.find('.signal_detail')
      const openPrice =  Number($detail.find('tr:eq(0) .container-fluid .text-right').text())
      const takeProfit =  Number($detail.find('tr:eq(1) .container-fluid .text-right').text())
      const stopLoss =  Number($detail.find('tr:eq(2) .container-fluid .text-right').text())

      orders.push({
        orderType: isSell ? 'sell' : 'buy',
        id: symbol+'_'+openPrice,
        symbol,
        openPrice,
        takeProfit,
        stopLoss,
      })
    })
    console.log(orders)
    return orders
  }
}

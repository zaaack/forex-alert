import React, { useEffect, useRef, useState } from 'react'
import { queryClient, trpc } from './api/trpc'
import './App.scss'
// import { Form } from '@formio/react';
import * as Formio from 'formiojs'
import { formDefs } from './form-defs'
// declare var Formio: { Form: typeof Form }
declare var swal: any
const symbolInQuery = new URLSearchParams(location.search).get('symbol') || 'GBPUSD'
function App() {
  const [symbol, setSymbol] = useState(symbolInQuery)
  const configQuery = trpc.useQuery(['config.get', { symbol }])
  const utils = trpc.useContext()
  const formRef = useRef<HTMLDivElement>(null)
  const configMutate = trpc.useMutation('config.update', {
    onSuccess(data) {
      console.log('mutated', data)
      utils.invalidateQuery(['config.get', { symbol: data.symbol }])
      swal('更新成功', '', 'success')
      setTimeout(() => {
        swal.close()
      }, 1500)
    },
    onError(err) {
      console.error(err)
      swal('更新失败', err.message, 'error')
    },
  })

  const sendOrder = trpc.useMutation('config.sendOrder', {
    onSuccess(data) {
      swal('发送下单命令成功', '', 'success')
      setTimeout(() => {
        swal.close()
      }, 1500)
    },
    onError(err) {
      console.error(err)
      swal('发送订单失败', err.message, 'error')
    },
  })

  const closeOrder = trpc.useMutation('config.closeOrder', {
    onSuccess(data) {
      swal('发送平仓命令成功', '', 'success')
      setTimeout(() => {
        swal.close()
      }, 1500)
    },
    onError(err) {
      console.error(err)
      swal('发送平仓失败', err.message, 'error')
    },
  })

  useEffect(() => {
    if (!formRef.current || !configQuery.data) return
    let config = configQuery.data.config
    let symbolComp = formDefs.components.find((c) => c.key === 'symbol')
    // 更新后端已连接的 symbol
    if (symbolComp && configQuery.data.connectedSymbols.length) {
      symbolComp.data.values = configQuery.data.connectedSymbols
    }
    new Formio.Form(formRef.current, formDefs).ready.then((form) => {
      form.submission = { data: config }
      form.on('submit', (data) => {
        console.log('onSubmit', data.data)
        configMutate.mutate(data.data)
        configQuery.refetch()
      })
      form.on('change', (c) => {
        const key = c?.changed?.component?.key
        if (key === 'symbol' && c.isValid && c.data[key] !== config[key]) {
          console.log('change symbol', c)
          setSymbol(c.data[key])
          history.pushState({}, '', `?symbol=${c.data[key]}`)
        }
      })
      form.on('error', (errors) => {
        console.log(errors)
      })
      form.on('customEvent', e => {
        console.log(e)
        const key = e.component.key
        if (['buy', 'sell', 'cancel'].includes(key)) {
          let stoploss = window.prompt('确定要立即下单么?', '0')
          if (stoploss) {
            if (isNaN(Number(stoploss))) {
              return swal('stoploss 不是数字', '', 'error')
            }
            sendOrder.mutate({ type: key, symbol, stoploss: Number(stoploss) })
          }
        }
        if (key === 'close') {
          let ret = window.prompt('确定要平仓么?', 'all')
          if (ret) {
            let symbols = []
            if (ret !== 'all') {
              symbols = ret.split(',').map(s=>s.trim().toUpperCase())
            }
            closeOrder.mutate({ symbols })
          }
        }
      })
    })
  }, [configQuery.data?.config?.symbol])

  if (!configQuery.data) return <div>Loading</div>
  return (
    <div>
      {Object.keys(configQuery.data.profits || {}).map(s=> {
        const p=Number(configQuery.data.profits[s].toFixed(5))
        return (
          <div>
            <b>{s}</b>: <span style={{color: p>=0?'#417dd7' : '#d81919'}}>{p}</span>
          </div>
        )
      })}
      <div ref={formRef}></div>
    </div>
  )
}

export default App

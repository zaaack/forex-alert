import React, { useEffect, useRef, useState } from 'react'
import yup from 'yup'
import { IndicatorForm } from '../../../utils/indicator'
import css from './index.module.scss'
import { Form } from '@formio/react'
import { CompareForm } from './conds/compare'
import { Period, Symbol, Symbols } from '../../../../../server/consts'
import { Condition, AlarmFormMap } from './conds'
import { Button, ButtonDropdown, ButtonGroup, Grid, Input, Select, Tooltip } from '@geist-ui/react'
import { Formio } from 'formiojs'

export interface CrossAlarm {
  type: 'cross'
  fields: [
    {
      label: 'Columns'
      columns: [
        {
          components: [
            {
              label: 'input'
              hideLabel: true
              tableView: true
              data: {
                values: [
                  {
                    label: 'ma'
                    value: 'ma'
                  },
                  {
                    label: 'close'
                    value: 'close'
                  },
                ]
              }
              key: 'input'
              type: 'select'
              input: true
              defaultValue: 'ma'
            },
          ]
          width: 5
          offset: 0
          push: 0
          pull: 0
          size: 'md'
          currentWidth: 5
        },
        {
          components: [
            {
              label: 'Select'
              hideLabel: true
              tableView: true
              data: {
                values: [
                  {
                    label: '>'
                    value: '>'
                  },
                  {
                    label: '<'
                    value: '<'
                  },
                ]
              }
              key: 'select1'
              type: 'select'
              input: true
              defaultValue: '>'
            },
          ]
          width: 2
          offset: 0
          push: 0
          pull: 0
          size: 'md'
          currentWidth: 2
        },
        {
          components: []
          size: 'md'
          width: 5
          offset: 0
          push: 0
          pull: 0
          currentWidth: 5
        },
      ]
      key: 'columns'
      type: 'columns'
      input: false
      tableView: false
    },
  ]
}

export interface Break {
  type: 'break'
  params: {
    level: number
  }
}

export interface PinbarWithLevel {
  type: 'pinbar'
  params: {
    level: number
  }
}

export interface PinbarWithMA {
  type: 'pinbar'
  params: {
    ma: IndicatorForm
  }
}
function AlarmItem({ alarm, i, ...args }: { alarm: Condition; i: number; [k: string]: any }) {
  const form = React.useMemo(() => {
    return {
      class: css.alarmItem,
      components: [
        {
          type: 'container',
          customClass: css.alarmJoin,
          components: [
            {
              type: 'select',
              key: 'join',
              hideLabel: true,
              placeholder: '',
              input: true,
              defaultValue: 'and',
              dataSrc: 'values',
              hidden: i === 0,
              data: {
                values: [
                  { label: 'and', value: 'and' },
                  { label: 'or', value: 'or' },
                ],
              },
            },
            {
              label: 'Remove',
              action: 'event',
              key: 'remove',
              type: 'button',
              theme: 'danger',
              input: true,
            },
          ],
        },
        {
          title: alarm.name,
          label: alarm.name,
          type: 'panel',
          customClass: css.alarmConfig,
          components: [
            ...AlarmFormMap[alarm.name].fields,
            {
              label: 'name',
              key: 'name',
              type: 'textfield',
              defaultValue: alarm.name,
              hidden: true,
            },
          ],
        },
      ],
    }
  }, [alarm.name, i])
  const formio = React.useRef<any>()
  // delegate events, 保证事件永远用最新的callback
  const events = useRef<any>({})
  useEffect(() => {
    events.current = args
  }, [args])
  const listeners = {}
  for (const e in args) {
    if (e.startsWith('on')) {
      listeners[e] = (...args) => {
        events.current[e](...args)
      }
    }
  }
  return (
    <Form
      key={i}
      options={{
        class: css.alarmItem,
      }}
      form={form}
      formReady={(formio) => {
        formio.current = formio
        formio.submission = alarm
      }}
      {...args}
      {...listeners}
    />
  )
}

export interface Alarm {
  name: string
  period: Period
  symbols: Symbol[]
  conditions: Condition[]
}
function AlarmBuilder({alarm, onCreate}: {
  alarm?: Alarm
  onCreate: (alarm: Alarm) => void
}) {
  const [conds, setConds] = useState<Condition[]>(alarm?.conditions || [])
  console.log('alarms', conds)
  const [period, setPeriod] = useState<Period>(alarm?.period || Period.M15)
  const [alarmName, setAlarmName] = useState(alarm?.name || 'New Alarm')
  const [symbols, setSymbols] =useState<Symbol[]>(alarm?.symbols || ['EURUSD'])
  return (
    <div className={css.main}>
      <Grid.Container gap={2}>
        <Grid xs={6}>
          <Input
            label="Name: "
            value={alarmName}
            onChange={(e) => {
              setAlarmName(e.target.value)
            }}
          />
        </Grid>
        <Grid xs={6}>
          <Select
            placeholder="Period: "
            value={period + ''}
            onChange={(e) => {
              setPeriod(Number(e))
            }}
          >
            {Object.keys(Period)
              .filter((k) => !/^\d/.test(k))
              .map((k) => {
                return <Select.Option key={k} value={Period[k] + ''}>{k}</Select.Option>
              })}
          </Select>
        </Grid>
        <Grid xs={12}>
          <Select
            placeholder="Symbols: "
            value={symbols}
            multiple
            onChange={(e) => {
              setSymbols(e as any)
            }}
          >
            {Symbols
              .map((s) => {
                return <Select.Option key={s} value={s}>{s}</Select.Option>
              })}
          </Select>
        </Grid>
        <Grid xs={24}>
          <div style={{ width: '100%' }}>
            {conds.map((alarm, i) => {
              return (
                <AlarmItem
                  key={i}
                  alarm={alarm}
                  i={i}
                  onChange={(e) => {
                    if (e.changed) {
                      conds[i] = {
                        ...conds[i],
                        ...e.data,
                      }
                      console.log('change', e, conds, i)
                      setConds([...conds])
                    }
                  }}
                  onCustomEvent={(e) => {
                    console.log('onCustomEvent', e.component.key, e)
                    const key = e.component.key
                    if (key === 'remove') {
                      conds.splice(i, 1)
                      setConds([...conds])
                    }
                  }}
                />
              )
            })}
          </div>
        </Grid>
        <Grid xs={6} justify="center">
          <ButtonDropdown>
            <ButtonDropdown.Item
              main
              onClickCapture={(e) => {
                let btn = e.target as HTMLButtonElement
                ;(btn.nextElementSibling as HTMLButtonElement).querySelector('summary').click()
              }}
            >
              Add Condition
            </ButtonDropdown.Item>
            {Object.keys(AlarmFormMap).map((name, i) => {
              return (
                <ButtonDropdown.Item
                key={i}
                  onClick={() => {
                    console.log('add alarm', conds)
                    setConds(conds.concat(AlarmFormMap[name].empty()))
                  }}
                >
                  {name}
                </ButtonDropdown.Item>
              )
            })}
          </ButtonDropdown>
        </Grid>
        <Grid xs={6} justify="center">
          <Tooltip text={!conds.length && 'Add Condition first'} type="dark">
            <Button
              type="success"
              title="Click Add Condition first"
              disabled={!conds.length}
              onClick={(e) => {
                onCreate({
                  name: alarmName,
                  conditions: conds,
                  period: period,
                  symbols,
                })
              }}
            >
              Create
            </Button>
          </Tooltip>
        </Grid>
      </Grid.Container>
    </div>
  )
}

export default AlarmBuilder

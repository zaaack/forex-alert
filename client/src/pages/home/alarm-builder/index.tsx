import React, { useEffect, useRef, useState } from 'react'
import yup from 'yup'
import { IndicatorForm } from '../../../utils/indicator'
import css from './index.module.scss'
import { Form } from '@formio/react'
import { Period, Periods, Symbol, Symbols } from '../../../../../server/consts'
import { Condition, AlarmFormMap } from './conds'
import { Button, ButtonDropdown, ButtonGroup, Checkbox, Grid, Input, Select, Toggle, Tooltip, } from '@geist-ui/react'
import { ClientAlarm } from './types'


function CondItem({ alarm, i, ...args }: { alarm: Condition; i: number; [k: string]: any }) {
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

function AlarmBuilder({alarm, onCreate: onSave}: {
  alarm?: ClientAlarm | null
  onCreate: (alarm: ClientAlarm) => void
}) {
  const [conds, setConds] = useState<Condition[]>(alarm?.conds || [])
  console.log('alarms', conds)
  const [periods, setPeriods] = useState<Period[]>(alarm?.periods || [Period.H1])
  const [alarmName, setAlarmName] = useState(alarm?.name || 'New Alarm')
  const [symbols, setSymbols] =useState<string[]>(alarm?.symbols || ['EURUSD'])
  const [enable, setEnable] = useState(alarm? alarm.enable : true)
  return (
    <div className={css.main}>
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <Input
            label="Name: "
            width="100%"
            value={alarmName}
            onChange={(e) => {
              setAlarmName(e.target.value)
            }}
          />
        </Grid>
        <Grid xs={24} md={12}>
          <Select
            placeholder="Period: "
            multiple
            value={periods.map(String)}
            onChange={(e: string[]) => {
              setPeriods(e.map(Number))
            }}
          >
            {Periods.map((k) => {
                return <Select.Option key={k} value={k + ''}>{Period[k]}</Select.Option>
              })}
          </Select>
        </Grid>
        <Grid xs={24} md={12}>
          <Select
            placeholder="Symbols: "
            value={symbols}
            width="100%"
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
        <Grid xs={12} md={6} alignItems="center">
        <Checkbox checked={enable} size="large" onChange={e=>{
          setEnable(e.target.checked)
        }}>Enable</Checkbox>
        </Grid>
        <Grid xs={24}>
          <div style={{ width: '100%' }}>
            {conds.map((alarm, i) => {
              return (
                <CondItem
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
        <Grid xs={16} md={8}>
          <ButtonDropdown auto>
            <ButtonDropdown.Item
              main
              onClickCapture={(e) => {
                let btn = e.target as HTMLButtonElement
                ;(btn.nextElementSibling as HTMLButtonElement)?.querySelector('summary')?.click()
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
        <Grid xs={12} md={6}>
          <Tooltip text={!conds.length && 'Add Condition first'} type="dark">
            <Button
              type="success"
              title="Click Add Condition first"
              auto
              disabled={!conds.length}
              onClick={(e) => {
                onSave({
                  name: alarmName,
                  conds,
                  periods: periods,
                  symbols,
                  enable,
                })
              }}
            >
              Save
            </Button>
          </Tooltip>
        </Grid>
      </Grid.Container>
    </div>
  )
}

export default AlarmBuilder

import {
  Button,
  Card,
  Col,
  Description,
  Fieldset,
  Grid,
  Row,
  useTheme,
  useToasts,
} from '@geist-ui/react'
import React, { useState } from 'react'
import MainPage from '../../comps/Page'
import AlarmBuilder from './alarm-builder'
import { FaPlus, FaEdit, FaTimes } from 'react-icons/fa'
import { client, trpc } from '../../api/trpc'
import { ClientAlarm } from './alarm-builder/types'
import { Period } from '../../../../server/consts'
import MessageList from './message-list'
import type { Alarm, Prisma } from '.prisma/client'
import swal from 'sweetalert'
import { Condition } from './alarm-builder/conds'
import AlarmItem from './alarm-item'

type MainPage = 'alarmbuilder' | 'message'
function Home(props) {
  const alarms = trpc.useQuery(['alarm.list'])
  const [page, setPage] = useState<MainPage>('message')
  const [alarm, setAlarm] = useState<Alarm | null>(null)
  const [toasts, setToast] = useToasts()
  const theme = useTheme()
  return (
    <MainPage>
      <Grid.Container gap={2}>
        <Grid md={8}>
          <Card>
            <h4>
              Alarm List
              <Button
                size="small"
                style={{float: 'right', marginLeft: 10}}
                auto
                icon={<FaPlus />}
                onClick={(e) => {
                  setPage('alarmbuilder')
                  setAlarm(null)
                }}
              />
            </h4>
            {alarms.isLoading && <Description title="Loading..." />}
            {alarms.data &&
              alarms.data.map((alarm) => {
                return (
                  <AlarmItem
                    alarm={alarm}
                    onEdit={(a) => {
                      setAlarm(alarm)
                      setPage('alarmbuilder')
                    }}
                    onDeleted={(a) => {
                      alarms.refetch()
                    }}
                  />
                )
              })}
          </Card>
        </Grid>
        <Grid md={16}>
          {(() => {
            if (page === 'alarmbuilder') {
              const clientAlarm: ClientAlarm | null = alarm && {
                ...alarm,
                conds: alarm.conds as any as Condition[],
              }
              return (
                <AlarmBuilder
                  alarm={clientAlarm}
                  key={clientAlarm ? clientAlarm.id : 'new'}
                  onCreate={(alarmData) => {
                    let newAlarm = clientAlarm || (alarmData as any)
                    client
                      .mutation('alarm.createOrUpdate', newAlarm)
                      .then((r) => {
                        alarms.refetch()
                        setToast({
                          type: 'success',
                          text: `Alarm ${newAlarm.id ? 'updated' : 'created'}!`,
                        })
                      })
                      .catch((e) => {
                        console.error(e)
                        setToast({
                          type: 'error',
                          text: e.message,
                        })
                      })
                  }}
                />
              )
            } else if (page === 'message') {
              return <MessageList alarm={alarm} />
            }
          })()}
        </Grid>
      </Grid.Container>
    </MainPage>
  )
}

export default Home

import { Alarm } from '.prisma/client'
import { Description, Pagination, Table, Text } from '@geist-ui/react'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { Period } from '../../../../../server/consts'
import { trpc } from '../../../api/trpc'

const Limit = 10

function MessageList({ alarm }: { alarm?: Alarm | null }) {
  const [page, setPage] = useState(1)
  const messages = trpc.useQuery([
    'alarm.messages',
    {
      alarmId: alarm?.id,
      skip: (page - 1) * Limit,
      take: Limit,
    },
  ])
  return (
    <div>
      <Text h3>Messages</Text>
      {messages.isSuccess && !messages.data?.total && (
        <Text style={{ padding: 20, textAlign: 'center', color: '#ccc' }} size="2rem">
          Empty
        </Text>
      )}
      <Table
        hidden={!messages.data?.total}
        data={messages.data?.list.map((d) => {
          return {
            ...d,
            period: Period[d.period],
            alarm: `${d.alarm.name}(id:${d.alarm.id})`,
            createdAt: dayjs(d.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          }
        })}
      >
        <Table.Column prop="symbol" label="Symbol" />
        <Table.Column prop="period" label="Period" />
        <Table.Column prop="alarm" label="Alarm" />
        <Table.Column prop="createdAt" label="Time" />
      </Table>
      {(messages.data?.total || 0) > 0 && (
        <Pagination
          hidden={!messages.data?.total}
          page={page}
          limit={Limit}
          onChange={(p) => setPage(p)}
          count={messages.data?.total || 0}
        />
      )}
    </div>
  )
}

export default MessageList

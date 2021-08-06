import * as trpc from '@trpc/server'

import * as trpcExpress from '@trpc/server/adapters/express';
// import * as trpcNext from '@trpc/server/adapters/next';
import superjson from 'superjson'
import { createContext, createRouter } from './trpc'
import {authRouter} from './routers/auth-router'
import { alarmRouter } from './routers/alarm-router'
import express from 'express'
import path from 'path'
import {captcha} from './services/captcha';
import { fs, logger } from 'foy'
import cookieParser from 'cookie-parser'
import { ForexAlarm } from './services/forex-alarm';


export const forexAlarm= new ForexAlarm()


const router = createRouter()
.merge('alarm.', alarmRouter)
.merge('auth.', authRouter)

export const appRouter = router
export type AppRouter = typeof router

const app = express()

app.use(cookieParser())

const trpcHandler = trpcExpress.createExpressMiddleware({
  router,
  createContext,
  teardown: async () => {},
  transformer: superjson,
  onError({ error }) {
    logger.error(error)
  },
})
app.use(
  '/api/trpc',
  trpcHandler
)

app.use('/api/captcha', captcha.handler)

app.use(express.static(path.join(__dirname, './static'), {
  maxAge: '365d',
}))
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './static', 'index.html'))
})
const port = process.env.PORT || 4000

// TODO: 缓存请求, 通过 /price 补全数据
// forexAlarm.start()

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

import * as trpc from '@trpc/server'
// import * as trpcNext from '@trpc/server/adapters/next';
import superjson from 'superjson'
import { createContext, createRouter } from './trpc'
import {authRouter} from './routers/auth-router'
import express from 'express'
import path from 'path'
import {captcha} from './services/captcha';
import { logger } from 'foy'
import cookieParser from 'cookie-parser'


// push.send('测是')

const router = createRouter().merge('auth.', authRouter)

export const appRouter = router
export type AppRouter = typeof router

const app = express()

app.use(cookieParser())

const trpcHandler = trpc.createHttpHandler({
  router: appRouter,
  createContext: createContext as any,
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

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

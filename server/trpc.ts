import * as trpc from '@trpc/server'
import http from 'http';
import { PrismaClient, User } from '@prisma/client'
import { CreateContextFnOptions } from '@trpc/server'
import {Request, Response} from 'express'
import dayjs from 'dayjs';
import * as trpcExpress from '@trpc/server/adapters/express';
import { logger } from 'foy';
export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }]
})
prisma.$on('query', e => {
  logger.log("Query: ", e.query);
  logger.log("Params: ", e.params);
})
export const createContext = async ({req, res}: trpcExpress.CreateExpressContextOptions) => {
  let _me: User | null = null
  return {
    req,
    res,
    prisma,
    user: prisma.user,
    alarm: prisma.alarm,
    message: prisma.message,
    async getMeOrError() {
      let me = await this.getMe()
      if (!me) {
        throw trpc.httpError.unauthorized('need login')
      }
      return me
    },
    async getMe() {
      const uid = Number(req.cookies['uid'])
      const utk = req.cookies['utk']
      let me = _me || await prisma.user.findFirst({where: {id: uid}})
      if (me?.token !== utk || dayjs().isAfter(me?.tokenExpiresAt)) {
        me = null
        res.clearCookie('uid')
        res.clearCookie('utk')
      }
      _me = me
      return me
    },
    setToken(u: User, remember?: boolean) {
      res.cookie('uid', u.id, { httpOnly: true, maxAge: remember?1000 * 60 * 60 * 24 * 365: 0 })
      res.cookie('utk', u.token, { httpOnly: true, maxAge: remember?1000 * 60 * 60 * 24 * 365: 0 })
    }
  }
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}

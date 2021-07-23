import * as trpc from '@trpc/server'
import http from 'http';
import { PrismaClient, User } from '@prisma/client'
import { CreateContextFnOptions } from '@trpc/server'
import {Request, Response} from 'express'
import dayjs from 'dayjs';
export const prisma = new PrismaClient()


export const createContext = async ({req, res}: CreateContextFnOptions<Request, Response>) => {
  return {
    req,
    res,
    prisma,
    user: prisma.user,
    async getMe() {
      const uid = req.cookies['uid']
      const utk = req.cookies['utk']
      let me = await prisma.user.findFirst({where: {id:uid}})
      if (me?.token !== utk || dayjs().isAfter(me?.tokenExpiresAt)) {
        me = null
        res.clearCookie('uid')
        res.clearCookie('utk')
      }
      return {...me, token: null}
    },
    setToken(u: User, remember?: boolean) {
      res.cookie('uid', u.id)
      res.cookie('utk', u.token, { httpOnly: true, maxAge: remember?1000 * 60 * 60 * 24 * 365: 0 })
    }
  }
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}

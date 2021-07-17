import * as trpc from '@trpc/server'
export const createContext = async () => {

  return {
    user: null as any
  }
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}

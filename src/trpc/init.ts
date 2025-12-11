import { initTRPC } from '@trpc/server'
import { cache } from 'react'
import superjson from 'superjson'
export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' }
})
// 避免导出整个 t 对象
// 因为它不是很具描述性。
// 例如，t 变量的使用
// 在 i18n 库中很常见。
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
})
// 基础 router 和 procedure 助手函数
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const baseProcedure = t.procedure

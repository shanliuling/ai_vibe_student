import { createTRPCRouter } from '../init'

import { messagesRouter } from '@/modules/server/procedures'
export const appRouter = createTRPCRouter({
  messages: messagesRouter,
})
// 导出 API 的类型定义
export type AppRouter = typeof appRouter

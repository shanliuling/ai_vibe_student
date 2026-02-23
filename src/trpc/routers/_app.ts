import { projectsRouter } from '@/modules/projects/server/procedures'
import { createTRPCRouter } from '../init'

import { messagesRouter } from '@/modules/messages/server/procedures'
export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
})
// 导出 API 的类型定义
export type AppRouter = typeof appRouter

import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'
import { inngest } from '@/inngest/client'
export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(async (opts) => {
      //  触发后台任务事件
      await inngest.send({
        name: 'test/hello.world2',
        data: { email: opts.input.text },
      })
    }),
  createAI: baseProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      }
    }),
})
// 导出 API 的类型定义
export type AppRouter = typeof appRouter

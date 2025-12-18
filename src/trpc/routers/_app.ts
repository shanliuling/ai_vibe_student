import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'
export const appRouter = createTRPCRouter({
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

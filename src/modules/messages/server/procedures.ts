import { inngest } from '@/inngest/client'
import prisma from '@/lib/db'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'
import { z } from 'zod'

// tRPC Router 实例：负责定义与消息业务相关的后端 API 接口
export const messagesRouter = createTRPCRouter({
  // 获取所有消息
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: '项目ID不能为空' }),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.message.findMany({
        where: {
          projectId: input.projectId, // 过滤：只找这个项目的消息
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
    }),
  // 处理客户端端创建新消息的请求
  create: baseProcedure
    // 输入校验：使用 Zod 定义 Schema，确保入参 value 为非空字符串
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: '内容不能为空' })
          .max(10000, { message: '内容不能超过10000字符' }),
        projectId: z.string().min(1, { message: '项目ID不能为空' }),
      }),
    )
    // 业务逻辑处理：执行数据持久化及触发后台任务
    .mutation(async ({ input }) => {
      // 1. 数据持久化：将验证后的入参写入数据库的 Message 表，预设 role 和 type
      const createdMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
          content: input.value,
          role: 'USER',
          type: 'RESULT',
        },
      })

      // 2. 异步任务编排：通过 Inngest client 派发事件，触发后端的 AI  处理流程
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      })

      // 3. 响应结果：将数据库持久化返回的完整对象（含主键 UUID 等）返回给客户端
      return createdMessage
    }),
})

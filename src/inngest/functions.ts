import { inngest } from './client'

export const helloWorld = inngest.createFunction(
  { id: 'hello-world2' }, // 任务的唯一ID
  { event: 'test/hello.world2' }, // 监听的指令名称
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '10s') // 等待1秒
    return { message: `Hello ${event.data.email}!` } // 返回数据
  }
)

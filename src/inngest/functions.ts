import { inngest } from './client'
import { Agent, openai, createAgent } from '@inngest/agent-kit'
import { Sandbox } from '@e2b/code-interpreter'
import { getSandbox } from './utils'
export const helloWorld = inngest.createFunction(
  { id: 'hello-world2' }, // 任务的唯一ID
  { event: 'test/hello.world2' }, // 监听的指令名称
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('vibe-nextjs-student')

      return sandbox.sandboxId
    })

    const codeAgent = createAgent({
      name: 'codeAgent',
      system:
        '你是一位拥有 5 年以上经验的 Next.js 专家，精通 React、TypeScript、Tailwind CSS 以及 App Router / Pages Router 的混合开发。你对 Next.js 的数据流（Server Components, Client Components, Server Actions）有深刻理解。',
      model: openai({
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com',
        apiKey: process.env.OPENAI_API_KEY,
      }),
    })
    const { output } = await codeAgent.run(
      `请协助回答或处理以下关于 Next.js 的问题：${event.data.value}`,
    )

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `http://${host}`
    })
    return { output, sandboxUrl } // 返回数据
  },
)

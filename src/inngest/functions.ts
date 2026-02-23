import { inngest } from './client'
import {
  Agent,
  gemini,
  createAgent,
  createTool,
  createNetwork,
  openai,
  Tool,
} from '@inngest/agent-kit'
import { Sandbox } from '@e2b/code-interpreter'
import { getSandbox, lastAssistantMessageContent } from './utils'
import z from 'zod'
import { PROMPT } from '@/prompt'
import prisma from '@/lib/db'
interface AgentState {
  summary: string
  files: { [path: string]: string }
}

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' }, // 任务的唯一ID
  { event: 'code-agent/run' }, // 监听的指令名称
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('vibe-nextjs-student')

      return sandbox.sandboxId
    })

    const codeAgent = createAgent<AgentState>({
      name: 'codeAgent',
      description: '金林专用AI 编程助手',
      system: PROMPT,
      model: openai({
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com',
        apiKey: process.env.OPENAI_API_KEY,
        defaultParameters: {
          temperature: 0.1, // 降低随机性，让 AI 更专注
        },
        // model: gemini({
        //   model: 'gemini-2.5-flash',
        //   apiKey: process.env.GEMINI_API_KEY,
        //   defaultParameters: {
        //     generationConfig: {
        //       temperature: 0.1,
        //     },
        //   },
      }),
      tools: [
        createTool({
          // 总结：它到底在干嘛？
          // 传话筒：把 AI 想敲的命令（字符串）传给远程的 Linux 电脑。
          // 记录员：实时把远程电脑屏幕上跳出来的字（日志）记录下来。
          // 反馈循环：把最终的结果（不管是成功还是报错）原封不动地告诉 AI。
          // 如果没有这段代码，AI 就像是对着空气喊口号，喊完不知道这里有没有这台电脑，也不知道命令到底跑通了没。有了它，AI 才能根据报错信息进行自我修正
          name: 'terminal',
          description: '使用终端执行命令', // 工具的描述
          // 参数对象
          parameters: z.object({
            command: z.string(), // 命令
          }),

          // 1. command: AI 想敲的命令，比如 "npm install" 或 "ls -la"。
          // 2. step: 用于开启一个“稳健的步骤”，保证这行命令不会因为超时或断网而白敲。
          handler: async ({ command }, { step }) => {
            return await step?.run('terminal', async () => {
              const buffers = { stdout: '', stderr: '' } // 用来记录命令执行过程中的所有输出。

              try {
                const sandbox = await getSandbox(sandboxId)
                // 真的敲命令
                const result = await sandbox.commands.run(command, {
                  // 监听：命令每吐出一行字，我就赶紧记下来。 为什么要一点点记？因为有时候输出太长，不能等全部跑完再记。
                  onStdout: (chunk) => {
                    buffers.stdout += chunk
                  },
                  onStderr: (chunk) => {
                    buffers.stderr += chunk
                  },
                })
                return result.stdout
              } catch (error) {
                console.error(
                  `错误: ${error},buffers: ${buffers.stderr} and ${buffers.stdout}`,
                )
                return `错误: ${error},buffers: ${buffers.stderr} and ${buffers.stdout}`
              }
            })
          },
        }),
        createTool({
          name: 'createOrUpdateFiles',
          description: '在沙箱中创建或更新文件',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          // 1. files: AI 传进来的，想写什么文件、写在哪。
          // 2. step: Inngest 的控制器，用来开启一个“稳健的步骤”。
          // 3. network: 整个 AI 网络的管家，管着所有记忆。
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              'createOrUpdateFiles',
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {} // “记事本”
                  const sandbox = await getSandbox(sandboxId) // e2b沙箱
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content) // 动作A（物理）：真的把代码写进那台沙箱电脑的硬盘里
                    updatedFiles[file.path] = file.content // 动作B（记忆）：更新 AI 的“记忆”，让它知道文件变了
                  }
                  return updatedFiles
                } catch (error) {
                  console.error('错误:', error)
                }
              },
            )

            if (newFiles && typeof newFiles === 'object') {
              // [手动同步] 将刚才 updateFiles 步骤产生的新文件列表，强制赋值给当前 Agent 的内存状态
              // 刚才那个 step.run 虽然跑完了，但外面的 network.state.data.files 根本没变。
              // 因为刚才是在盒子里改的副本。
              // 所以这里必须手动把递出来的结果（newFiles），重新赋值给外面的变量。
              network.state.data.files = newFiles
            }
          },
        }),
        createTool({
          name: 'readFile',
          description: '读取文件内容',
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }: Tool.Options<AgentState>) => {
            return await step?.run('readFile', async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const contents = []
                for (const file of files) {
                  // 关键动作：去沙箱硬盘里把文件内容读出来(字符串)
                  const content = await sandbox.files.read(file)
                  // 把结果存进数组：{ path: "xxx", content: "xxx" }
                  contents.push({ path: file, content })
                }
                return JSON.stringify(contents)
              } catch (error) {
                console.error('错误:', error)
                return error
              }
            })
          },
        }),
      ],
      // 生命周期
      lifecycle: {
        // 每当 AI 回答完，都会触发这个函数
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantMessageContent(result)
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              // 如果包含，就将 AI 的回答存入 network.state.data.summary
              network.state.data.summary = lastAssistantMessageText
            }
          }
          return result
        },
      },
    })
    //  这是一个 “死循环控制器” —— 它命令 codeAgent 一直工作，直到 AI 在状态里留下了 summary（任务总结）才会停下来
    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeAgent],
      maxIter: 15, // 最多迭代15次
      router: async ({ network }) => {
        const summary = network.state.data.summary
        if (summary) {
          return
        }
        return codeAgent
      },
    })

    //  执行过程：它会根据你写的 router （那个死循环控制器）不断地让 Agent 思考、调用工具、再思考……直到 router 说“停，任务结束”。
    // 返回值 (result)：当整个流程停下来时，result 包含了这次运行的所有记忆（比如对话历史、工具调用结果）和最终状态数据。
    const result = await network.run(event.data.value)

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `http://${host}`
    })

    await step.run('save-result', async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            content: 'AI生成完毕但未生成摘要',
            role: 'ASSISTANT',
            type: 'ERROR',
          },
        })
      }
      return await prisma.message.create({
        data: {
          content: result.state.data.summary,
          role: 'ASSISTANT',
          type: 'RESULT',
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: 'Fragment',
              files: result.state.data.files,
            },
          },
        },
      })
    })

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  },
)

// createOrUpdateFiles：AI 写代码 -> 存入沙箱 -> AI 记住。
// terminal：AI 跑代码 -> 报错 -> AI 看到错误。
// readFile：AI 想修 Bug -> 读取文件源码 -> 看懂代码逻辑 -> 再次调用写文件去修复。

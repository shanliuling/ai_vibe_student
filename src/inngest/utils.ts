import Sandbox from '@e2b/code-interpreter'
import { AgentResult, TextMessage } from '@inngest/agent-kit'

// 使用场景：
// 当您已经有一个运行中的沙箱（通过 Sandbox.create() 创建的），后续想要重新连接到它时，就用这个函数。
// 比如：
// 用户开始一个任务 → Sandbox.create('vibe-nextjs-student') 创建沙箱
// 把 sandboxId 存起来
// 后续步骤想继续操作这个沙箱 → getSandbox(sandboxId) 重新连接

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId)
  return sandbox
}

// 获取 assistant 最后一条回答 , 它把 AI 的最新回复从复杂的格式统一转换成最简单的纯文本字符串，方便你后续做判断或存入数据库
export function lastAssistantMessageContent(result: AgentResult) {
  const lastAssistantMessageIndex = result.output.findLastIndex(
    (m) => m.role === 'assistant',
  )
  const message = result.output[lastAssistantMessageIndex] as
    | TextMessage
    | undefined

  // 无论底层数据是纯字符串还是分段的富文本对象，这段代码都能保证返回一个拼接好的完整字符串（或者 undefined）。
  return message?.content
    ? typeof message?.content === 'string'
      ? message?.content
      : message?.content.map((c) => c.text).join('')
    : undefined
}

import Sandbox from '@e2b/code-interpreter'

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

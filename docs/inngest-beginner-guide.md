# 🚀 实战演练：用 Inngest 打造“新用户全自动流程” (Notion 版)

> 💡 **复制提示**：想要在 Notion 里完美显示？请在 VS Code 按 `Ctrl+Shift+V` 打开预览，然后**在预览界面全选复制**。

---

## 🎯 我们的目标

与其讲枯燥的概念，不如直接做一个真实功能。
我们要实现一个**新用户注册后的自动化流程**：

1.  用户注册成功 (触发事件)
2.  **立即**：发送欢迎邮件
3.  **等待 3 天**：检查用户是否升级了 Pro 会员
4.  **结果分支**：
    - 如果没升级 -> 发送 5 折优惠券
    - 如果升级了 -> 发送“尊贵会员”感谢信

整个过程完全自动化，你只需要写一次代码。

---

## 🏗️ 第一步：定义你的“暗号” (Event)

首先，我们要告诉 Inngest 有个叫“用户注册”的事情发生了。
在 Inngest 里，我们不需要预先定义类型文件（虽然可以），直接给它起个名就行：`app/user.created`。

数据结构大概长这样：

```json
{
  "name": "app/user.created",
  "data": {
    "userId": "u_123456",
    "email": "zhangsan@example.com"
  }
}
```

---

## ✍️ 第二步：编写“干活的工人” (Function)

打开 [`src/inngest/functions.ts`](file:///e:/A_student/ai_vibe_student/src/inngest/functions.ts)，把下面的代码粘贴进去。

> 💡 **代码逐行详解** (复制进去仔细看注释):

```typescript
import { inngest } from './client'

export const userOnboardingFlow = inngest.createFunction(
  // 1. 给这个任务起个后台显示的 ID (必须唯一)
  { id: 'user-onboarding-flow' },

  // 2. 告诉它监听什么暗号 (事件)
  { event: 'app/user.created' },

  // 3. 核心逻辑开始！
  async ({ event, step }) => {
    // Step A: 发送欢迎邮件
    // 为什么要用 step.run? 因为如果这步网络挂了，Inngest 会自动帮你重试，直到成功
    await step.run('send-welcome-email', async () => {
      console.log(`正在给 ${event.data.email} 发送欢迎邮件...`)
      // 真实场景：await emailService.send(...)
      return { sent: true }
    })

    // Step B: 睡个觉，等待 3 天
    // 哪怕服务器重启，它也会精准地在 3 天后醒来
    await step.sleep('wait-for-3-days', '3d')

    // Step C: 醒来后，检查用户是否升级
    // 这里的 step.run 返回值会被记录下来
    const isPro = await step.run('check-user-status', async () => {
      // 真实场景：return await db.users.find(event.data.userId)
      // 模拟：随机返回 true/false
      return Math.random() > 0.5
    })

    // Step D: 根据结果发不同的邮件
    if (isPro) {
      await step.run('send-vip-thanks', async () => {
        console.log(`发送 VIP 感谢信给 ${event.data.email}`)
      })
    } else {
      await step.run('send-discount-coupon', async () => {
        console.log(`发送 5 折优惠券给 ${event.data.email}`)
      })
    }
  }
)
```

---

## � 第三步：连接电源 (注册 Function)

写好了函数，必须告诉 Next.js 它的存在。
打开 [`src/app/api/inngest/route.ts`](file:///e:/A_student/ai_vibe_student/src/app/api/inngest/route.ts)：

```typescript
import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { helloWorld, userOnboardingFlow } from '../../../inngest/functions' // <--- 1. 导入你的新函数

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    userOnboardingFlow, // <--- 2. 把它加到数组里
  ],
})
```

---

## 🔫 第四步：扣动扳机 (触发 Event)

现在一切就绪，只需要在用户点击“注册”按钮的地方，发一个信号。
假设你在写一个注册接口 (Server Action 或 API Route):

```typescript
// 你的业务代码文件...
import { inngest } from '@/inngest/client'

export async function registerUser(email: string) {
  // 1. 数据库创建用户...
  const user = await db.create({ email })

  // 2. � 发送信号给 Inngest
  await inngest.send({
    name: 'app/user.created', // 必须和 Function 里的监听名字一模一样
    data: {
      userId: user.id,
      email: user.email,
    },
  })
}
```

---

## � 第五步：看大片 (本地调试)

这一步最爽。不用真的发邮件，直接看可视化流程。

1.  运行 `npx inngest-cli@latest dev`
2.  打开 `http://localhost:4567`
3.  点击右上角 **"Test Event"**
4.  输入 Event Name: `app/user.created`
5.  输入 Data: `{ "email": "test@demo.com", "userId": "1" }`
6.  点击 **"Send Event"**

👉 **看效果**：
你会看到一个新的 Run 出现了。
它会显示：

- ✅ `send-welcome-email` (已完成)
- ⏳ `wait-for-3-days` (正在睡眠中...)

你可以点击控制台里的 **"Fast Forward 3d"** 按钮，强行让它在这个虚拟世界里度过 3 天，马上看到后续的分支逻辑执行！

---

## 总结

**Inngest 的开发就像在写剧本：**

1.  **写剧本** (`functions.ts`): 定义好第一步干嘛，第二步干嘛。
2.  **报备剧组** (`route.ts`): 把剧本在这个文件里注册一下。
3.  **喊 Action** (`inngest.send`): 在业务代码里触发开始。

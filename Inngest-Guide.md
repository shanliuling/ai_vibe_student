# Inngest Agent Kit 全面入门指南

这份文档专为你当前的 **AI Vibe Student** 项目编写，用来解释你照着教程敲的代码背后的 **Inngest Agent Kit** 核心概念。

## 1. 宏观架构：不仅仅是一个 Agent

你可能会觉得 `createAgent` 只是创建了一个 AI。实际上，Inngest Agent Kit 的运行是一个 **Network（网络）** 的概念。即使你只定义了一个 Agent，它也是在这个“网络”里跑的。

- **Network (网络)**：这是一个虚拟的“办公室”。所有的 Agent、Memory（记忆）、State（共享状态）都在这个办公室里。
- **State (状态)**：这是办公室里的白板。任何 Agent 都能在上面写东西，任何 Tool 也能读上面的东西。这就是 `network.state.data` 的由来。

## 2. 核心组件详解

### 2.1 Agent (超级员工)

你用 `createAgent` 创建的就是一个员工。它有三个核心部分：

- **System Prompt (大脑)**：它的初始设定，告诉它自己是谁（比如“金林专用AI编程助手”）。
- **Tools (双手)**：它能干什么。如果没有 Tools，它就只是一个聊天机器人。有了 `terminal` Tool，它就能操作服务器。
- **Lifecycle (神经反射)**：这是你可以插入代码的地方。比如 `onResponse`，你可以理解为“员工每说一句话，经理（你）就要检查一下”。

### 2.2 Network State (共享的数据总线)

在你的代码里：

```typescript
network.state.data.summary = ...
```

这并不是 `network` 对象自带了一个叫 `summary` 的属性，而是利用了 **Shared State（共享状态）** 机制。

- **`network.state.data`**：这是一个可以存放任意 JSON 数据的容器。
- **为什么这么设计？** 为了让不同的 Agent 和 Tools 之间能传数据。
  - 比如 Agent A 负责写代码，把文件名存进 `state.data.files`。
  - Agent B 负责测试，它就可以从 `state.data.files` 里读取文件名来运行测试。
  - 甚至 Tools 也可以读写这里的数据（比如 `createOrUpdateFiles` 工具就把文件内容存进了 `state.data.files`）。

### 2.3 Step (进度存档)

在 `inngest.createFunction` 里，你反复使用了 `step.run`：

```typescript
const sandboxId = await step.run('get-sandbox-id', async () => { ... })
```

这是 Inngest 最强大的特性：**Durable Execution（持久化执行）**。

想象一下，如果你的代码跑了很久，比如 Agent 正在思考或者正在下载大文件，突然服务器挂了/超时了/发布新代码重启了：

- **没有 `step.run`**：整个函数从头开始跑，又创建了一个新沙箱（旧的就僵尸了，浪费钱），又重新思考一遍（浪费 Token）。
- **有 `step.run`**：Inngest 会记录：“步奏 `get-sandbox-id` 已经跑过了，结果是 `abc-123`”。重启后，它会**跳过**这一步，直接返回 `abc-123`，继续往下跑。

## 3. 你的代码逻辑全解析

结合你敲的代码，整个流程是这样的：

1.  **Function Entry (函数入口)**：
    当收到 `test/hello.world2` 事件时，Inngest 唤醒这个函数。

2.  **Sandbox Setup (环境准备)**：
    `step.run('get-sandbox-id')` -> 创建或恢复一个 E2B 沙箱。这是代码运行的“真机环境”。

3.  **Agent Definition (定义大脑)**：
    `createAgent(...)` -> 并没有运行 Agent，只是定义了这个 Agent 长什么样。
    - **关键点**：你在 `lifecycle.onResponse` 里加了逻辑。
    - **目的**：你想偷听 Agent 的内心独白。如果它总结了某些 `<task_summary>`，你就把这个总结存到 `network.state.data.summary` 里。

4.  **Running the Agent (开始工作)**：
    `codeAgent.run(...)` -> 这才是真正开始跑。
    - Agent 思考 ->
    - 发现需要跑命令 ->
    - 调用 `terminal` Tool ->
    - 拿到命令结果 ->
    - 再思考 ->
    - 得出最终结论。

5.  **Output (输出结果)**：
    最后返回 `output`（对话历史）和 `sandboxUrl`（预览链接）。

## 4. 常见疑问解答

### Q: 为什么那个 `utils.ts` 里的 `lastAssistantMessageContent` 看起来那么复杂？

**A:** 因为 Inngest Agent Kit 为了支持多模态（未来可能发图片、发语音），把消息内容设计得很灵活。

- 有时候是纯文本字符串 `"Hello"`。
- 有时候是数组 `[{ type: 'text', text: 'Hello' }, { type: 'image', url: '...' }]`。
  所以那个工具函数必须能处理所有这些情况，保证最后给你吐出来的是一段干净的文本。

### Q: 我怎么调试这个 `network.state`？

**A:** 最好的办法是在本地启动 Inngest Dev Server (`npx inngest-cli@latest dev`)。

- 在 Dashboard 里，你可以点开每一个 `step`。
- 虽然你看不到 Agent 内部的思考过程（那是黑盒），但你可以看到由于 `lifecycle` 触发而导致的 State 变化（如果我们在那里打了 log）。或者你可以直接在 `onResponse` 里加 `console.log(network.state.data)`，这些 log 会显示在 Dev Server 的控制台里。

---

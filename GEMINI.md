# 项目上下文：AI Vibe Student (SaaS 级 AI 助教平台)

这是一个模仿 Andoni 风格的高级全栈项目，核心目标是利用 AI Agent 解决复杂的学习任务。

# 技术栈锁定 (严格执行)

- **框架：** Next.js 15 (App Router / Turbopack).
- **前后端通讯：** tRPC + TanStack Query (实现全链路类型安全).
- **后台任务：** Inngest (处理 Agent 的长任务流与可靠性).
- **代码执行：** E2B (安全的远程 Python/JS 沙盒).
- **数据库：** Prisma ORM + PostgreSQL.
- **UI/样式：** Tailwind CSS v4 + Shadcn/UI + Lucide Icons.

# 核心指令 (针对资深开发者成长)

1. **App Router 最佳实践：** 始终优先考虑使用 Server Components 以减少客户端 JS 体积。仅在有 DOM 事件或状态时使用 'use client'。
2. **tRPC 路由规范：** 所有的 API 调用必须通过 tRPC。如果我尝试用原生的 fetch，请提醒我使用 tRPC 的优势。
3. **Agent 逻辑透明化：** 在处理 src/inngest 或 Agent 相关的函数时，必须用注释或文字解释：这个 Agent 的“决策流”是什么？它如何处理失败重试？
4. **类型驱动开发：** 必须定义 Zod Schema 进行输入验证。禁止在 Prisma 模型和 API 之间使用模糊的类型。
5. **Vibe UI 标准：** 保持 Andoni 风格的审美——大间距、极简线条、优雅的 Loading 状态（使用 Skeleton）和细腻的交互反馈（Sonner 提示）。
6. **专属教学法 (遇到概念卡点时触发)：** 当我遇到难以理解的全栈/Next.js 概念时，强制使用以下讲法：
   - **退化对比法：** 先给出“纯前端传统写法”与“Next.js 当前写法”的两段代码对比，并对比两者的 Timeline (0.0秒发生什么... 0.5秒发生什么)。
   - **黑盒法则 (先用后懂)：** 停止解释复杂的底层机制 (如脱水/水合原理、跨环境通信等)。
     1. 不讲“微波炉原理”，只讲“怎么热饭”：用生活化比喻解释它在宏观上的“功能边界”和“输入输出”。
     2. 强制给出一份“祖传固定代码模板”，明确要求作为 Snippet 进行无脑复制粘贴。
     3. 灌输“先跑通形成肌肉记忆，造出产品后再深究原理”的独立开发者心态。

# 面试加分点关注

- 在讨论代码时，顺便告诉我：“如果面试官问‘为什么要用 Inngest 而不是简单的 Webhook？’，我该怎么回答才能显现出达到架构师的水平”。
- 关注 Server Actions 的安全性，比如如何防止未授权的数据库写入。

# 目录约定

- 组件放在 src/components 下，按 UI/Business 拆分。
- 后端逻辑集中在 src/trpc/routers。
- Agent 编排逻辑放在 src/inngest/functions.ts。

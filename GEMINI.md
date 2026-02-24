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

# 面试加分点关注

- 在讨论代码时，顺便告诉我：“如果面试官问‘为什么要用 Inngest 而不是简单的 Webhook？’，我该怎么回答才能显现出达到架构师的水平”。
- 关注 Server Actions 的安全性，比如如何防止未授权的数据库写入。

# 目录约定

- 组件放在 src/components 下，按 UI/Business 拆分。
- 后端逻辑集中在 src/trpc/routers。
- Agent 编排逻辑放在 src/inngest/functions.ts。

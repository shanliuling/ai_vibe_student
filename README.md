# AI Vibe Student

这是一个基于 Next.js 开发的全栈项目，核心目标是打造一个**智能化的全自动 AI Web 开发测试平台**。本项目集成了大语言模型（如 DeepSeek）、Inngest 后台任务系统与 E2B (Code Interpreter) 云端沙盒技术，能够让 AI 根据自然语言需求自动编写代码、安装依赖，并在云端启动真实的网页服务供用户直接预览。

> 注：本项目仍在开发完善中。

---

## 🚀 核心功能

- **自然语言开发 (Vibe Coding)**：通过对话让 AI 自动生成页面结构、业务逻辑和样式。
- **云端沙盒隔离执行**：借助 E2B，为 AI 提供独立的远程 Linux 开发环境，动态构建响应。
- **自动依赖管理**：AI 具备在沙盒中自主运行终端命令（如 `npm install`）和诊断报错的能力。
- **长时会话管理 (Background Jobs)**：使用 Inngest 编排 AI 的思考迭代与容错重试流程，确保服务的鲁棒性。
- **强类型端到端 API**：使用 tRPC 和 Prisma 提供稳定安全的后端数据交互。

---

## 🛠️ 技术栈 (Tech Stack)

### 核心框架

- **[Next.js 15](https://nextjs.org/)** - React 框架 (App Router, 服务端组件)
- **[React 19](https://react.dev/)** - 核心 UI 库
- **[TypeScript](https://www.typescriptlang.org/)** - 静态类型检查

### UI 与样式

- **[Tailwind CSS v4](https://tailwindcss.com/)** - 实用优先的 CSS 框架
- **[Shadcn UI](https://ui.shadcn.com/)** - 现代化、易定制的高级 UI 组件库
- **[Lucide React](https://lucide.dev/)** - 图标库

### 核心业务设施

- **[Inngest](https://www.inngest.com/)** - 长时任务编排与 AI Agent 流程控制
- **[E2B Code Interpreter](https://e2b.dev/)** - AI 云端沙盒环境
- **[@inngest/agent-kit](https://github.com/inngest/agent-kit)** - AI Agent SDK 工具包

### 数据库与接口

- **[Prisma ORM](https://www.prisma.io/)** - 数据库对象关系映射（PostgreSQL / Neon 原生支持）
- **[Neon Database](https://neon.tech/)** - Serverless 云数据库
- **[tRPC](https://trpc.io/)** - 端到端类型安全的 API 通讯层

---

## 📂 核心目录结构

\`\`\`text
ai_vibe_student/
├── prisma/ # Prisma 数据库 Schema 定义和迁移历史
│ └── schema.prisma # 数据库模型蓝图
├── sandbox-templates/ # E2B 沙盒的自定义基础镜像/环境变量配置
├── src/ # 源代码
│ ├── app/ # Next.js App Router 页面和 API 路由
│ ├── components/ # 存放所有 React 组件
│ │ ├── ui/ # Shadcn 基础 UI 组件
│ │ └── ... # 业务组件
│ ├── inngest/ # Inngest 任务与 AI Agent 函数定义（如 functions.ts）
│ ├── lib/ # 常用工具函数（例如 utils.ts）
│ ├── prompt.ts # 大语言模型的系统级提示词 (System Prompt) 约束配置
│ └── trpc/ # tRPC 服务端与客户端接口定义和配置
├── package.json # 项目依赖
└── .env # 环境变量配置 (数据库连接、API Key 等)
\`\`\`

---

## 💻 快速开始

如果你想在本地开发本平台的核心功能，确保已配置好必要的 API Key (如 \`OPENAI_API_KEY\`, \`E2B_API_KEY\`, \`DATABASE_URL\`)：

1. **安装依赖:**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **数据库同步:**
   \`\`\`bash
   npx prisma db push

   # 或者执行迁移：npx prisma migrate dev

   \`\`\`

3. **启动开发服务器:**
   \`\`\`bash
   pnpm run dev
   \`\`\`

4. **开启 Inngest 本地开发环境:**
   新建一个终端，运行：
   \`\`\`bash
   npx inngest-cli@latest dev
   \`\`\`
   这将在本地提供 Inngest 仪表盘（通常在 http://localhost:8288）。

# 第14章：首页仪表盘 - 项目列表与创建表单

## 📚 本章概述

本章实现了项目首页仪表盘，用户可以：

- 查看所有已创建的项目列表
- 通过输入框创建新项目
- 使用模板快速启动项目
- 创建成功后自动跳转到项目详情页

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                     (home)/page.tsx                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Hero Section                        │   │
│   │   🖼️ Logo                                        │   │
│   │   "Build something with Vibe"                   │   │
│   │   "Create apps and websites by chatting with AI"│   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              ProjectForm                         │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │  TextareaAutosize (输入框)              │   │   │
│   │   │  "你想构建什么？"                        │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │   [Enter 发送]                        [↑ 提交]   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Template Buttons                    │   │
│   │   🎬 Netflix   📦 Dashboard   📋 Kanban   ...   │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              ProjectsList                        │   │
│   │   ┌───────┐ ┌───────┐ ┌───────┐                │   │
│   │   │ 项目1 │ │ 项目2 │ │ 项目3 │                │   │
│   │   │ 2小时前│ │ 1天前 │ │ 3天前 │                │   │
│   │   └───────┘ └───────┘ └───────┘                │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📁 核心文件

| 文件                                              | 作用                       |
| ------------------------------------------------- | -------------------------- |
| `src/app/(home)/page.tsx`                         | 首页页面组件               |
| `src/app/(home)/layout.tsx`                       | 首页布局（不含侧边栏）     |
| `src/modules/home/ui/components/project-form.tsx` | 项目创建表单               |
| `src/modules/home/ui/components/project-list.tsx` | 项目列表展示               |
| `src/modules/home/constants.ts`                   | 模板配置常量               |
| `src/modules/projects/server/procedures.ts`       | 后端 API（create/getMany） |

---

## 📂 Part 1：Next.js 路由组架构

### 什么是路由组？

路由组使用 `(groupName)` 语法，**不会影响 URL 路径**，但可以共享布局。

```
src/app/
├── (home)/           ← 路由组：首页相关
│   ├── layout.tsx    ← 首页专用布局（无侧边栏）
│   └── page.tsx      ← / 路由
├── projects/
│   └── [projectId]/
│       └── page.tsx  ← /projects/:id 路由
└── layout.tsx        ← 全局布局
```

### 布局嵌套关系

```
RootLayout (全局)
├── (home)/layout.tsx    → 首页：居中布局，无侧边栏
└── projects/[id]/       → 项目详情：三栏布局，有侧边栏
```

### 首页布局代码

```tsx
// src/app/(home)/layout.tsx
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="flex-1 flex flex-col">{children}</main>
}
```

---

## 📝 Part 2：项目创建表单 (ProjectForm)

### 表单验证：Zod Schema

```tsx
// src/modules/home/ui/components/project-form.tsx
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'value is required' })
    .max(10000, { message: 'value is too long' }),
})

// 在 useForm 中使用
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema), // 🔑 连接 Zod 和 react-hook-form
  defaultValues: {
    value: '',
  },
})
```

### ZodResolver 的作用

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Zod Schema │────→│  zodResolver │────→│ react-hook-form│
│  (验证规则)   │     │  (翻译官)     │     │   (表单逻辑)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 自适应高度输入框

```tsx
import TextareaAutosize from 'react-textarea-autosize'

;<TextareaAutosize
  {...field}
  minRows={2} // 最小2行
  maxRows={8} // 最大8行
  className="w-full resize-none border-none bg-transparent"
  placeholder="你想构建什么？"
  onKeyDown={(e) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    }
  }}
/>
```

### tRPC Mutation 提交

```tsx
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const trpc = useTRPC()
const queryClient = useQueryClient()

const createProject = useMutation(
  trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      // 1. 使缓存失效，触发重新获取
      queryClient.invalidateQueries(trpc.projects.getMany.queryOptions())
      // 2. 跳转到项目详情页
      router.push(`/projects/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  }),
)

// 提交处理
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  await createProject.mutateAsync({
    value: values.value,
  })
}
```

### 缓存失效流程

```
创建项目成功
    │
    ▼
invalidateQueries(projects.getMany)
    │
    ▼
React Query 标记缓存过期
    │
    ▼
自动重新请求 projects.getMany
    │
    ▼
ProjectsList 更新显示
```

---

## 🎯 Part 3：快速启动模板

### 模板配置

```tsx
// src/modules/home/constants.ts
export const PROJECT_TEMPLATES = [
  {
    emoji: '🎬',
    title: 'Build a Netflix clone',
    prompt: 'Build a Netflix-style homepage with...',
  },
  {
    emoji: '📦',
    title: 'Build an admin dashboard',
    prompt: 'Create an admin dashboard with...',
  },
  // ... 更多模板
] as const
```

### 模板按钮渲染

```tsx
// src/modules/home/ui/components/project-form.tsx
<div className="flex-wrap justify-center gap-2 hidden md:flex">
  {PROJECT_TEMPLATES.map((template) => (
    <Button
      key={template.title}
      variant="outline"
      size="sm"
      onClick={() =>
        form.setValue('value', template.prompt, {
          shouldDirty: true, // 标记为已修改
          shouldValidate: true, // 立即触发校验
          shouldTouch: true, // 标记为已触碰
        })
      }>
      <span className="text-lg">{template.emoji}</span>
      <span className="text-sm">{template.title}</span>
    </Button>
  ))}
</div>
```

### setValue 三个选项的作用

| 选项             | 作用                                           |
| ---------------- | ---------------------------------------------- |
| `shouldDirty`    | 标记表单为"已修改"状态，触发 `isDirty` 为 true |
| `shouldValidate` | 立即运行 Zod 校验，让提交按钮变亮              |
| `shouldTouch`    | 标记字段为"已触碰"，影响 `touchedFields`       |

---

## 📋 Part 4：项目列表 (ProjectsList)

### Suspense 数据获取

```tsx
// src/modules/home/ui/components/project-list.tsx
import { useSuspenseQuery } from '@tanstack/react-query'

export const ProjectsList = () => {
  const trpc = useTRPC()

  // 🔑 useSuspenseQuery 会自动触发最近 Suspense 边界
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getMany.queryOptions(),
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {projects?.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <h3>{project.name}</h3>
          <p>{formatDistanceToNow(new Date(project.updatedAt))}</p>
        </Link>
      ))}
    </div>
  )
}
```

### Suspense 边界（在 client.tsx）

```tsx
// src/app/client.tsx
<Suspense fallback={<Spinner />}>
  <ProjectsList />
</Suspense>
```

### 时间格式化

```tsx
import { formatDistanceToNow } from 'date-fns'

formatDistanceToNow(new Date(project.updatedAt), {
  addSuffix: true, // 添加 "前" / "ago"
})
// 输出: "2小时前" / "2 hours ago"
```

---

## 🔌 Part 5：后端 API

### 创建项目

```tsx
// src/modules/projects/server/procedures.ts
create: baseProcedure
  .input(
    z.object({
      value: z.string().min(1).max(10000),
    }),
  )
  .mutation(async ({ input }) => {
    // 1. 创建项目（带初始消息）
    const createdProject = await prisma.project.create({
      data: {
        name: generateSlug(2, { format: 'kebab' }),  // 随机名称
        messages: {
          create: {
            content: input.value,
            role: 'USER',
            type: 'RESULT',
          },
        },
      },
    })

    // 2. 触发 AI 处理任务
    await inngest.send({
      name: 'code-agent/run',
      data: {
        value: input.value,
        projectId: createdProject.id,
      },
    })

    return createdProject
  }),
```

### 获取项目列表

```tsx
// src/modules/projects/server/procedures.ts
getMany: baseProcedure.query(async () => {
  const projects = await prisma.project.findMany({
    orderBy: {
      updatedAt: 'desc',  // 按更新时间倒序
    },
  })
  return projects
}),
```

---

## 🎨 Part 6：UI 状态管理

### 加载状态

```tsx
const isPending = createProject.isPending
const isButtonDisabled = isPending || !form.formState.isValid

<Button disabled={isButtonDisabled}>
  {isPending ? (
    <Loader2Icon className="size-4 animate-spin" />  // 旋转加载图标
  ) : (
    <ArrowUpIcon className="size-4" />  // 发送箭头
  )}
</Button>
```

### 聚焦状态

```tsx
const [isFocused, setIsFocused] = useState(false)

<TextareaAutosize
  onFocus={() => setIsFocused(true)}
  onBlur={() => setIsFocused(false)}
/>

<div className={cn(
  'border rounded-xl transition-all',
  isFocused && 'shadow-xs',  // 聚焦时添加阴影
)} />
```

---

## 📐 Part 7：响应式设计

### 页面布局

```tsx
// src/app/(home)/page.tsx
<div className="flex flex-col max-w-5xl mx-auto w-full">
  {/* Hero 区域：移动端居中，桌面端更大间距 */}
  <section className="space-y-6 py-[16vh] 2xl:py-48">
    <h1 className="text-2xl md:text-5xl font-bold text-center">
      Build something with Vibe
    </h1>

    {/* 表单容器：限制最大宽度 */}
    <div className="max-w-3xl mx-auto w-full">
      <ProjectForm />
    </div>
  </section>

  <ProjectsList />
</div>
```

### 模板按钮响应式

```tsx
// 移动端隐藏，桌面端显示
<div className="hidden md:flex">
  {PROJECT_TEMPLATES.map(...)}
</div>
```

### 项目列表响应式

```tsx
// 单列（移动端）→ 三列（桌面端）
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
```

---

## 🔧 依赖安装

```bash
pnpm add react-textarea-autosize
pnpm add date-fns
pnpm add zod @hookform/resolvers
```

---

## 📝 本章小结

| 知识点             | 收获                                   |
| ------------------ | -------------------------------------- |
| Next.js 路由组     | `(groupName)` 语法，共享布局不影响 URL |
| tRPC + React Query | 类型安全的数据获取与缓存管理           |
| Zod 表单验证       | `zodResolver` 连接验证规则与表单逻辑   |
| 自适应输入框       | `TextareaAutosize` 动态高度            |
| 模板系统           | `setValue` 三个选项的作用              |
| Suspense 数据获取  | `useSuspenseQuery` 配合 Loading 状态   |
| 响应式设计         | Tailwind 断点与 Grid 布局              |

---

## 🎯 面试考点

1. **invalidateQueries 的作用是什么？**
   - 标记缓存为过期，触发重新获取
   - 确保数据一致性（创建后列表自动更新）

2. **为什么使用 useSuspenseQuery 而不是 useQuery？**
   - 自动触发最近的 Suspense 边界
   - 无需手动处理 loading 状态
   - 配合 ErrorBoundary 实现错误边界

3. **form.setValue 的三个 should 选项分别是什么作用？**
   - `shouldDirty`: 标记表单已修改
   - `shouldValidate`: 触发校验
   - `shouldTouch`: 标记字段已触碰

4. **Next.js 路由组有什么特点？**
   - 不影响 URL 结构
   - 可以共享布局
   - 方便组织代码结构

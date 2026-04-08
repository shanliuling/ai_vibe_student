# 第13章：代码查看器 - 文件浏览器与语法高亮

## 📚 本章概述

本章实现了项目详情页的代码查看功能，用户可以：

- 浏览 AI 生成的项目文件结构
- 点击文件查看代码内容
- 享受语法高亮显示
- 一键复制代码

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    FileExplorer                          │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│   TreeView       │           CodeView                   │
│   (文件树)        │         (代码预览)                    │
│                  │                                       │
│   📁 src         │    ┌─────────────────────────┐       │
│     📁 components│    │ // 代码内容             │       │
│       📄 Button  │    │ const hello = "world"   │       │
│     📁 lib       │    │ ...                     │       │
│       📄 utils   │    └─────────────────────────┘       │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
        ↑                       ↑
   可调整大小 (ResizablePanelGroup)
```

## 📁 核心文件

| 文件                                 | 作用                           |
| ------------------------------------ | ------------------------------ |
| `src/components/file-explorer.tsx`   | 主容器组件，组合所有子组件     |
| `src/components/tree-view.tsx`       | 递归渲染文件树                 |
| `src/components/code-view/index.tsx` | Prism.js 语法高亮              |
| `src/lib/utils.ts`                   | `convertFilesToTreeItems` 算法 |
| `src/types.ts`                       | `TreeItem` 类型定义            |

---

## 🌳 Part 1：文件树组件 (TreeView)

### 数据结构设计

```typescript
// src/types.ts
type TreeItem = string | [string, ...TreeItem[]]
```

这个类型看起来简单，但非常强大：

```typescript
// 文件：直接用字符串
'Button.tsx'[
  // 文件夹：[文件夹名, ...子项]
  ('src', 'Button.tsx', 'Input.tsx')
][('src', ['components', 'Button.tsx'], 'App.tsx')] // 扁平结构 // 嵌套结构
```

### 递归渲染核心逻辑

```tsx
// src/components/tree-view.tsx
const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
  // 解构：第一个元素是名称，其余是子项
  const [name, ...items] = Array.isArray(item) ? item : [item]

  // 拼接完整路径
  const currentPath = parentPath ? `${parentPath}/${name}` : name

  // 🎯 卫语句：优先处理最简单的情况（文件）
  if (!items.length) {
    const isSelected = selectedValue === currentPath
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect?.(currentPath)}>
          <FileIcon className="h-4 w-4" />
          <span>{name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // 📁 文件夹：可折叠
  return (
    <SidebarMenuItem>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRightIcon className="transition-transform duration-200" />
            <FolderIcon className="h-4 w-4" />
            <span>{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath} // 🔑 传递当前路径
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
```

### 💡 设计模式：卫语句 (Guard Clause)

传统写法：

```tsx
// ❌ 嵌套太深，难以阅读
if (items.length) {
  // 文件夹逻辑...
} else {
  // 文件逻辑...
}
```

卫语句写法：

```tsx
// ✅ 提前返回，逻辑清晰
if (!items.length) {
  return <FileItem />
}
return <FolderItem />
```

---

## 🔄 Part 2：扁平文件转树形结构

### 问题场景

后端返回的是扁平结构：

```typescript
{
  "src/components/Button.tsx": "export const Button = ...",
  "src/components/Input.tsx": "export const Input = ...",
  "README.md": "# My Project"
}
```

但 TreeView 需要嵌套结构：

```typescript
;[['src', ['components', 'Button.tsx', 'Input.tsx']], 'README.md']
```

### 核心算法

```tsx
// src/lib/utils.ts
export function convertFilesToTreeItems(
  files: Record<string, string>,
): TreeItem[] {
  // 第一步：构建中间树
  interface TreeNode {
    [key: string]: TreeNode | null // null 表示文件
  }
  const tree: TreeNode = {}

  const sortedPaths = Object.keys(files).sort()

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/')
    let current = tree

    // 遍历路径，创建文件夹节点
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    // 标记文件（叶子节点）
    const fileName = parts[parts.length - 1]
    current[fileName] = null
  }

  // 第二步：转换为 TreeItem 格式
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node)

    if (entries.length === 0) {
      return name || ''
    }

    const children: TreeItem[] = []

    for (const [key, value] of entries) {
      if (value === null) {
        // 文件
        children.push(key)
      } else {
        // 文件夹：递归处理
        const subTree = convertNode(value, key)
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree])
        } else {
          children.push([key, subTree])
        }
      }
    }

    return children
  }

  const result = convertNode(tree)
  return Array.isArray(result) ? result : [result]
}
```

### 算法图解

```
输入：{ "src/components/Button.tsx": "...", "README.md": "..." }

第一步：构建中间树
{
  src: {
    components: {
      "Button.tsx": null
    }
  },
  "README.md": null
}

第二步：转换为 TreeItem
[
  ["src", ["components", "Button.tsx"]],
  "README.md"
]
```

---

## 🎨 Part 3：代码语法高亮 (CodeView)

### Prism.js 集成

```tsx
// src/components/code-view/index.tsx
import Prism from 'prismjs'
import { useEffect } from 'react'

// 导入语言支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'

// 导入主题样式
import './code.theme.css'

export const CodeView = ({ code, lang }: Props) => {
  useEffect(() => {
    Prism.highlightAll() // 🔑 触发高亮
  }, [code, lang])

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  )
}
```

### 语言检测

```tsx
// src/components/file-explorer.tsx
function getLanguageFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()

  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    css: 'css',
    html: 'html',
  }

  return map[extension || ''] || 'text'
}
```

---

## 📐 Part 4：可调整大小的分屏布局

### ResizablePanelGroup 使用

```tsx
// src/components/file-explorer.tsx
<ResizablePanelGroup direction="horizontal">
  {/* 左侧：文件树 */}
  <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
    <TreeView
      data={treeData}
      value={selectedPath}
      onSelect={handleFileSelect}
    />
  </ResizablePanel>

  {/* 分割线 */}
  <ResizableHandle className="hover:bg-primary transition-colors" />

  {/* 右侧：代码预览 */}
  <ResizablePanel defaultSize={70} minSize={50}>
    <CodeView
      code={files[selectedPath]}
      lang={getLanguageFromExtension(selectedPath)}
    />
  </ResizablePanel>
</ResizablePanelGroup>
```

### 关键属性

| 属性          | 作用                                                |
| ------------- | --------------------------------------------------- |
| `direction`   | 分割方向：`horizontal`（左右）或 `vertical`（上下） |
| `defaultSize` | 初始大小百分比                                      |
| `minSize`     | 最小大小百分比                                      |
| `maxSize`     | 最大大小百分比                                      |

---

## 🍞 Part 5：面包屑导航

### 长路径折叠策略

```tsx
// src/components/file-explorer.tsx
const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split('/')
  const maxSegments = 4

  if (pathSegments.length <= maxSegments) {
    // 短路径：显示全部
    // src / components / ui / Button.tsx
    return pathSegments.map((segment, index) => (
      <Fragment key={index}>
        <BreadcrumbItem>{segment}</BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </Fragment>
    ))
  } else {
    // 长路径：折叠中间
    // src / ... / Button.tsx
    return (
      <>
        <BreadcrumbItem>{pathSegments[0]}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{pathSegments.at(-1)}</BreadcrumbItem>
      </>
    )
  }
}
```

---

## 📋 Part 6：一键复制功能

```tsx
const [copied, setCopied] = useState(false)

const handleCopy = useCallback(() => {
  if (selectedPath && files[selectedPath]) {
    navigator.clipboard.writeText(files[selectedPath])
    setCopied(true)
    toast.success('已复制到剪贴板')
    setTimeout(() => setCopied(false), 2000)
  }
}, [selectedPath, files])

// 按钮
<Button onClick={handleCopy}>
  {copied ? <CheckIcon /> : <CopyIcon />}
</Button>
```

---

## 🔧 依赖安装

```bash
pnpm add prismjs
pnpm add -D @types/prismjs
```

---

## 📝 本章小结

| 知识点       | 收获                        |
| ------------ | --------------------------- |
| 递归组件     | TreeView 自引用渲染无限层级 |
| 卫语句       | 提前返回，减少嵌套          |
| 数据转换     | 扁平 → 树形结构算法         |
| 第三方库集成 | Prism.js 语法高亮           |
| 布局组件     | ResizablePanelGroup 分屏    |
| UX 优化      | 面包屑折叠、复制反馈        |

---

## 🎯 面试考点

1. **如何设计递归组件的数据结构？**
   - 使用联合类型 `type TreeItem = string | [string, ...TreeItem[]]`
   - 字符串表示文件，数组表示文件夹

2. **如何处理深层嵌套的状态传递？**
   - 通过参数逐层传递 `parentPath`
   - 使用回调函数 `onSelect` 向上冒泡

3. **Prism.highlightAll() 为什么放在 useEffect 里？**
   - 确保 DOM 已渲染完成
   - 每次 code/lang 变化时重新高亮

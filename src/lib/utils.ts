import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { type TreeItem } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将文件记录转换为树形结构。
比如你有：
```javascript
src/components/Button.tsx
src/components/Input.tsx
README.md
```
要变成显示这种样子的树：
```javascript
📁 src
  📁 components
    📄 Button.tsx
    📄 Input.tsx
📄 README.md
```

 * @param files - 文件路径到内容的映射记录
 * @returns 用于 TreeView 组件的树形结构
 *
 * @example
 * 输入: { "src/Button.tsx": "...", "README.md": "..." }
 * 输出: [["src", "Button.tsx"], "README.md"]
 */
export function convertFilesToTreeItems(
  files: Record<string, string>,
): TreeItem[] {
  // 定义树形结构的内部类型
  interface TreeNode {
    [key: string]: TreeNode | null
  }

  // 首先构建树形结构
  const tree: TreeNode = {}

  // 排序文件以确保顺序一致
  const sortedPaths = Object.keys(files).sort()

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/')
    let current = tree

    // 遍历/创建树形结构
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    // 添加文件（叶子节点）
    const fileName = parts[parts.length - 1]
    current[fileName] = null // null 表示这是一个文件
  }

  // 将树形结构转换为 TreeItem 格式
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node)

    if (entries.length === 0) {
      return name || ''
    }

    const children: TreeItem[] = []

    for (const [key, value] of entries) {
      if (value === null) {
        // 这是一个文件
        children.push(key)
      } else {
        // 这是一个文件夹
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

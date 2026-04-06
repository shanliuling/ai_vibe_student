'use client'

import { CodeView } from '@/components/code-view'
import { Hint } from '@/components/hint'
import { TreeView } from '@/components/tree-view'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { convertFilesToTreeItems } from '@/lib/utils'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

/**
 * 定义文件集合类型：{ "path/to/file.ts": "code content" }
 */
type FileCollection = { [path: string]: string }

/**
 * 工具函数：通过后缀名获取 Prism 对应语言
 */
function getLanguageFromExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()

  // 基础映射逻辑
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

interface FileExplorerProps {
  files: FileCollection
  onSelect?: (path: string, code: string, lang: string) => void
}
interface FileBreadcrumbProps {
  filePath: string
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split('/')
  const maxSegments = 4

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      // 短路径情况：显示所有层级
      return pathSegments.map((segment: string, index: number) => {
        const isLast = index === pathSegments.length - 1
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium text-foreground">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        )
      })
    } else {
      // 长路径情况：折叠中间部分 [根目录, ..., 当前文件名]
      const firstSegment = pathSegments[0]
      const lastSegment = pathSegments[pathSegments.length - 1]
      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              {lastSegment}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      )
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  )
}

export const FileExplorer = ({ files, onSelect }: FileExplorerProps) => {
  // 状态管理：当前选中的路径
  const [selectedPath, setSelectedPath] = useState<string | null>(() => {
    const firstKey = Object.keys(files)
    return firstKey.length > 0 ? firstKey[0] : null
  })
  const [copied, setCopied] = useState(false)

  const treeData = useMemo(() => convertFilesToTreeItems(files), [files])
  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedPath(filePath)
      }
    },
    [files],
  )

  const handleCopy = useCallback(() => {
    if (selectedPath && files[selectedPath]) {
      navigator.clipboard.writeText(files[selectedPath])
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }, [selectedPath, files])

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedPath}
          onSelect={handleFileSelect}></TreeView>
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors"></ResizableHandle>
      <ResizablePanel defaultSize={70} minSize={50}>
        {selectedPath && files[selectedPath] ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b bg-sidebar gap-x-2">
              <div className="flex-1 min-w-0">
                <FileBreadcrumb filePath={selectedPath} />
              </div>
              <Hint
                text={copied ? 'Copied!' : 'Copy to Clipboard'}
                side="bottom">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  disabled={!selectedPath}>
                  {copied ? (
                    <CheckIcon className="size-4"></CheckIcon>
                  ) : (
                    <CopyIcon className="size-4"></CopyIcon>
                  )}
                </Button>
              </Hint>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedPath]}
                lang={getLanguageFromExtension(selectedPath)}></CodeView>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No file selected</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { Fragment } from '@/generated/prisma'
import { ExternalLinkIcon, RefreshCwIcon } from 'lucide-react'
import { useState } from 'react'

interface Props {
  data: Fragment
}

/**
 * FragmentWeb 组件
 * 用于在 iframe 沙盒中优雅地渲染代码片段的 Web 预览。
 * 遵循 Andoni 极简风格，并确保跨环境通信的安全隔绝。
 *
 * @param {Props} props - 包含 Fragment 数据的属性
 */
export function FragmentWeb({ data }: Props) {
  const [fragmentKey, setFragmentKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1)
  }
  const handleCopy = () => {
    if (!data.sandboxUrl) return
    navigator.clipboard.writeText(data.sandboxUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (!data.sandboxUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/10 rounded-lg border border-dashed m-4">
        <span className="text-sm italic">预览暂不可用...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint text="刷新" side="bottom" align="start">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCwIcon />
          </Button>
        </Hint>
        <Hint text="复制" side="bottom" align="start">
          <Button
            size="sm"
            disabled={!data.sandboxUrl || copied}
            variant="outline"
            onClick={handleCopy}
            className="flex-1 justify-start text-start font-normal ">
            {data.sandboxUrl}
          </Button>
        </Hint>
        <Hint text="打开" side="bottom" align="start">
          <Button
            size="sm"
            disabled={!data.sandboxUrl}
            variant="outline"
            onClick={() => {
              if (!data.sandboxUrl) return
              window.open(data.sandboxUrl, '_blank')
            }}
            className="flex-1 justify-start text-start font-normal ">
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        key={fragmentKey}
        title="Fragment Sandbox Preview"
        className="h-full w-full border-none"
        // 允许表单、脚本和同源，确保预览功能完整
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  )
}

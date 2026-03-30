import { Fragment } from '@/generated/prisma'

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
  // 防御性渲染：处理沙盒 URL 缺失的情况
  if (!data.sandboxUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary/10 rounded-lg border border-dashed m-4">
        <span className="text-sm italic">预览暂不可用...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-background">
      <iframe
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

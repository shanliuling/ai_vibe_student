import Prism from 'prismjs'
import { useEffect } from 'react'

// 导入需要的语言高亮支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'

import './code.theme.css'

interface Props {
  code: string
  lang: string
}

/**
 * 代码查看组件
 * 使用 Prism.js 实现语法高亮
 */
export const CodeView = ({ code, lang }: Props) => {
  useEffect(() => {
    // 每次代码或语言改变时，重新触发高亮
    Prism.highlightAll()
  }, [code, lang])

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  )
}

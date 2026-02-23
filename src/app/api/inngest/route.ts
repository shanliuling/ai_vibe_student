import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { codeAgentFunction } from '../../../inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codeAgentFunction, // <-- 导入你写的函数
  ],
})

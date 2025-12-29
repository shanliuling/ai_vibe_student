import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { helloWorld } from '../../../inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- 导入你写的函数
  ],
})

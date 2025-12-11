'use client'
// ^-- 确保我们可以从服务端组件挂载 Provider
import superjson from 'superjson'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import { makeQueryClient } from './query-client'
import type { AppRouter } from './routers/_app'
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
let browserQueryClient: QueryClient
function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端：总是创建一个新的 query client
    return makeQueryClient()
  }
  // 浏览器端：如果我们还没有 query client，就创建一个新的
  // 这非常重要，这样我们就不会在 React 初始化渲染期间挂起（suspend）时重新创建新的 client。
  // 如果我们在创建 query client 的下方有一个 suspense boundary，这可能就不需要了
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return ''
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return process.env.NEXT_PUBLIC_APP_URL
  })()
  return `${base}/api/trpc`
}
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode
  }>
) {
  // 注意：如果在创建 query client 和可能挂起的代码之间没有 suspense boundary，
  // 请避免在初始化 query client 时使用 useState，因为如果 React 挂起且没有 boundary，
  // 它将在初始渲染时丢弃该 client
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson, //<-- 如果你使用数据转换器
          url: getUrl(),
        }),
      ],
    })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

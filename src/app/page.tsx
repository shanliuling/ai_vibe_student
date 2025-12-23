// 'use client'

import { useTRPC } from '@/trpc/client'
import { caller, getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary, useQuery } from '@tanstack/react-query'
import { Client } from './client'
import { Suspense } from 'react'

const Page = async () => {
  // const trpc = useTRPC()
  // const { data } = useQuery(
  //   trpc.createAI.queryOptions({
  //     text: 'hellow阿斯顿撒',
  //   })
  // )
  //

  const data = await caller.createAI({
    text: 'hellow阿斯顿撒',
  })
  // 预取
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(
    trpc.createAI.queryOptions({ text: 'zhangjinlin prefetch' })
  ) //

  return (
    <div>
      {JSON.stringify(data)}
      {/* {JSON.stringify(data2)} */}
      {/* HydrationBoundary：  */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>loading......</p>}>
          <Client></Client>
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default Page

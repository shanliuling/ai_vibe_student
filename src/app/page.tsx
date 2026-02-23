'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

const Page = () => {
  const trpc = useTRPC() // 获取TRPC客户端
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success('消息已经创建')
      },
    }),
  ) // 使用TRPC的invoke mutation
  const [value, setValue] = useState('')
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}></Input>
      <Button
        disabled={createMessage.isPending}
        onClick={() => {
          createMessage.mutate({ value: value }) //触发后台任务事件
        }}>
        点击
      </Button>
      <div>
        {messages?.map((message) => (
          <div key={message.id}>{message.content}</div>
        ))}
      </div>
    </div>
  )
}

export default Page

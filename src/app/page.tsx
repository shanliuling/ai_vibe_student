'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

const Page = () => {
  const trpc = useTRPC() // 获取TRPC客户端
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        toast.success('yesyesyes')
      },
    })
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
        disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ value: value }) //触发后台任务事件
        }}>
        点击
      </Button>
    </div>
  )
}

export default Page

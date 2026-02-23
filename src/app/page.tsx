'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const Page = () => {
  const trpc = useTRPC() // 获取TRPC客户端

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`)
        toast.success('项目已创建 🎉')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  ) // 使用TRPC的invoke mutation
  const [value, setValue] = useState('')
  const router = useRouter()
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
          }}></Input>
        <Button
          disabled={createProject.isPending}
          onClick={() => {
            createProject.mutate({ value: value }) //触发后台任务事件
          }}>
          点击
        </Button>
      </div>
    </div>
  )
}

export default Page

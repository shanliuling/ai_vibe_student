'use client'

import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button
        disabled={invoke.isPending}
        onClick={() => {
          invoke.mutate({ text: 'zzjjll' })
        }}>
        点击
      </Button>
    </div>
  )
}

export default Page

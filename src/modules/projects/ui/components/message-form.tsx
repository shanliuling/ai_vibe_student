import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowUpIcon, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { z } from 'zod'
interface Props {
  projectId: string
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'value is required' })
    .max(10000, { message: 'value is too long' }),
})
export const MessageForm = ({ projectId }: Props) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showUsage, setShowUsage] = useState(false)
  const trpc = useTRPC()
  const form = useForm<z.infer<typeof formSchema>>({
    // zodResolver 是连接“表单逻辑” (react-hook-form) 和“验证规则” (Zod) 的那个“粘合剂”或“翻译官
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })
  const queryClient = useQueryClient()
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset()
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId }),
        )
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )
  const isPending = createMessage.isPending
  const isButtonDisabled = isPending || !form.formState.isValid
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: values.value,
      projectId,
    })
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
          isFocused && 'shadow-xs',
          showUsage && 'rounded-t-none',
        )}>
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaAutosize
                  {...field}
                  disabled={isPending}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  minRows={2}
                  maxRows={8}
                  className="w-full resize-none border-none bg-transparent pt-4 outline-none focus-visible:ring-0"
                  placeholder="你想构建什么？"
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      form.handleSubmit(onSubmit)()
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted flex items-center gap-1">
              <span className="text-[10px]">Enter</span>
            </kbd>
            <span>发送消息</span>
          </div>

          <Button
            type="submit"
            disabled={isButtonDisabled}
            size="icon"
            className={cn(
              'size-8 rounded-full transition-all duration-200',
              isButtonDisabled
                ? 'opacity-50'
                : 'hover:scale-105 active:scale-95',
            )}>
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

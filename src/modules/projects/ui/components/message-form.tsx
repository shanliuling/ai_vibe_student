import { FormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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

  const form = useForm<z.infer<typeof formSchema>>({
    // zodResolver 是连接“表单逻辑” (react-hook-form) 和“验证规则” (Zod) 的那个“粘合剂”或“翻译官
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
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
          render={({ field }) => <TextareaAutosize></TextareaAutosize>}
        />
      </form>
    </Form>
  )
}

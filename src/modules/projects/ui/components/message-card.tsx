import { Card } from '@/components/ui/card'
import { Fragment } from '@/generated/prisma/client'
import { MessageRole, MessageType } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'

interface MessageCardProps {
  content: string
  role: MessageRole
  fragment: Fragment | null
  createdAt: Date
  isActiveFragment: boolean
  onFragmentClick: () => void
  type: MessageType
}
interface UserMessageProps {
  content: string
}
interface AssistantMessageProps {
  content: string
  fragment: Fragment | null
  createdAt: Date
  isActiveFragment: boolean
  onFragmentClick: () => void
  type: MessageType
}
const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] wrap-break-words ">
        {content}
      </Card>
    </div>
  )
}

import { format } from 'date-fns'

const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  return (
    <div className={cn('flex flex-col group px-2 pb-4')}>
      <div className="flex items-center gap-2 pl-2 mb-2">
        {/* TODO: add logo */}
        <span className="text-sm font-medium">Vibe</span>
        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] ">
        {content}
      </Card>
    </div>
  )
}

export const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === 'ASSISTANT') {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    )
  }
  return <UserMessage content={content} />
}

import { Fragment } from '@/generated/prisma/client'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { MessageCard } from './message-card'
import { MessageForm } from './message-form'

interface Props {
  projectId: string
}

export const MessageContainer = ({ projectId }: Props) => {
  const trpc = useTRPC()
  // useSuspenseQuery 预加载数据
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    }),
  )
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => {
            return (
              <MessageCard
                key={message.id}
                content={message.content}
                role={message.role}
                fragment={message.fragment}
                createdAt={message.createdAt}
                isActiveFragment={false}
                onFragmentClick={(fragment: Fragment) => {}}
                type={message.type}
              />
            )
          })}
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <MessageForm projectId={projectId} />
      </div>
    </div>
  )
}

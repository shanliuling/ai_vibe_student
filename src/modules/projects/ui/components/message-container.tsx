import { Fragment } from '@/generated/prisma/client'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { MessageCard } from './message-card'
import { MessageForm } from './message-form'

interface Props {
  projectId: string
  activeFragment: Fragment | null
  setActiveFragment: (fragment: Fragment | null) => void
}

export const MessageContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const trpc = useTRPC()
  const bottomRef = useRef<HTMLDivElement>(null)
  // useSuspenseQuery 预加载数据
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    }),
  )
  useEffect(() => {
    const lastAssistenMessage = messages.findLast(
      (message) => message.role === 'ASSISTANT',
    )

    if (lastAssistenMessage) {
      setActiveFragment(lastAssistenMessage.fragment)
    }
  }, [messages, setActiveFragment])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages.length])
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
                isActiveFragment={activeFragment?.id === message.fragment?.id}
                onFragmentClick={() => {
                  setActiveFragment(message.fragment)
                }}
                type={message.type}
              />
            )
          })}
        </div>
        <div ref={bottomRef} />
      </div>
      <div className="relative p-3 pt-1">
        {/*对话框上面白色阴影  */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-linear-to-b from-transparent to-background pointer-events-none" />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  )
}

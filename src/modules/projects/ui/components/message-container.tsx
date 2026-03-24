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
    trpc.messages.getMany.queryOptions(
      {
        projectId: projectId,
      },
      {
        // TODO: 优化轮询
        refetchInterval: 5000,
      },
    ),
  )
  useEffect(() => {
    const lastAssistenMessageWithFragment = messages.findLast(
      (message) => message.role === 'ASSISTANT' && !!message.fragment,
    )

    if (lastAssistenMessageWithFragment) {
      setActiveFragment(lastAssistenMessageWithFragment.fragment)
    }
  }, [messages, setActiveFragment])

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages.length])

  const lastMessage = messages[messages.length - 1]
  const isLastMessageAssisten = lastMessage?.role === 'USER'

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
        {/* 只有当最后一条消息是用户发送的，才显示加载状态 */}
        {isLastMessageAssisten && <MessageLoading />}
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

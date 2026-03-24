'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const messages = [
  'Thinking...',
  'Loading...',
  'Generating...',
  'Analyzing your request...',
  'Building your website...',
  'Crafting components...',
  'Optimizing layout...',
  'Adding final touches...',
  'Almost ready...',
]

const ShimmerMessages = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <div className="h-4 w-4 animate-pulse rounded-full bg-primary" />
      </div>
      <span className="animate-pulse">{messages[currentMessageIndex]}</span>
    </div>
  )
}

export const MessageLoading = () => {
  return (
    <div className="flex flex-col group px-2 pb-4">
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/logo.png"
          alt="Vibe"
          width={18}
          height={18}
          className="shrink-0"
        />
        <span className="text-sm font-medium">Vibe</span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <ShimmerMessages />
      </div>
    </div>
  )
}

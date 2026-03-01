'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useTRPC } from '@/trpc/client'
import { Suspense } from 'react'
import { MessageContainer } from '../components/message-container'
interface Props {
  projectId: string
}

const ProjectView = ({ projectId }: Props) => {
  const trpc = useTRPC()

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className="flex flex-col min-h-0">
          <Suspense fallback={<p>loading message....</p>}>
            <MessageContainer projectId={projectId} />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={50}>
          TODO:Preview
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ProjectView

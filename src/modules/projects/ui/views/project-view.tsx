'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Fragment } from '@/generated/prisma'
import { ProjectHeader } from '@/modules/projects/ui/components/project-header'
import { CodeIcon, CrownIcon, EyeIcon, Link } from 'lucide-react'
import { Suspense, useState } from 'react'

import { FileExplorer } from '@/components/file-explorer'
import { Button } from '@/components/ui/button'
import { FragmentWeb } from '../components/fragment-web'
import { MessageContainer } from '../components/message-container'
interface Props {
  projectId: string
}

const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabState, setTabState] = useState<'preview' | 'code'>('preview')
  console.log(activeFragment, 'activeFragment')

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className="flex flex-col min-h-0">
          <Suspense fallback={<p>loading project header....</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p>loading message....</p>}>
            <MessageContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={50}>
          <Tabs
            className="h-full gap-y-0 "
            defaultValue="preview"
            value={tabState}
            onValueChange={(value) => {
              setTabState(value as 'preview' | 'code')
            }}>
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList>
                <TabsTrigger value="preview">
                  <EyeIcon></EyeIcon>
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code">
                  <CodeIcon></CodeIcon>
                  <span>code</span>
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-x-2">
                <Button asChild size="sm" variant="default">
                  <Link href="/pricing">
                    <CrownIcon>Upgrade</CrownIcon>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="preview">
              {!!activeFragment && <FragmentWeb data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {!!activeFragment?.files && (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ProjectView

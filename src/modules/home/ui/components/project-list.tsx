'use client'

import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

export const ProjectsList = () => {
  const trpc = useTRPC()

  // 1. 获取后端项目列表数据
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getMany.queryOptions(),
  )

  return (
    <div className="w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4">
      <h2 className="text-2xl font-semibold">Saved Vibes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects?.length === 0 && (
          <div className="col-span-full text-center">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        )}

        {projects?.map((project) => (
          <Button
            key={project.id}
            variant="outline"
            className="font-normal h-auto justify-start w-full text-start p-4 group transition-all"
            asChild>
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-x-3">
              <Image
                src="/logo.png"
                alt="Vibe"
                width={32}
                height={32}
                className="object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <h3 className="truncate font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}

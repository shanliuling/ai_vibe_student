import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  Link,
  SunMoonIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
export const ProjectHeader = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC()
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    }),
  )
  const { setTheme, resolvedTheme } = useTheme()
  return (
    <header className="p-2 flex justify-between items-center border-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!">
            <Image
              src="/logo.png"
              alt="Vibe"
              width={18}
              height={18}
              className="shrink-0"
            />
            <span className="text-sm font-medium">{project.name}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          <DropdownMenuItem asChild>
            <Link href="/">
              <ChevronLeftIcon className="h-4 w-4" />
              返回项目列表
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSubTrigger>
            <SunMoonIcon></SunMoonIcon>
            <span className="ml-2">主题</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={resolvedTheme}
                onValueChange={(value) => {
                  setTheme(value)
                }}>
                <DropdownMenuRadioItem value="light">
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <span>Dark</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <span>System</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

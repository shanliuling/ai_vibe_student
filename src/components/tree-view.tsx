'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { type TreeItem } from '@/types'
import { ChevronRightIcon, FileIcon, FolderIcon } from 'lucide-react'

interface TreeViewProps {
  data: TreeItem[]
  value?: string | null
  onSelect?: (value: string) => void
}

interface TreeProps {
  item: TreeItem
  selectedValue?: string | null
  onSelect?: (value: string) => void
  parentPath: string
}

/**
 * 内部递归组件：处理单层节点渲染
 */
const Tree = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
  // 解构出当前名称和子项 (使用了之前定义的 TreeItem 类型)
  const [name, ...items] = Array.isArray(item) ? item : [item]

  // 拼接当前完整路径
  const currentPath = parentPath ? `${parentPath}/${name}` : name

  // ✅ 1. 卫语句：优先处理“文件”逻辑 (最简单的分支)
  if (!items.length) {
    const isSelected = selectedValue === currentPath
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onSelect?.(currentPath)}
          className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
          <FileIcon className="h-4 w-4" />
          <span className="truncate">{name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // ✅ 2. 文件夹逻辑：不再需要包裹在 if/else 中，结构更清爽
  return (
    <SidebarMenuItem>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRightIcon className="h-4 w-4 transition-transform duration-200" />
            <FolderIcon className="h-4 w-4" />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

/**
 * 主组件：文件树查看器
 */
export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-full bg-transparent border-none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}

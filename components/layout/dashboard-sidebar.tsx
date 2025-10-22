'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  Image,
  Settings,
  Webhook,
  GitCompare,
  BarChart3,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { User } from '@supabase/supabase-js'

const menuItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'Chat',
    url: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    title: 'Documents',
    url: '/dashboard/documents',
    icon: FileText,
  },
  {
    title: 'Images',
    url: '/dashboard/images',
    icon: Image,
  },
  {
    title: 'Decision Rooms',
    url: '/dashboard/decisions',
    icon: GitCompare,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
  },
]

const settingsItems = [
  {
    title: 'API Keys',
    url: '/dashboard/settings/api-keys',
    icon: Settings,
  },
  {
    title: 'n8n Integration',
    url: '/dashboard/settings/n8n',
    icon: Webhook,
  },
]

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const getInitials = () => {
    const name = user.user_metadata?.full_name || user.email
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="font-semibold text-lg">AI Platform</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

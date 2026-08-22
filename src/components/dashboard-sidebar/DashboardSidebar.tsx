import {
  ChevronRight,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { MedeskLogo } from './logo'
import { SidebarCollapseIcon } from './icons'
import { DashboardLink, useDashboardNavigation } from './navigation'
import { useTheme } from './theme-provider'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { currentUser, navigationGroups, type NavigationItem } from '../../data'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const menuButtonClassName = cn(
  'h-12.5 gap-2.5 rounded-lg bg-transparent py-2.5 pl-3 pr-2 text-base font-normal text-muted-foreground transition-colors',
  'hover:!bg-transparent hover:text-foreground active:!bg-transparent',
  'aria-[current=page]:!bg-transparent aria-[current=page]:font-medium aria-[current=page]:text-foreground',
  'data-open:!bg-transparent data-open:hover:!bg-transparent data-open:text-foreground data-active:!bg-transparent',
  '[&_svg]:size-5! [&_svg]:shrink-0',
  'group-data-[collapsible=icon]:size-12.5! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:[&>span]:hidden',
)

const sidebarGroupLabelClassName =
  'h-auto px-0 py-1 text-[1.0625rem] font-normal text-foreground/70 transition-colors'

function NavItem({ item }: { item: NavigationItem }) {
  const { pathname } = useDashboardNavigation()
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <SidebarMenuButton
      asChild
      tooltip={item.name}
      className={menuButtonClassName}
    >
      <DashboardLink
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => {
          if (isMobile) setOpenMobile(false)
        }}
      >
        <item.icon />
        <span>{item.name}</span>
        {item.badge ? (
          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
        ) : null}
      </DashboardLink>
    </SidebarMenuButton>
  )
}

export function DashboardSidebar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { state, toggleSidebar } = useSidebar()
  const { user, clearAuth } = useAuthStore()
  const isDark = resolvedTheme === 'dark'

  const activeUser = {
    name: user?.name || currentUser.name,
    email: user?.email || currentUser.email,
    avatar: currentUser.avatar,
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="relative h-20 flex-row items-center justify-between gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex min-w-0 items-center gap-3 transition-opacity group-data-[collapsible=icon]:hidden">
          <MedeskLogo className="size-7 shrink-0" />
          <span className="truncate text-xl font-semibold tracking-tight">
            Ordio
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          aria-label={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
          className="size-10"
        >
          <SidebarCollapseIcon className="size-5 transition-transform group-data-[collapsible=icon]:rotate-180" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-4 py-3 group-data-[collapsible=icon]:overflow-auto!">
        {navigationGroups.map((group) => {
          const isCollapsible = group.collapsible ?? false

          if (isCollapsible) {
            return (
              <Collapsible
                key={group.label}
                defaultOpen
                className="group/collapsible"
              >
                <SidebarGroup className="gap-1 p-0">
                  <SidebarGroupLabel asChild className={sidebarGroupLabelClassName}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between transition-colors hover:text-foreground">
                      <span>{group.label}</span>
                      <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-0">
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.name}>
                            <NavItem item={item} />
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )
          }

          return (
            <SidebarGroup key={group.label} className="gap-1 p-0">
              <SidebarGroupLabel className={sidebarGroupLabelClassName}>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <NavItem item={item} />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="px-4 py-2">
        <SidebarGroup className="gap-0 p-0">
          <SidebarGroupLabel
            className={cn(
              sidebarGroupLabelClassName,
              'group-data-[collapsible=icon]:hidden',
            )}
          >
            Account
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip={activeUser.name}
                    className={cn(menuButtonClassName, 'justify-start px-0!')}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar size="sm" className="border border-border/50">
                        <AvatarImage
                          src={activeUser.avatar}
                          alt={activeUser.name}
                        />
                        <AvatarFallback>
                          {activeUser.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {activeUser.name}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  className="w-56"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="leading-tight">
                      <p className="text-sm font-medium">
                        {activeUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    >
                      {isDark ? <SunIcon /> : <MoonIcon />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => clearAuth()}>
                    <LogOutIcon className="size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

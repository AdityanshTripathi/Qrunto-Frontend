import { useEffect, useRef } from 'react'
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
import { hasCapability } from '@/lib/capabilities'

const menuButtonClassName = 'dash-nav-item gap-2.5 [&_svg]:shrink-0';
const sidebarGroupLabelClassName = 'dash-nav-group';

function NavItem({ item }: { item: NavigationItem }) {
  const { pathname } = useDashboardNavigation()
  const { isMobile, setOpenMobile } = useSidebar()
  const isActive =
    item.href === '/' || item.href === '/dashboard'
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <SidebarMenuButton
      asChild
      tooltip={item.name}
      className={menuButtonClassName}
    >
      <DashboardLink
        href={item.href}
        end={item.href === '/dashboard'}
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
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { user, clearAuth } = useAuthStore()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (!isMobile || !openMobile) return
    const previousFocus = document.activeElement as HTMLElement | null
    const panel = sidebarRef.current
    const getFocusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? [])
      .filter(element => element.getClientRects().length > 0)
    getFocusable()[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpenMobile(false)
      }
      if (event.key === 'Tab') {
        const elements = getFocusable()
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    panel?.addEventListener('keydown', onKeyDown)
    return () => {
      panel?.removeEventListener('keydown', onKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isMobile, openMobile, setOpenMobile])

  const activeUser = {
    name: user?.name || currentUser.name,
    email: user?.email || '',
    avatar: '',
  }

  return (
    <Sidebar ref={sidebarRef} collapsible="icon" className="dash-sidebar" role={isMobile ? 'dialog' : 'navigation'} aria-label="Restaurant navigation" aria-modal={isMobile ? true : undefined}>
      <SidebarHeader className="dash-sidebar-header relative h-20 flex-row items-center justify-between gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex min-w-0 items-center gap-3 transition-opacity group-data-[collapsible=icon]:hidden">
          <span className="dash-brand-mark" aria-hidden="true">o</span>
          <span className="truncate text-xl font-semibold tracking-tight">
            Ordio
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          aria-label={isMobile ? 'Close navigation' : state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
          className="size-10"
        >
          <SidebarCollapseIcon className="size-5 transition-transform group-data-[collapsible=icon]:rotate-180" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-4 py-3 group-data-[collapsible=icon]:overflow-auto!">
        {navigationGroups.map((group) => ({
          ...group,
          items: group.items.filter(item => hasCapability(user?.role, item.capability)),
        })).filter(group => group.items.length > 0).map((group) => {
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

      <SidebarFooter className="dash-sidebar-footer px-4 py-2">
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
                    aria-label={`Account menu for ${activeUser.name}`}
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

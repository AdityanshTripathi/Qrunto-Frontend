import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarCollapseIcon } from './icons';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar-context';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

export interface StaffSidebarLink {
  name: string;
  tab: string;
  icon: LucideIcon;
  badgeKey?: 'requests' | 'bills';
}

interface StaffSidebarProps {
  links: readonly StaffSidebarLink[];
  activeTab: string;
  onSelect: (tab: string) => void;
  helpCount: number;
  billCount: number;
}

const menuButtonClassName = 'dash-nav-item gap-2.5 [&_svg]:shrink-0';
const sidebarGroupLabelClassName = 'dash-nav-group';

export function StaffSidebar({ links, activeTab, onSelect, helpCount, billCount }: StaffSidebarProps) {
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile || !openMobile) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = sidebarRef.current;
    const getFocusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]') ?? [])
      .filter((element) => element.getClientRects().length > 0);
    getFocusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpenMobile(false);
      }
      if (event.key !== 'Tab') return;
      const elements = getFocusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    panel?.addEventListener('keydown', onKeyDown);
    return () => {
      panel?.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isMobile, openMobile, setOpenMobile]);

  const selectTab = (tab: string) => {
    onSelect(tab);
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  return (
    <Sidebar ref={sidebarRef} collapsible="icon" className="dash-sidebar" role={isMobile ? 'dialog' : 'navigation'} aria-label="Staff navigation" aria-modal={isMobile ? true : undefined}>
      <SidebarHeader className="dash-sidebar-header relative h-20 flex-row items-center justify-between gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex min-w-0 items-center gap-3 transition-opacity group-data-[collapsible=icon]:hidden">
          <span className="dash-brand-mark" aria-hidden="true">o</span>
          <span className="truncate text-xl font-semibold tracking-tight">Ordio</span>
        </div>
        <Button variant="ghost" onClick={toggleSidebar} aria-label={isMobile ? 'Close navigation' : state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'} className="size-10">
          <SidebarCollapseIcon className="size-5 transition-transform group-data-[collapsible=icon]:rotate-180" />
        </Button>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-4 py-3 group-data-[collapsible=icon]:overflow-auto!">
        <SidebarGroup className="gap-1 p-0">
          <SidebarGroupLabel className={sidebarGroupLabelClassName}>Staff workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {links.map((link) => {
                const badge = link.badgeKey === 'requests' ? helpCount : link.badgeKey === 'bills' ? billCount : 0;
                return (
                  <SidebarMenuItem key={link.tab}>
                    <SidebarMenuButton
                      tooltip={link.name}
                      aria-current={activeTab === link.tab ? 'page' : undefined}
                      onClick={() => selectTab(link.tab)}
                      className={menuButtonClassName}
                    >
                      <link.icon />
                      <span>{link.name}</span>
                      {badge > 0 ? <SidebarMenuBadge>{badge}</SidebarMenuBadge> : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="dash-sidebar-footer px-4 py-2">
        <SidebarGroup className="gap-0 p-0">
          <SidebarGroupLabel className={`${sidebarGroupLabelClassName} group-data-[collapsible=icon]:hidden`}>Account</SidebarGroupLabel>
          <SidebarMenu className="gap-0">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip={user?.name || 'Staff account'} aria-label={`Account menu for ${user?.name || 'staff account'}`} className={`${menuButtonClassName} justify-start px-0!`}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar size="sm" className="border border-border/50">
                        <AvatarFallback>{user?.name?.slice(0, 1).toUpperCase() || 'S'}</AvatarFallback>
                      </Avatar>
                      <span className="truncate group-data-[collapsible=icon]:hidden">{user?.name || 'Staff account'}</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="leading-tight">
                      <p className="text-sm font-medium">{user?.name || 'Staff account'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'No email address'}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                      <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => void handleLogout()}>
                    <LogOutIcon />
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
  );
}

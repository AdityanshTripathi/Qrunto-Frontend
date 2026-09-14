import React from 'react';
import { Bell, LayoutDashboard, QrCode, Receipt, ShoppingBag, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { DashboardMenuButton } from './DashboardMenuButton';
import { StaffSidebar, type StaffSidebarLink } from './dashboard-sidebar/StaffSidebar';
import { SidebarProvider } from './ui/sidebar';
import { useAuthStore } from '../store/authStore';
import './dashboard-premium.css';
import './dashboard-workspace-colors.css';
import './dashboard-component-colors.css';
import './dashboard-workspace.css';
import './waiter-component-colors.css';
import './waiter-premium.css';

interface WaiterDashboardLayoutProps {
  children?: React.ReactNode;
  helpCount?: number;
  billCount?: number;
}

const staffNavigation: readonly StaffSidebarLink[] = [
  { name: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
  { name: 'Tables', tab: 'tables', icon: QrCode },
  { name: 'Orders', tab: 'orders', icon: ShoppingBag },
  { name: 'Customer Requests', tab: 'requests', icon: Bell, badgeKey: 'requests' },
  { name: 'Bill Requests', tab: 'bills', icon: Receipt, badgeKey: 'bills' },
  { name: 'Profile', tab: 'profile', icon: User },
];

export const WaiterDashboardLayout: React.FC<WaiterDashboardLayoutProps> = ({
  children,
  helpCount = 0,
  billCount = 0,
}) => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const activeLabel = staffNavigation.find((link) => link.tab === activeTab)?.name || 'Dashboard';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <SidebarProvider>
      <div className="dashboard-shell dashboard-workspace waiter-shell min-h-screen flex flex-col w-full">
        <div className="flex-1 flex w-full min-w-0">
          <StaffSidebar
            links={staffNavigation}
            activeTab={activeTab}
            onSelect={handleTabChange}
            helpCount={helpCount}
            billCount={billCount}
          />
          <div className="waiter-main flex-1 flex flex-col overflow-hidden min-w-0">
            <header className="dash-topbar">
              <div className="dash-topbar-heading">
                <DashboardMenuButton />
                <div className="dash-restaurant">
                  <strong>{activeLabel}</strong>
                  <p>Logged in as Waiter &middot; {user?.restaurants[0]?.name || 'Your restaurant'}</p>
                </div>
              </div>
              <div className="dash-topbar-actions">
                <ThemeToggle />
                <span className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 dark:bg-[#1f2937] dark:border-[#374151]/50 dark:text-gray-300 shadow-sm">
                  {user?.restaurants[0]?.name || 'Your restaurant'}
                </span>
              </div>
            </header>
            <main className="waiter-content flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative scrollbar-thin" data-section={activeTab}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default WaiterDashboardLayout;

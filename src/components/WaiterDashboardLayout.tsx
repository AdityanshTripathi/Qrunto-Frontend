import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, QrCode, ShoppingBag, Bell, User, LogOut, Menu, X, Receipt
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ThemeToggle } from './ThemeToggle';

interface WaiterDashboardLayoutProps {
  children?: React.ReactNode;
  helpCount?: number;
  billCount?: number;
}

export const WaiterDashboardLayout: React.FC<WaiterDashboardLayoutProps> = ({ 
  children, 
  helpCount = 0, 
  billCount = 0 
}) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTab = searchParams.get('tab') || 'dashboard';

  const navLinks = [
    { name: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
    { name: 'Tables', tab: 'tables', icon: QrCode },
    { name: 'Orders', tab: 'orders', icon: ShoppingBag },
    { name: 'Customer Requests', tab: 'requests', icon: Bell, badgeKey: 'requests' },
    { name: 'Bill Requests', tab: 'bills', icon: Receipt, badgeKey: 'bills' },
    { name: 'Profile', tab: 'profile', icon: User },
  ];

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#111827] text-slate-900 dark:text-white flex flex-col">
      {/* 1. Mobile Top Header Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-slate-200 dark:border-[#374151]/50 bg-white dark:bg-[#1f2937]/35 backdrop-blur-xl px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF6B35] rounded-xl flex items-center justify-center font-black text-white text-sm">
            O
          </div>
          <div>
            <h1 className="font-black text-xs leading-none text-slate-800 dark:text-white">Ordio Waiter</h1>
            <p className="text-[9px] text-slate-500 dark:text-gray-400 mt-0.5">Table Operational Service</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-slate-100 dark:bg-[#374151]/50 border border-slate-200 dark:border-[#4b5563]/40 rounded-xl text-slate-700 dark:text-gray-200 relative"
          >
            <Menu className="w-4 h-4" />
            {(helpCount > 0 || billCount > 0) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* 2. Mobile Navigation Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Drawer backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></div>
          
          {/* Drawer sheet content */}
          <div className="relative w-72 max-w-[80%] bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-[#374151]/50 p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-[#374151]/35">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-xl flex items-center justify-center font-black text-white text-sm">
                    O
                  </div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-white">Ordio Staff</h2>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-slate-100 border border-slate-200 dark:bg-[#1f2937] dark:border-[#374151] rounded-lg text-slate-500 dark:text-[#9ca3af]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile links */}
              <nav className="py-6 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = activeTab === link.tab;
                  return (
                    <button
                      key={link.tab}
                      onClick={() => handleTabChange(link.tab)}
                      className={`w-full flex items-center justify-between py-3.5 px-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-[#FF6B35] text-white font-medium shadow-md shadow-[#FF6B35]/15' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#374151]/20'
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{link.name}</span>
                      </span>
                      {link.badgeKey === 'requests' && helpCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-white text-[#FF6B35]' : 'bg-red-500 text-white animate-pulse'
                        }`}>
                          {helpCount}
                        </span>
                      )}
                      {link.badgeKey === 'bills' && billCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isActive ? 'bg-white text-[#FF6B35]' : 'bg-red-500 text-white animate-pulse'
                        }`}>
                          {billCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile bottom profile */}
            <div className="border-t border-slate-200 dark:border-[#374151]/35 pt-4 space-y-3">
              <div className="bg-slate-50 border border-slate-100 dark:bg-[#1f2937]/50 dark:border-[#374151]/30 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B35]">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate text-slate-800 dark:text-gray-100">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono truncate uppercase tracking-wider">Waiter</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 py-3.5 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 3. Desktop Sidebar Container */}
        <aside className="hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-[#374151]/50 bg-white dark:bg-[#1f2937]/35 backdrop-blur-xl w-64 shrink-0 sticky top-0 h-screen">
          <div>
            {/* Sidebar Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-[#374151]/35">
              <div className="w-9 h-9 bg-[#FF6B35] rounded-xl flex items-center justify-center font-black text-white text-base">
                O
              </div>
              <div className="text-left">
                <h1 className="font-black text-sm leading-none text-slate-800 dark:text-white">Ordio Staff</h1>
                <p className="text-[10px] text-[#FF6B35] font-black tracking-widest uppercase mt-0.5">Waiter Desk</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="px-3 py-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.tab;
                return (
                  <button
                    key={link.tab}
                    onClick={() => handleTabChange(link.tab)}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#FF6B35] text-white font-medium shadow-lg shadow-[#FF6B35]/15' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9ca3af] dark:hover:text-white dark:hover:bg-[#374151]/30'
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{link.name}</span>
                    </span>
                    {link.badgeKey === 'requests' && helpCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-[#FF6B35]' : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {helpCount}
                      </span>
                    )}
                    {link.badgeKey === 'bills' && billCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white text-[#FF6B35]' : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {billCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profile Card & Logout */}
          <div className="border-t border-slate-200 dark:border-[#374151]/35 p-4 flex flex-col gap-2">
            <div className="bg-slate-50 border border-slate-100 dark:bg-[#111827]/40 dark:border-[#374151]/30 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B35]">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono truncate uppercase tracking-wider">Waiter Profile</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all px-4"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-semibold">Log Out</span>
            </button>
          </div>
        </aside>

        {/* 4. Desktop Main Content Layout */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Top Header Bar */}
          <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-[#374151]/40 bg-white/80 dark:bg-[#111827]/60 backdrop-blur-md relative z-20">
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100">
                {navLinks.find(l => l.tab === activeTab)?.name || 'Dashboard'}
              </h1>
              <span className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">Logged in as Waiter</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 dark:bg-[#1f2937] dark:border-[#374151]/50 dark:text-gray-300 shadow-sm">
                🏬 {user?.restaurants[0]?.name}
              </span>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10 scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default WaiterDashboardLayout;

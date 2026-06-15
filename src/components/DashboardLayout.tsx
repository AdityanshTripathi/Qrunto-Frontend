import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Tags, 
  QrCode, 
  BarChart3, 
  CreditCard, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export const DashboardLayout: React.FC = () => {
  const { user, clearAuth, setAuth } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingSub, setCheckingSub] = useState(true);
  const [hasSub, setHasSub] = useState(false);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      setHasSub(true);
      setCheckingSub(false);
      return;
    }
    const checkSubscription = async () => {
      try {
        const res = await api.get('/subscriptions/current');
        if (res.subscription) {
          setHasSub(true);
        } else {
          navigate('/subscription', { replace: true });
        }
      } catch (err: any) {
        console.error('Subscription check failed:', err);
      } finally {
        setCheckingSub(false);
      }
    };
    checkSubscription();
  }, [navigate, user]);

  if (checkingSub) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  if (!hasSub) {
    return null;
  }

  // Navigation Links definition
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF'] },
    { name: 'Active Orders', path: '/dashboard/orders', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF'] },
    { name: 'Menu Items', path: '/dashboard/menu', icon: Utensils, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF'] },
    { name: 'Categories', path: '/dashboard/categories', icon: Tags, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF'] },
    { name: 'Tables & QRs', path: '/dashboard/tables', icon: QrCode, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'STAFF'] },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER'] },
    { name: 'Billing Plan', path: '/dashboard/subscription', icon: CreditCard, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER'] },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'RESTAURANT_OWNER'] },
  ];

  // Filter links based on logged-in user's role
  const userRole = user?.role || 'STAFF';
  const filteredLinks = navLinks.filter(link => link.roles.includes(userRole));

  // Extract current page name for header display
  const currentPath = location.pathname;
  const currentRoute = navLinks.find(link => link.path === currentPath)?.name || 'Overview';

  const handleReturnToAdmin = () => {
    const adminUser = localStorage.getItem('admin_user');
    const adminToken = localStorage.getItem('admin_access_token');
    const adminRefresh = localStorage.getItem('admin_refresh_token');

    if (adminUser && adminToken && adminRefresh) {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');

      setAuth(JSON.parse(adminUser), adminToken, adminRefresh);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white flex flex-col">
      {/* ⚠️ Admin Bypass Banner */}
      {localStorage.getItem('admin_access_token') && (
        <div className="w-full bg-amber-500 text-black py-2 px-4 text-center text-xs font-black flex items-center justify-center gap-2 z-50 shrink-0">
          <span>⚠️ You are logged in as Owner of {user?.restaurants[0]?.name || 'this restaurant'} (Support Session).</span>
          <button
            onClick={handleReturnToAdmin}
            className="underline hover:text-red-900 transition-colors ml-1 font-extrabold uppercase tracking-wide border border-black/20 rounded px-2 py-0.5 bg-black/5 hover:bg-black/10"
          >
            Return to Admin Panel
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* 1. Desktop Sidebar Container */}
      <aside 
        className={`hidden lg:flex flex-col justify-between border-r border-[#374151]/50 bg-[#1f2937]/35 backdrop-blur-xl transition-all duration-300 relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-[#FF6B35] border border-[#374151] flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-md shadow-[#FF6B35]/20"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Sidebar Header/Logo */}
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-[#374151]/35">
            <div className="w-10 h-10 min-w-10 min-h-10 bg-gradient-to-tr from-[#FF6B35] to-orange-400 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md shadow-[#FF6B35]/15">
              Q
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                QRUNTO
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-6 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-4 py-3 rounded-xl transition-all ${
                      sidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    } ${
                      isActive 
                        ? 'bg-[#FF6B35] text-white font-medium shadow-lg shadow-[#FF6B35]/15' 
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#374151]/30'
                    }`
                  }
                  title={link.name}
                >
                  <Icon className="w-5 h-5 min-w-5 min-h-5" />
                  {!sidebarCollapsed && <span className="text-sm">{link.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="border-t border-[#374151]/35 p-4 flex flex-col gap-2">
          {!sidebarCollapsed ? (
            <div className="bg-[#111827]/40 border border-[#374151]/30 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B35]">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-mono truncate tracking-wider uppercase">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B35]" title={user?.name}>
              <User className="w-4 h-4" />
            </div>
          )}
          
          <button
            onClick={() => clearAuth()}
            className={`w-full flex items-center gap-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all ${
              sidebarCollapsed ? 'justify-center px-0' : 'px-4'
            }`}
            title="Log Out"
          >
            <LogOut className="w-5 h-5 min-w-5 min-h-5" />
            {!sidebarCollapsed && <span className="text-sm font-semibold">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-[#374151]/50 bg-[#1f2937]/35 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#FF6B35] to-orange-400 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
            Q
          </div>
          <span className="font-extrabold text-lg tracking-tight">QRUNTO</span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 bg-[#374151]/50 border border-[#4b5563]/40 rounded-xl text-gray-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* 3. Mobile Navigation Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Drawer backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></div>
          
          {/* Drawer sheet content */}
          <div className="relative w-80 max-w-[80%] bg-[#111827] border-r border-[#374151]/50 p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-[#374151]/35">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-tr from-[#FF6B35] to-orange-400 rounded-xl flex items-center justify-center font-bold text-white">
                    Q
                  </div>
                  <span className="font-extrabold text-lg">QRUNTO</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-[#1f2937] border border-[#374151] rounded-lg text-[#9ca3af]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile links */}
              <nav className="py-6 space-y-1">
                {filteredLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.path === '/dashboard'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-[#FF6B35] text-white font-medium shadow-md shadow-[#FF6B35]/15' 
                            : 'text-[#9ca3af] hover:text-white hover:bg-[#374151]/20'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{link.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile bottom profile */}
            <div className="border-t border-[#374151]/35 pt-4 space-y-3">
              <div className="bg-[#1f2937]/50 border border-[#374151]/30 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B35]">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-100">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate uppercase tracking-wider">{userRole.replace('_', ' ')}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  clearAuth();
                }}
                className="w-full flex items-center gap-4 py-3.5 px-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Desktop Main Content Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-[#374151]/40 bg-[#111827]/60 backdrop-blur-md relative z-20">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-100">{currentRoute}</h1>
            <span className="text-xs text-[#9ca3af] mt-0.5">Logged in as {userRole.replace('_', ' ').toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3.5 py-1.5 bg-[#1f2937] border border-[#374151]/50 rounded-xl text-xs font-semibold text-gray-300 shadow-sm">
              🏬 {user?.restaurants[0]?.name}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
};
export default DashboardLayout;

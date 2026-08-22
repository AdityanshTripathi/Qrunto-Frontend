import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Utensils, 
  Tags, 
  QrCode, 
  BarChart3, 
  CreditCard, 
  Settings as SettingsIcon, 
  X, 
  Users,
  Smile,
  Bell,
  BellRing,
  Package
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';

import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from './dashboard-sidebar/DashboardSidebar';

export const DashboardLayout: React.FC = () => {
  const { user, clearAuth, setAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingSub, setCheckingSub] = useState(true);
  const [hasSub, setHasSub] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'NEW_ORDER' | 'BILLING' | 'SYSTEM' | 'HELP_REQUEST';
    isRead: boolean;
    createdAt: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef<number>(0);

  useEffect(() => {
    notificationsRef.current = notifications;
    unreadCountRef.current = unreadCount;
  }, [notifications, unreadCount]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error('Failed to mark all as read: ' + err.message);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      toast.error('Failed to mark notification as read');
    }
  };

  useEffect(() => {
    const fetchNotifications = async (silent = false) => {
      try {
        const res = await api.get('/notifications');
        const newNotifications = res.notifications || [];
        const newUnread = newNotifications.filter((n: any) => !n.isRead).length;
        
        if (!silent && newUnread > unreadCountRef.current) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const playTone = (freq: number, duration: number, delay: number) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = freq;
              osc.type = 'sine';
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);
              osc.start(audioCtx.currentTime + delay);
              osc.stop(audioCtx.currentTime + delay + duration);
            };
            playTone(659.25, 0.15, 0);
            playTone(783.99, 0.25, 0.12);
          } catch (soundErr) {
            console.log('Audio playback blocked by browser or unsupported', soundErr);
          }

          const currentIds = new Set(notificationsRef.current.map(n => n.id));
          const addedNotifs = newNotifications.filter((n: any) => !n.isRead && !currentIds.has(n.id));
          
          addedNotifs.forEach((n: any) => {
            toast.info(n.title, {
              description: n.message,
              duration: 5000,
            });
          });
        }

        setNotifications(newNotifications);
        setUnreadCount(newUnread);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
        const errMsg = err.message?.toLowerCase() || '';
        if (errMsg.includes('token') || errMsg.includes('unauthorized') || errMsg.includes('auth')) {
          clearAuth();
          navigate('/login', { replace: true });
        } else {
          setConnectionError(true);
        }
      } finally {
        setCheckingSub(false);
      }
    };
    checkSubscription();
  }, [navigate, user]);

  if (checkingSub) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-800 dark:text-white font-medium">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#111827] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/50 rounded-[24px] shadow-2xl p-8 text-center relative z-50">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Connection Failed</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
            Unable to connect to the backend server. Please make sure the backend server is running on port 5000.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#FF6B35] hover:bg-orange-600 text-white font-semibold rounded-[12px] py-3.5 transition-all active:scale-[0.98]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!hasSub) {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Active Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Menu Items', path: '/dashboard/menu', icon: Utensils },
    { name: 'Categories', path: '/dashboard/categories', icon: Tags },
    { name: 'Tables & QRs', path: '/dashboard/tables', icon: QrCode },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Waiters', path: '/dashboard/waiters', icon: Users },
    { name: 'CRM Hub', path: '/dashboard/crm', icon: Smile },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Billing Plan', path: '/dashboard/subscription', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  const userRole = user?.role || 'STAFF';
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
    <SidebarProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-[#111827] text-slate-900 dark:text-white flex flex-col w-full">
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
        <div className="flex-1 flex w-full min-w-0">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-[#374151]/40 bg-white/80 dark:bg-[#111827]/60 backdrop-blur-md relative z-20 transition-colors duration-300">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800 dark:text-gray-100">{currentRoute}</h1>
            <span className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">Logged in as {userRole.replace('_', ' ').toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-4 relative">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1f2937]/80 border border-slate-200 dark:border-[#374151]/60 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none rounded-xl"
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-5 h-5 text-[#FF6B35] animate-pulse" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center border border-[#111827]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isNotifOpen && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1f2937]/95 backdrop-blur-md border border-slate-200 dark:border-[#374151]/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-[#374151]/50 flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-[#FF6B35] hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#374151]/35">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-xs font-medium">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => {
                          let Icon = Bell;
                          let iconClass = "text-red-400 bg-red-500/10 border-red-500/20";
                          if (n.type === 'NEW_ORDER') {
                            Icon = ShoppingBag;
                            iconClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                          } else if (n.type === 'BILLING') {
                            Icon = CreditCard;
                            iconClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                          } else if (n.type === 'SYSTEM') {
                            Icon = SettingsIcon;
                            iconClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                          }

                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) handleMarkRead(n.id);
                              }}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-[#374151]/20 transition-colors cursor-pointer flex gap-3 ${
                                !n.isRead ? 'bg-slate-50/50 dark:bg-[#374151]/15' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconClass}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-gray-300'}`}>
                                    {n.title}
                                  </p>
                                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-gray-500 mt-1.5 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <span className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 dark:bg-[#1f2937] dark:border-[#374151]/50 dark:text-gray-300 shadow-sm">
              🏬 {user?.restaurants[0]?.name}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10 scrollbar-thin">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
    </SidebarProvider>
  );
};
export default DashboardLayout;

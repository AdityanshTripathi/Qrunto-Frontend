import { useRestaurantTimezone, localDate, addDays, localHour } from '../../lib/timezone';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, DollarSign, Users, CreditCard, Utensils, Clock, Package, AlertTriangle, CheckCircle2, XCircle, Flame, Star, Zap, QrCode, Plus, BarChart3, Receipt, Smile, Activity, Layers, RefreshCw, ArrowRight, ChefHat } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../config/backend';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIStats {
  totalRevenue: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  activeTablesCount: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Payment {
  id: string;
  paymentMethod: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  table: { tableNumber: string } | null;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
  payments?: Payment[];
}

interface Subscription {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  endDate: string;
  plan: { name: string; price: number };
}



const QUICK_ACTIONS = [
  { label: 'Create QR', icon: QrCode, to: '/dashboard/tables', color: 'bg-orange-500/10 border-orange-500/20 text-[#FF6B35] hover:bg-orange-500/20' },
  { label: 'Add Menu Item', icon: Plus, to: '/dashboard/menu', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20' },
  { label: 'Add Inventory', icon: Package, to: '/dashboard/inventory', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' },
  { label: 'View Reports', icon: BarChart3, to: '/dashboard/analytics', color: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20' },
  { label: 'Manage Staff', icon: Users, to: '/dashboard/waiters', color: 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20' },
  { label: 'CRM Hub', icon: Smile, to: '/dashboard/crm', color: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' },
  { label: 'Billing', icon: Receipt, to: '/dashboard/subscription', color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20' },
  { label: 'Analytics', icon: Activity, to: '/dashboard/analytics', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20' },
];




// ─── Status color map ─────────────────────────────────────────────────────────

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'NEW': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'ACCEPTED': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    case 'PREPARING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'READY': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'SERVED': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'PAID': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

// ─── Custom donut tooltip ─────────────────────────────────────────────────────

const DonutTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/60 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-slate-800 dark:text-white">{payload[0].name}</p>
        <p className="text-slate-500 dark:text-[#9ca3af]">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

// ─── Section card wrapper ─────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#1f2937]/30 border border-slate-200 dark:border-[#374151]/40 rounded-2xl backdrop-blur-md ${className}`}>
    {children}
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  sub?: string;
  action?: React.ReactNode;
}> = ({ title, sub, action }) => (
  <div className="flex items-start justify-between gap-4 mb-5">
    <div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">{title}</h2>
      {sub && <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DashboardOverview: React.FC = () => {
  const restaurantTimeZone = useRestaurantTimezone();
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIStats>({ totalRevenue: 0, totalOrdersCount: 0, averageOrderValue: 0, activeTablesCount: 0 });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [inventoryMetrics, setInventoryMetrics] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderStats, setOrderStats] = useState({ active: 0, new: 0, accepting: 0, preparing: 0, ready: 0, served: 0, cancelled: 0, paid: 0 });
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month'>('today');

  const dashboardRequestRef = useRef<Promise<void> | null>(null);
  const dashboardRefreshQueuedRef = useRef(false);

  const fetchDashboardData = useCallback((queueIfBusy = false): Promise<void> => {
    if (dashboardRequestRef.current) {
      if (queueIfBusy) dashboardRefreshQueuedRef.current = true;
      return dashboardRequestRef.current;
    }

    const request = (async () => {
      do {
        dashboardRefreshQueuedRef.current = false;
        try {
          const inventoryRequest = api.get('/inventory/reports/dashboard-metrics')
            .then(data => ({ data, error: null }))
            .catch(error => ({ data: null, error }));

          const [analyticsRes, subRes, ordersRes, orderStatsRes, inventoryResult] = await Promise.all([
            api.get('/analytics/overview'),
            api.get('/subscriptions/current'),
            api.get('/orders?limit=30'),
            api.get('/orders/stats'),
            inventoryRequest,
          ]);

          setKpis(analyticsRes.kpis || { totalRevenue: 0, totalOrdersCount: 0, averageOrderValue: 0, activeTablesCount: 0 });
          setTopItems(analyticsRes.topSellingItems || []);
          setSubscription(subRes.subscription || null);

          const orders: Order[] = ordersRes.orders || [];
          setAllOrders(orders);
          const active = orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
          setActiveOrders(active.slice(0, 6));
          const stats = orderStatsRes.stats || {};
          setOrderStats({
            active: (stats.NEW || 0) + (stats.ACCEPTED || 0) + (stats.PREPARING || 0) + (stats.READY || 0),
            new: stats.NEW || 0,
            accepting: stats.ACCEPTED || 0,
            preparing: stats.PREPARING || 0,
            ready: stats.READY || 0,
            served: stats.SERVED || 0,
            cancelled: stats.CANCELLED || 0,
            paid: stats.PAID || 0,
          });

          if (inventoryResult.error) {
            setInventoryMetrics(null);
            console.error('Failed to load inventory metrics:', inventoryResult.error);
          } else {
            setInventoryMetrics(inventoryResult.data?.metrics ?? null);
          }
        } catch (err: any) {
          toast.error('Failed to load dashboard data: ' + err.message);
        } finally {
          setLoading(false);
        }
      } while (dashboardRefreshQueuedRef.current);
    })();

    dashboardRequestRef.current = request;
    void request.finally(() => {
      if (dashboardRequestRef.current === request) dashboardRequestRef.current = null;
    });
    return request;
  }, []);

  useEffect(() => {
    setLoading(true);
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const restaurantId = user?.restaurants?.[0]?.id;
    if (!restaurantId || !accessToken) return;

    const socket: Socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
      auth: { token: accessToken },
    });

    const handleUpdate = () => {
      void fetchDashboardData(true);
    };

    socket.on('NEW_ORDER', handleUpdate);
    socket.on('ITEM_ADDED', handleUpdate);
    socket.on('ORDER_UPDATED', handleUpdate);

    return () => {
      socket.disconnect();
    };
  }, [user, accessToken, fetchDashboardData]);

  const getSalesChartData = () => {
    const paidServedOrders = allOrders.filter(o => o && o.status && ['SERVED', 'PAID'].includes(o.status));
    if (paidServedOrders.length === 0) return [];

    if (salesPeriod === 'today') {
      const todayHours = Array.from({ length: 24 }, (_, hour) => `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`);
      const today = new Date();
      
      return todayHours.map(hourStr => {
        let targetHour = parseInt(hourStr);
        if (hourStr.endsWith('pm') && targetHour !== 12) targetHour += 12;
        if (hourStr.endsWith('am') && targetHour === 12) targetHour = 0;
        
        const hourOrders = paidServedOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return localDate(oDate, restaurantTimeZone) === localDate(today, restaurantTimeZone) && localHour(oDate, restaurantTimeZone) === targetHour;
        });
        
        const revenue = hourOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const count = hourOrders.length;
        const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;
        
        return { time: hourStr, revenue, orders: count, aov };
      });
    }
    
    if (salesPeriod === 'week') {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(addDays(localDate(new Date(), restaurantTimeZone), -i) + 'T00:00:00Z');
        weekDays.push(d);
      }
      
      return weekDays.map(date => {
        const dayName = daysOfWeek[date.getUTCDay()]!;
        const dayOrders = paidServedOrders.filter(o => {
          const oDate = new Date(o.createdAt);
          return localDate(oDate, restaurantTimeZone) === date.toISOString().slice(0, 10);
        });
        
        const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const count = dayOrders.length;
        const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;
        
        return { time: dayName, revenue, orders: count, aov };
      });
    }
    
    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const today = localDate(new Date(), restaurantTimeZone);
      const start = addDays(today, -(i + 1) * 7 + 1);
      const end = addDays(today, -i * 7);
      
      const weekOrders = paidServedOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        const day = localDate(oDate, restaurantTimeZone);
        return day >= start && day <= end;
      });
      
      const revenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const count = weekOrders.length;
      const aov = count > 0 ? parseFloat((revenue / count).toFixed(2)) : 0;
      
      monthData.push({ time: `W${4-i}`, revenue, orders: count, aov });
    }
    return monthData;
  };

  const getRevenueTypeData = () => {
    const paidServedOrders = allOrders.filter(o => o && o.status && ['SERVED', 'PAID'].includes(o.status));
    if (paidServedOrders.length === 0) return [];
    
    const dineInCount = paidServedOrders.filter(o => o && o.table).length;
    const otherCount = paidServedOrders.filter(o => o && !o.table).length;
    const total = dineInCount + otherCount || 1;
    
    const dineInPct = Math.round((dineInCount / total) * 100);
    const otherPct = 100 - dineInPct;
    
    
    return [
      { name: 'Dine-in', value: dineInPct, color: '#FF6B35' },
      { name: 'Other', value: otherPct, color: '#3b82f6' },
    ];
  };

  const getPaymentTypeData = () => {
    const payments = allOrders.flatMap(order => order.payments ?? []).filter(payment => payment.status === 'SUCCESS');
    if (payments.length === 0) return [];
    const counts = { UPI: 0, Card: 0, Cash: 0, Other: 0 };
    for (const payment of payments) {
      const method = payment.paymentMethod?.toUpperCase();
      const key = method === 'UPI' ? 'UPI' : method === 'CASH' ? 'Cash' : ['CARD', 'CREDIT_CARD', 'DEBIT_CARD'].includes(method) ? 'Card' : 'Other';
      counts[key]++;
    }
    const colors = { UPI: '#8b5cf6', Card: '#3b82f6', Cash: '#f59e0b', Other: '#64748b' };
    return (Object.keys(counts) as (keyof typeof counts)[]).map(name => ({ name, value: Math.round(counts[name] / payments.length * 100), color: colors[name] }));
  };

  const getSubRemainingDays = () => {
    if (!subscription) return 'No active plan';
    const diff = subscription.endDate ? new Date(subscription.endDate).getTime() - new Date().getTime() : 0;
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `${subscription.plan?.name || 'Active Plan'} — ${days} days left`;
  };

  if (loading) return <SkeletonLoader type="kpis" count={4} />;

  const isStaff = user?.role === 'STAFF';
  const restaurantName = user?.restaurants?.[0]?.name || 'Your Restaurant';
  const now = new Date();
  const hour = localHour(now, restaurantTimeZone);
  const currentShift = hour < 12 ? 'Morning Shift' : hour < 17 ? 'Afternoon Shift' : 'Evening Shift';
  const dateStr = now.toLocaleDateString('en-IN', { ...({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), timeZone: restaurantTimeZone });

  // KPI cards (owner vs staff)
  const kpiCards = isStaff
    ? [
        { title: 'Active Orders', value: orderStats.active.toString(), sub: 'In progress', icon: ShoppingBag, iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
        { title: 'New Orders', value: orderStats.new.toString(), sub: 'Waiting to prepare', icon: Clock, iconBg: 'bg-orange-500/10 border-orange-500/20 text-[#FF6B35]' },
        { title: 'Preparing', value: orderStats.preparing.toString(), sub: 'In kitchen', icon: ChefHat, iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
        { title: 'Ready to Serve', value: orderStats.ready.toString(), sub: 'Awaiting delivery', icon: CheckCircle2, iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
      ]
    : [
        { title: "Today's Revenue", value: `₹${kpis.totalRevenue.toLocaleString('en-IN')}`, sub: 'From completed orders', icon: DollarSign, iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
        { title: "Today's Orders", value: kpis.totalOrdersCount.toString(), sub: 'Completed checkouts', icon: ShoppingBag, iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
        { title: 'Avg Order Value', value: `₹${kpis.averageOrderValue.toLocaleString('en-IN')}`, sub: 'Per customer order', icon: TrendingUp, iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-500' },
        { title: 'Enabled Tables', value: kpis.activeTablesCount.toString(), sub: 'Available for ordering', icon: Layers, iconBg: 'bg-orange-500/10 border-orange-500/20 text-[#FF6B35]' },
        { title: 'Pending Kitchen', value: (orderStats.new + orderStats.preparing).toString(), sub: 'Orders in queue', icon: ChefHat, iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
        { title: 'Subscription', value: subscription ? subscription.status : 'Inactive', sub: getSubRemainingDays(), icon: CreditCard, iconBg: subscription?.status === 'ACTIVE' ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' : 'bg-red-500/10 border-red-500/20 text-red-500' },
      ];

  const liveOpsItems = [
    { label: 'Incoming', value: orderStats.new, color: 'bg-blue-500', light: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Zap },
    { label: 'Accepted', value: orderStats.accepting, color: 'bg-indigo-500', light: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', icon: CheckCircle2 },
    { label: 'Preparing', value: orderStats.preparing, color: 'bg-amber-500', light: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: ChefHat },
    { label: 'Ready', value: orderStats.ready, color: 'bg-emerald-500', light: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    { label: 'Completed', value: orderStats.served + orderStats.paid, color: 'bg-teal-500', light: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', icon: Star },
    { label: 'Cancelled', value: orderStats.cancelled, color: 'bg-red-500', light: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
  ];


  return (
    <div className="space-y-7">

      <p className="text-xs text-slate-500">Charts below use the latest 30 orders. Full-period reports are available in Analytics.</p>
      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B35] mb-1">{currentShift} &middot; {dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white text-balance leading-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af] mt-1">
            Here&apos;s what&apos;s happening at <span className="font-semibold text-slate-700 dark:text-slate-300">{restaurantName}</span> today.
          </p>
        </div>
        <Link
          to="/dashboard/orders"
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20 shrink-0"
        >
          <Activity className="w-4 h-4" />
          Live Orders
        </Link>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className={`grid gap-4 ${isStaff ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'}`}>
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ca3af] leading-tight">{card.title}</p>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{card.value}</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] mt-1.5 flex items-center gap-1">
                    {card.sub}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Live Operations ────────────────────────────────────────── */}
      <Card className="p-5 sm:p-6">
        <SectionHeader
          title="Live Operations"
          sub="Real-time kitchen and order status"
          action={
            <Link to="/dashboard/orders" className="text-xs text-[#FF6B35] hover:text-orange-500 font-semibold flex items-center gap-1 shrink-0">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {liveOpsItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.light}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{item.value}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-[#9ca3af] uppercase tracking-wider">{item.label}</p>
                <div className="w-full h-1 bg-slate-200 dark:bg-[#374151]/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.value > 0 ? Math.min(100, (item.value / Math.max(1, orderStats.active + orderStats.served + orderStats.paid + orderStats.cancelled)) * 100) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Sales Overview ─────────────────────────────────────────── */}
      {!isStaff && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Sales Overview</h2>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">Revenue trend across time periods</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111827]/60 border border-slate-200 dark:border-[#374151]/40 rounded-xl p-1">
              {(['today', 'week', 'month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSalesPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${salesPeriod === p ? 'bg-white dark:bg-[#1f2937] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-[#9ca3af] hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {getSalesChartData().length === 0 && <p className="py-4 text-center text-sm text-slate-500">No completed orders in the recent feed.</p>}
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={getSalesChartData()} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--tw-tooltip-bg, #fff)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: '12px', fontSize: 12 }}
                formatter={(value: any, name: any) => [name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="url(#orderGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Order Types ──────────────────────────────────────── */}
      {!isStaff && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Order Types', sub: 'Dine-in vs Takeaway vs Delivery', data: getRevenueTypeData() },
            { title: 'Payment Methods', sub: 'UPI, Card & Cash breakdown', data: getPaymentTypeData() },
          ].map((chart, ci) => (
            <Card key={ci} className="p-5 sm:p-6">
              <SectionHeader title={chart.title} sub={chart.sub} />
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={chart.data} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {chart.data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 min-w-[120px] w-full sm:w-auto">
                  {chart.data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-xs text-slate-600 dark:text-[#9ca3af]">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Top Selling Items + Active Orders ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Active Orders */}
        <Card className="lg:col-span-3 p-5 sm:p-6 flex flex-col">
          <SectionHeader
            title="Active Orders"
            sub="Live kitchen queue — newest first"
            action={
              <Link to="/dashboard/orders" className="text-xs text-[#FF6B35] hover:text-orange-500 font-semibold flex items-center gap-1 shrink-0">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active orders</p>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-1 max-w-xs">Share your QR codes to start receiving orders in real-time.</p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 hover:border-slate-300 dark:hover:border-[#374151]/60 rounded-xl transition-all cursor-pointer group"
                  onClick={() => navigate('/dashboard/orders')}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">#{order.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-[#FF6B35] border border-orange-500/20 rounded-full font-semibold">
                        Table {order.table?.tableNumber}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] mt-1 truncate max-w-[240px]">
                      {order.orderItems?.map(i => `${i.itemName} ×${i.quantity}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">₹{order.totalAmount}</p>
                    <p className="text-[9px] text-slate-400 dark:text-[#6b7280] flex items-center gap-0.5 justify-end mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(order.createdAt).toLocaleTimeString([], { ...({ hour: '2-digit', minute: '2-digit' }), timeZone: restaurantTimeZone })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Selling Items */}
        <Card className="lg:col-span-2 p-5 sm:p-6 flex flex-col">
          <SectionHeader
            title="Top Selling Items"
            sub="Ranked by recorded sales volume"
            action={
              <Link to="/dashboard/analytics" className="text-xs text-[#FF6B35] hover:text-orange-500 font-semibold flex items-center gap-1 shrink-0">
                More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          {topItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center min-h-[200px]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                <Utensils className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No sales data yet</p>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-1 max-w-xs">Popular items will appear here once orders are placed.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {topItems.slice(0, 7).map((item, idx) => {
                const pct = topItems[0]?.quantity > 0 ? (item.quantity / topItems[0].quantity) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-extrabold shrink-0 ${idx === 0 ? 'bg-[#FF6B35]/10 border border-orange-500/20 text-[#FF6B35]' : idx === 1 ? 'bg-slate-200 dark:bg-[#374151]/50 text-slate-600 dark:text-slate-400' : 'bg-slate-100 dark:bg-[#374151]/30 text-slate-500 dark:text-[#9ca3af]'}`}>
                      {idx === 0 ? <Flame className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-[#374151]/40 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6B35] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-[#9ca3af] shrink-0">{item.quantity} sold</span>
                      </div>
                    </div>
                    {!isStaff && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">₹{item.revenue.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Inventory + Customer + CRM Snapshots ──────────────────── */}
      {!isStaff && (
        <div className="grid grid-cols-1 gap-4">
          {/* Inventory Snapshot */}
          <Card className="p-5 sm:p-6">
            <SectionHeader
              title="Inventory Snapshot"
              sub="Stock health at a glance"
              action={
                <Link to="/dashboard/inventory" className="text-xs text-[#FF6B35] font-semibold flex items-center gap-1 shrink-0">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="space-y-3">
              {[
                { label: 'Stock Value', val: (inventoryMetrics && typeof inventoryMetrics.totalValue === 'number') ? `₹${inventoryMetrics.totalValue.toLocaleString('en-IN')}` : 'N/A', icon: Package, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                { label: 'Low Stock Items', val: (inventoryMetrics && typeof inventoryMetrics.lowStockItems === 'number') ? inventoryMetrics.lowStockItems.toString() : 'N/A', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                { label: 'Out of Stock', val: (inventoryMetrics && typeof inventoryMetrics.outOfStockItems === 'number') ? inventoryMetrics.outOfStockItems.toString() : 'N/A', icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                { label: 'Wastage Today', val: (inventoryMetrics && typeof inventoryMetrics.todayWastage === 'number') ? `₹${inventoryMetrics.todayWastage.toLocaleString('en-IN')}` : 'N/A', icon: RefreshCw, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
              ].map((row, idx) => {
                const Icon = row.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${row.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="flex-1 text-xs text-slate-600 dark:text-[#9ca3af]">{row.label}</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{row.val}</p>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      {!isStaff && (
        <Card className="p-5 sm:p-6">
          <SectionHeader title="Quick Actions" sub="Jump to common workflows" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {QUICK_ACTIONS.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.to}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${action.color}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-semibold text-center leading-tight text-slate-700 dark:text-slate-300 uppercase tracking-wider">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      )}


    </div>
  );
};

export default DashboardOverview;

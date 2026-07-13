import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  Utensils,
  Clock,
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  Zap,
  QrCode,
  Plus,
  BarChart3,
  UserPlus,
  Receipt,
  Smile,
  Activity,
  Layers,
  Timer,
  Award,
  TrendingUp as TrendUp,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Bell,
  Tag,
  Wallet,
  HandCoins,
  ChefHat,
  Soup,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { SkeletonLoader } from '../../components/SkeletonLoader';
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
  Legend,
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

interface Order {
  id: string;
  orderNumber: string;
  table: { tableNumber: string };
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

interface Subscription {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  endDate: string;
  plan: { name: string; price: number };
}

// ─── Static placeholder data for UI sections not yet backed by API ────────────

const MOCK_SALES_DATA = [
  { time: '8am', revenue: 1200, orders: 8, aov: 150 },
  { time: '9am', revenue: 2800, orders: 18, aov: 155 },
  { time: '10am', revenue: 1900, orders: 12, aov: 158 },
  { time: '11am', revenue: 3400, orders: 22, aov: 154 },
  { time: '12pm', revenue: 6200, orders: 42, aov: 147 },
  { time: '1pm', revenue: 7800, orders: 51, aov: 153 },
  { time: '2pm', revenue: 5100, orders: 34, aov: 150 },
  { time: '3pm', revenue: 3200, orders: 21, aov: 152 },
  { time: '4pm', revenue: 2400, orders: 16, aov: 150 },
  { time: '5pm', revenue: 4100, orders: 27, aov: 151 },
  { time: '6pm', revenue: 6900, orders: 46, aov: 150 },
  { time: '7pm', revenue: 8400, orders: 56, aov: 150 },
  { time: '8pm', revenue: 7200, orders: 48, aov: 150 },
  { time: '9pm', revenue: 5600, orders: 38, aov: 147 },
];

const REVENUE_TYPE_DATA = [
  { name: 'Dine-in', value: 62, color: '#FF6B35' },
  { name: 'Takeaway', value: 24, color: '#3b82f6' },
  { name: 'Delivery', value: 14, color: '#10b981' },
];

const PAYMENT_TYPE_DATA = [
  { name: 'UPI', value: 54, color: '#8b5cf6' },
  { name: 'Card', value: 28, color: '#3b82f6' },
  { name: 'Cash', value: 18, color: '#f59e0b' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'order', icon: ShoppingBag, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', label: 'New Order #1042', sub: 'Table 4 — ₹480', time: '2 min ago' },
  { id: 2, type: 'payment', icon: Wallet, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', label: 'Payment Received', sub: 'Table 7 — ₹1,240 via UPI', time: '5 min ago' },
  { id: 3, type: 'inventory', icon: Package, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', label: 'Inventory Updated', sub: 'Paneer stock restocked', time: '18 min ago' },
  { id: 4, type: 'customer', icon: UserPlus, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20', label: 'New Customer Registered', sub: 'Priya Sharma joined', time: '32 min ago' },
  { id: 5, type: 'coupon', icon: Tag, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20', label: 'Coupon Redeemed', sub: 'WELCOME20 — ₹80 discount', time: '48 min ago' },
  { id: 6, type: 'refund', icon: HandCoins, color: 'text-red-500 bg-red-500/10 border-red-500/20', label: 'Refund Issued', sub: 'Order #1038 — ₹350', time: '1 hr ago' },
];

const MOCK_ALERTS = [
  { id: 1, level: 'error', icon: AlertTriangle, color: 'border-red-500/30 bg-red-500/5', iconColor: 'text-red-500 bg-red-500/10 border-red-500/20', badge: 'bg-red-500/15 text-red-500', badgeText: 'Critical', title: 'Out of Stock', sub: 'Cheese (Mozzarella) is fully depleted' },
  { id: 2, level: 'warn', icon: Package, color: 'border-amber-500/30 bg-amber-500/5', iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20', badge: 'bg-amber-500/15 text-amber-500', badgeText: 'Warning', title: 'Low Stock', sub: '5 items running below threshold' },
  { id: 3, level: 'warn', icon: Timer, color: 'border-orange-500/30 bg-orange-500/5', iconColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20', badge: 'bg-orange-500/15 text-orange-500', badgeText: 'Action', title: 'Kitchen Delay', sub: '3 orders pending over 20 minutes' },
  { id: 4, level: 'info', icon: CreditCard, color: 'border-blue-500/30 bg-blue-500/5', iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20', badge: 'bg-blue-500/15 text-blue-500', badgeText: 'Info', title: 'Subscription Expiring', sub: 'Your plan expires in 8 days' },
];

const MOCK_INSIGHTS = [
  { id: 1, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'Revenue increased 18% compared to yesterday.' },
  { id: 2, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', text: 'Cold Coffee sales are growing rapidly — up 34% this week.' },
  { id: 3, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'Inventory for Cheese will finish in approximately 2 days.' },
  { id: 4, icon: Smile, color: 'text-violet-500', bg: 'bg-violet-500/10', text: 'Customer retention improved by 12% this week.' },
];

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

// ─── Tiny Sparkline using SVG ─────────────────────────────────────────────────

const Sparkline: React.FC<{ data: number[]; color: string; positive?: boolean }> = ({ data, color, positive = true }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const fillD = `M ${points[0]} L ${points.join(' L ')} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIStats>({ totalRevenue: 0, totalOrdersCount: 0, averageOrderValue: 0, activeTablesCount: 0 });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orderStats, setOrderStats] = useState({ active: 0, new: 0, accepting: 0, preparing: 0, ready: 0, served: 0, cancelled: 0, paid: 0 });
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const analyticsRes = await api.get('/analytics/overview');
        setKpis(analyticsRes.kpis || { totalRevenue: 0, totalOrdersCount: 0, averageOrderValue: 0, activeTablesCount: 0 });
        setTopItems(analyticsRes.topSellingItems || []);

        const subRes = await api.get('/subscriptions/current');
        setSubscription(subRes.subscription || null);

        const ordersRes = await api.get('/orders');
        const orders: Order[] = ordersRes.orders || [];
        setAllOrders(orders);
        const active = orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
        setActiveOrders(active.slice(0, 6));

        setOrderStats({
          active: active.length,
          new: orders.filter(o => o.status === 'NEW').length,
          accepting: orders.filter(o => o.status === 'ACCEPTED').length,
          preparing: orders.filter(o => o.status === 'PREPARING').length,
          ready: orders.filter(o => o.status === 'READY').length,
          served: orders.filter(o => o.status === 'SERVED').length,
          cancelled: orders.filter(o => o.status === 'CANCELLED').length,
          paid: orders.filter(o => o.status === 'PAID').length,
        });
      } catch (err: any) {
        toast.error('Failed to load dashboard data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getSubRemainingDays = () => {
    if (!subscription) return 'No active plan';
    const diff = new Date(subscription.endDate).getTime() - new Date().getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return `${subscription.plan.name} — ${days} days left`;
  };

  if (loading) return <SkeletonLoader type="kpis" count={4} />;

  const isStaff = user?.role === 'STAFF';
  const restaurantName = user?.restaurants[0]?.name || 'Your Restaurant';
  const now = new Date();
  const hour = now.getHours();
  const currentShift = hour < 12 ? 'Morning Shift' : hour < 17 ? 'Afternoon Shift' : 'Evening Shift';
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // KPI cards (owner vs staff)
  const kpiCards = isStaff
    ? [
        { title: 'Active Orders', value: orderStats.active.toString(), sub: 'In progress', delta: null, icon: ShoppingBag, iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500', spark: [2, 4, 3, 6, 5, 7, 8], sparkColor: '#3b82f6' },
        { title: 'New Orders', value: orderStats.new.toString(), sub: 'Waiting to prepare', delta: null, icon: Clock, iconBg: 'bg-orange-500/10 border-orange-500/20 text-[#FF6B35]', spark: [1, 2, 1, 3, 2, 4, 3], sparkColor: '#FF6B35' },
        { title: 'Preparing', value: orderStats.preparing.toString(), sub: 'In kitchen', delta: null, icon: ChefHat, iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', spark: [3, 2, 4, 3, 5, 4, 6], sparkColor: '#f59e0b' },
        { title: 'Ready to Serve', value: orderStats.ready.toString(), sub: 'Awaiting delivery', delta: null, icon: CheckCircle2, iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', spark: [1, 3, 2, 4, 3, 5, 4], sparkColor: '#10b981' },
      ]
    : [
        { title: "Today's Revenue", value: `₹${kpis.totalRevenue.toLocaleString('en-IN')}`, sub: 'From completed orders', delta: { pct: '+18%', pos: true }, icon: DollarSign, iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500', spark: [3200, 4100, 3800, 5200, 6100, 5800, kpis.totalRevenue || 7200], sparkColor: '#10b981' },
        { title: "Today's Orders", value: kpis.totalOrdersCount.toString(), sub: 'Completed checkouts', delta: { pct: '+12%', pos: true }, icon: ShoppingBag, iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500', spark: [18, 22, 19, 28, 31, 26, kpis.totalOrdersCount || 42], sparkColor: '#3b82f6' },
        { title: 'Avg Order Value', value: `₹${kpis.averageOrderValue.toLocaleString('en-IN')}`, sub: 'Per customer order', delta: { pct: '+5%', pos: true }, icon: TrendingUp, iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-500', spark: [140, 145, 148, 152, 150, 155, kpis.averageOrderValue || 158], sparkColor: '#8b5cf6' },
        { title: 'Active Tables', value: kpis.activeTablesCount.toString(), sub: 'Occupied right now', delta: null, icon: Layers, iconBg: 'bg-orange-500/10 border-orange-500/20 text-[#FF6B35]', spark: [4, 6, 5, 8, 7, 9, kpis.activeTablesCount || 6], sparkColor: '#FF6B35' },
        { title: 'Pending Kitchen', value: (orderStats.new + orderStats.preparing).toString(), sub: 'Orders in queue', delta: null, icon: ChefHat, iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500', spark: [2, 4, 3, 5, 4, 6, orderStats.new + orderStats.preparing], sparkColor: '#f59e0b' },
        { title: 'Subscription', value: subscription ? (subscription.status === 'PENDING' ? 'Pending' : 'Active') : 'Inactive', sub: getSubRemainingDays(), delta: null, icon: CreditCard, iconBg: subscription?.status === 'ACTIVE' ? 'bg-teal-500/10 border-teal-500/20 text-teal-500' : 'bg-red-500/10 border-red-500/20 text-red-500', spark: [1, 1, 1, 1, 1, 1, 1], sparkColor: '#14b8a6' },
      ];

  const liveOpsItems = [
    { label: 'Incoming', value: orderStats.new, color: 'bg-blue-500', light: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Zap },
    { label: 'Accepted', value: orderStats.accepting, color: 'bg-indigo-500', light: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', icon: CheckCircle2 },
    { label: 'Preparing', value: orderStats.preparing, color: 'bg-amber-500', light: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: ChefHat },
    { label: 'Ready', value: orderStats.ready, color: 'bg-emerald-500', light: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
    { label: 'Completed', value: orderStats.served + orderStats.paid, color: 'bg-teal-500', light: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', icon: Star },
    { label: 'Cancelled', value: orderStats.cancelled, color: 'bg-red-500', light: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
  ];

  const salesChartData = salesPeriod === 'today'
    ? MOCK_SALES_DATA
    : salesPeriod === 'week'
    ? [
        { time: 'Mon', revenue: 32000, orders: 212, aov: 151 },
        { time: 'Tue', revenue: 28400, orders: 189, aov: 150 },
        { time: 'Wed', revenue: 41200, orders: 273, aov: 151 },
        { time: 'Thu', revenue: 38700, orders: 257, aov: 150 },
        { time: 'Fri', revenue: 52100, orders: 347, aov: 150 },
        { time: 'Sat', revenue: 67400, orders: 449, aov: 150 },
        { time: 'Sun', revenue: 59800, orders: 398, aov: 150 },
      ]
    : [
        { time: 'W1', revenue: 180000, orders: 1200, aov: 150 },
        { time: 'W2', revenue: 210000, orders: 1400, aov: 150 },
        { time: 'W3', revenue: 195000, orders: 1300, aov: 150 },
        { time: 'W4', revenue: 230000, orders: 1533, aov: 150 },
      ];

  return (
    <div className="space-y-7">

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

      {/* ── Alerts Bar ─────────────────────────────────────────────── */}
      {!isStaff && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {MOCK_ALERTS.map(alert => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`flex-shrink-0 flex items-center gap-3 border rounded-xl px-4 py-2.5 ${alert.color}`}>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${alert.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{alert.title}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${alert.badge}`}>{alert.badgeText}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] mt-0.5 whitespace-nowrap">{alert.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                    {card.delta && (
                      <span className={`font-bold ${card.delta.pos ? 'text-emerald-500' : 'text-red-400'} flex items-center gap-0.5`}>
                        {card.delta.pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {card.delta.pct}
                      </span>
                    )}
                    {card.sub}
                  </p>
                </div>
                <Sparkline data={card.spark} color={card.sparkColor} positive={card.delta?.pos ?? true} />
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
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                formatter={(value: any, name: string) => [name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="url(#orderGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Revenue Breakdown ──────────────────────────────────────── */}
      {!isStaff && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Revenue by Type', sub: 'Dine-in vs Takeaway vs Delivery', data: REVENUE_TYPE_DATA },
            { title: 'Payment Methods', sub: 'UPI, Card & Cash breakdown', data: PAYMENT_TYPE_DATA },
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
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            sub="Ranked by volume today"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                { label: 'Stock Value', val: '₹42,800', icon: Package, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                { label: 'Low Stock Items', val: '5', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                { label: 'Out of Stock', val: '2', icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                { label: 'Fast Moving', val: '8 items', icon: Flame, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                { label: 'Wastage Today', val: '₹320', icon: RefreshCw, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
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

          {/* Customer Snapshot */}
          <Card className="p-5 sm:p-6">
            <SectionHeader
              title="Customer Snapshot"
              sub="Retention and loyalty metrics"
              action={
                <Link to="/dashboard/crm" className="text-xs text-[#FF6B35] font-semibold flex items-center gap-1 shrink-0">
                  CRM <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="space-y-3">
              {[
                { label: 'New Customers', val: '24', icon: UserPlus, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                { label: 'Returning Customers', val: '68', icon: Users, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
                { label: 'Repeat Rate', val: '73%', icon: TrendUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Loyalty Members', val: '182', icon: Award, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                { label: 'Satisfaction', val: '4.8 / 5', icon: Star, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
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

          {/* CRM Insights */}
          <Card className="p-5 sm:p-6">
            <SectionHeader
              title="CRM Insights"
              sub="Campaigns and loyalty performance"
              action={
                <Link to="/dashboard/crm" className="text-xs text-[#FF6B35] font-semibold flex items-center gap-1 shrink-0">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />
            <div className="space-y-3">
              {[
                { label: 'Customer Growth', val: '+14%', icon: TrendUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Loyalty Points Issued', val: '1,840', icon: Award, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                { label: 'Coupons Redeemed', val: '37', icon: Tag, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
                { label: 'Birthday Customers', val: '3 today', icon: Smile, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
                { label: 'Churn Risk', val: '12 customers', icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
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

      {/* ── AI Business Insights ───────────────────────────────────── */}
      {!isStaff && (
        <Card className="p-5 sm:p-6">
          <SectionHeader
            title="Business Insights"
            sub="AI-powered observations (preview)"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MOCK_INSIGHTS.map(insight => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="flex items-start gap-3 bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${insight.bg}`}>
                    <Icon className={`w-4 h-4 ${insight.color}`} />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <p className="text-[10px] text-slate-400 dark:text-[#6b7280]">AI insights are illustrative placeholders — live intelligence coming soon.</p>
          </div>
        </Card>
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

      {/* ── Performance Widgets ────────────────────────────────────── */}
      {!isStaff && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Best Category', val: 'Beverages', icon: Soup, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
            { label: 'Best Item', val: 'Cold Coffee', icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
            { label: 'Peak Hour', val: '7–8 PM', icon: Clock, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
            { label: 'Most Profitable', val: 'Paneer Tikka', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Best Waiter', val: 'Rahul K.', icon: Award, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
            { label: 'Fastest Category', val: 'Fast Food', icon: Zap, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' },
          ].map((widget, idx) => {
            const Icon = widget.icon;
            return (
              <Card key={idx} className="p-4 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${widget.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9ca3af]">{widget.label}</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">{widget.val}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Activity Timeline + Alerts ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Timeline */}
        <Card className="p-5 sm:p-6">
          <SectionHeader title="Activity Timeline" sub="Recent events across the restaurant" />
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-slate-200 dark:bg-[#374151]/40" />
            <div className="space-y-4">
              {MOCK_ACTIVITY.map((event, idx) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="flex items-start gap-3 pl-1">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 z-10 ${event.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-white">{event.label}</p>
                        <span className="text-[10px] text-slate-400 dark:text-[#6b7280] shrink-0">{event.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] mt-0.5">{event.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Alerts & Warnings */}
        <Card className="p-5 sm:p-6">
          <SectionHeader
            title="Alerts"
            sub="Items requiring your attention"
            action={
              <span className="text-[10px] font-bold text-slate-400 dark:text-[#6b7280] bg-slate-100 dark:bg-[#374151]/30 border border-slate-200 dark:border-[#374151]/40 px-2 py-1 rounded-lg">
                {MOCK_ALERTS.length} active
              </span>
            }
          />
          <div className="space-y-3">
            {MOCK_ALERTS.map(alert => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`flex items-start gap-3 border rounded-xl p-4 ${alert.color}`}>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${alert.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{alert.title}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${alert.badge}`}>{alert.badgeText}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] mt-0.5">{alert.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-[#6b7280] shrink-0 mt-0.5" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default DashboardOverview;

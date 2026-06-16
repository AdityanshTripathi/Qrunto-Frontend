import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  CreditCard, 
  ArrowUpRight, 
  Utensils, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { SkeletonLoader } from '../../components/SkeletonLoader';

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
  table: {
    tableNumber: string;
  };
  status: 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItem[];
}

interface Subscription {
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  endDate: string;
  plan: {
    name: string;
    price: number;
  };
}

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIStats>({
    totalRevenue: 0,
    totalOrdersCount: 0,
    averageOrderValue: 0,
    activeTablesCount: 0,
  });
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const analyticsRes = await api.get('/analytics/overview');
        setKpis(analyticsRes.kpis || {
          totalRevenue: 0,
          totalOrdersCount: 0,
          averageOrderValue: 0,
          activeTablesCount: 0,
        });
        setTopItems(analyticsRes.topSellingItems || []);

        const subRes = await api.get('/subscriptions/current');
        setSubscription(subRes.subscription || null);

        const ordersRes = await api.get('/orders');
        const allOrders: Order[] = ordersRes.orders || [];
        const active = allOrders.filter(
          (o) => o.status === 'NEW' || o.status === 'PREPARING' || o.status === 'READY'
        );
        setActiveOrders(active.slice(0, 5));
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
    return `${subscription.plan.name} Plan (${days} days left)`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PREPARING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'READY': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return <SkeletonLoader type="kpis" count={4} />;
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${kpis.totalRevenue.toLocaleString('en-IN')}`,
      change: 'From completed orders',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Total Served Orders',
      value: kpis.totalOrdersCount.toString(),
      change: 'Customer checkouts',
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Average Order Value',
      value: `₹${kpis.averageOrderValue.toLocaleString('en-IN')}`,
      change: 'Revenue per customer order',
      icon: Users,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Subscription Status',
      value: subscription ? (subscription.status === 'PENDING' ? 'Pending Payment' : 'Active') : 'Inactive',
      change: getSubRemainingDays(),
      icon: CreditCard,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#FF6B35]/20 via-[#FF6B35]/5 to-transparent border border-[#FF6B35]/20 rounded-[20px] p-5 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-48 sm:w-64 h-48 sm:h-64 bg-[#FF6B35]/5 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-slate-600 dark:text-[#9ca3af] mt-2 text-sm md:text-base">
          Here is what's happening at <span className="text-slate-900 dark:text-white font-semibold">{user?.restaurants[0]?.name}</span> today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/35 rounded-[20px] p-5 sm:p-6 backdrop-blur-md hover:border-[#FF6B35]/30 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-[#9ca3af]">{stat.title}</span>
                <div className={`w-10 h-10 bg-gradient-to-tr ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md shadow-black/10 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
                <p className="text-[11px] text-slate-500 dark:text-[#9ca3af] mt-1.5">
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Active Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/25 border border-slate-200 dark:border-[#374151]/35 rounded-[24px] p-5 sm:p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Incoming Active Orders</h2>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">Fresh scans and kitchen orders needing preparation</p>
            </div>
            <Link 
              to="/dashboard/orders" 
              className="text-sm text-[#FF6B35] hover:text-orange-500 font-semibold flex items-center gap-1 transition-colors shrink-0"
            >
              <span className="hidden sm:inline">Manage Orders</span>
              <span className="sm:hidden">View all</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-10 sm:py-12 text-center min-h-[220px] sm:min-h-[280px]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-slate-100 dark:bg-[#374151]/35 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-[#9ca3af]">
                <ShoppingBag className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <p className="font-bold text-slate-700 dark:text-gray-300">No active orders right now</p>
              <p className="text-xs max-w-xs mt-1 text-slate-500 dark:text-[#9ca3af]">
                Incoming orders from tables will appear here in real-time. Share your table QR codes to start receiving orders!
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {activeOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-slate-50 dark:bg-[#1f2937]/40 border border-slate-200 dark:border-[#374151]/25 hover:border-slate-300 dark:hover:border-[#374151]/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">Order #{order.orderNumber}</span>
                      <span className="text-xs px-2.5 py-0.5 bg-orange-500/10 text-[#FF6B35] border border-orange-500/20 rounded-full font-semibold">
                        Table {order.table?.tableNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#9ca3af] truncate max-w-xs">
                      {order.orderItems?.map(i => `${i.itemName} x${i.quantity}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm">₹{order.totalAmount}</p>
                      <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button 
                      onClick={() => navigate('/dashboard/orders')} 
                      className="p-1.5 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151]/40 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="bg-white dark:bg-[#1f2937]/25 border border-slate-200 dark:border-[#374151]/35 rounded-[24px] p-5 sm:p-6 backdrop-blur-md flex flex-col">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Top Selling Items</h2>
            <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">Most popular dishes ordered by volume</p>
          </div>

          {topItems.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-10 sm:py-12 text-center min-h-[220px] sm:min-h-[280px]">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-slate-100 dark:bg-[#374151]/35 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-[#9ca3af]">
                <Utensils className="w-6 sm:w-7 h-6 sm:h-7" />
              </div>
              <p className="font-bold text-slate-700 dark:text-gray-300">No sales analytics yet</p>
              <p className="text-xs max-w-xs mt-1 text-slate-500 dark:text-[#9ca3af]">
                Once customers place orders, your most popular menu items will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 flex-1">
              {topItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 border border-orange-500/20 text-[#FF6B35] font-extrabold flex items-center justify-center text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#9ca3af]">{item.quantity} portions sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{item.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

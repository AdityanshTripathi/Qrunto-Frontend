import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Layers,
  RefreshCw,
  Award,
  Calendar,
  Grid,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAuthStore } from '../../store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KPI {
  totalRevenue: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  activeTablesCount: number;
}

interface TrendPoint {
  date: string;
  revenue: number;
  count: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface TablePerformance {
  tableNumber: string;
  ordersCount: number;
  revenue: number;
}

interface AnalyticsData {
  kpis: KPI;
  trendData: TrendPoint[];
  topSellingItems: TopItem[];
  tablePerformance: TablePerformance[];
}

// ─── Currency formatter ───────────────────────────────────────────────────────
const fmt = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

const BASE_URL = 'https://qrunto-api-demo.loca.lt/api';

// ─── Custom Tooltip for AreaChart ─────────────────────────────────────────────
const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-[#374151] rounded-xl p-3 shadow-xl text-xs space-y-1">
        <p className="text-gray-400 font-semibold">{label}</p>
        <p className="text-[#FF6B35] font-bold">Revenue: {fmt(payload[0]?.value ?? 0)}</p>
        <p className="text-blue-400 font-bold">Orders: {payload[1]?.value ?? 0}</p>
      </div>
    );
  }
  return null;
};

// ─── Custom Tooltip for BarChart ──────────────────────────────────────────────
const ItemTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-[#374151] rounded-xl p-3 shadow-xl text-xs space-y-1">
        <p className="text-gray-300 font-semibold truncate max-w-[150px]">{label}</p>
        <p className="text-amber-400 font-bold">Qty: {payload[0]?.value ?? 0} units</p>
        <p className="text-emerald-400 font-bold">Revenue: {fmt(payload[1]?.value ?? 0)}</p>
      </div>
    );
  }
  return null;
};

// ─── Colors for Pie ───────────────────────────────────────────────────────────
const PIE_COLORS = ['#FF6B35', '#f59e0b', '#10b981', '#6b7280', '#f43f5e'];

export const Analytics: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchAnalytics = useCallback(async (isSync = false) => {
    if (!token) return;
    if (isSync) setSyncing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch analytics');
      setData(resData);
      if (isSync) toast.success('Analytics refreshed!');
    } catch (err: any) {
      toast.error(err.message || 'Error fetching analytics');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        <p className="text-[#9ca3af] text-sm font-medium">Crunching your numbers...</p>
      </div>
    );
  }

  const kpis = data?.kpis ?? { totalRevenue: 0, totalOrdersCount: 0, averageOrderValue: 0, activeTablesCount: 0 };
  const trendData = data?.trendData ?? [];
  const topSellingItems = data?.topSellingItems ?? [];
  const tablePerformance = data?.tablePerformance ?? [];

  // Pie data for table performance
  const pieData = tablePerformance.map((t) => ({
    name: `Table ${t.tableNumber}`,
    value: t.revenue,
  }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Analytics</h1>
          <p className="text-sm text-[#9ca3af]">Revenue, order trends, top items, and table performance.</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={syncing}
          className="px-4 py-2 bg-[#1f2937]/50 border border-[#374151]/30 hover:border-[#FF6B35]/40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[22px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-semibold">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{fmt(kpis.totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[22px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-semibold">Total Orders</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{kpis.totalOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[22px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-semibold">Avg Order Value</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{fmt(kpis.averageOrderValue)}</h3>
          </div>
        </div>

        <div className="bg-[#1f2937]/25 border border-[#374151]/35 rounded-[22px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#9ca3af] font-semibold">Active Tables</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{kpis.activeTablesCount}</h3>
          </div>
        </div>
      </div>

      {/* Revenue Trend (AreaChart) */}
      <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-[26px] p-6">
        <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-6 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          7-Day Revenue & Order Trend
        </h3>

        {trendData.length === 0 ? (
          <div className="text-center py-16 text-[#9ca3af] text-sm">No trend data available yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TrendTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ fill: '#FF6B35', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Area yAxisId="right" type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#gradCount)" dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Items BarChart + Table Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Items BarChart */}
        <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Top 5 Dishes by Volume
          </h3>

          {topSellingItems.length === 0 ? (
            <div className="text-center py-16 text-[#9ca3af] text-sm">No items sold yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topSellingItems}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#d1d5db', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ItemTooltip />} cursor={{ fill: 'rgba(255,107,53,0.05)' }} />
                <Bar dataKey="quantity" name="Units Sold" radius={[0, 6, 6, 0]} fill="#FF6B35" fillOpacity={0.85} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]} fill="#f59e0b" fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table Performance Pie Chart */}
        <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Revenue by Table
          </h3>

          {pieData.length === 0 ? (
            <div className="text-center py-16 text-[#9ca3af] text-sm">No table data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table Performance Detail Breakdown */}
      {tablePerformance.length > 0 && (
        <div className="bg-[#1f2937]/20 border border-[#374151]/30 rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-6 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Table Revenue Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {tablePerformance.map((table, i) => (
              <div key={table.tableNumber} className="bg-[#111827]/30 border border-[#374151]/35 rounded-[20px] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <h4 className="font-extrabold text-white text-sm">Table {table.tableNumber}</h4>
                </div>
                <p className="text-[10px] text-[#9ca3af]">{table.ordersCount} orders served</p>
                <p className="text-[#FF6B35] font-extrabold text-sm mt-2">{fmt(table.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Analytics;

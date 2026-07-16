import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Percent,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';

interface ExecutiveData {
  revenue: {
    today: number;
    yesterday: number;
    weekly: number;
    monthly: number;
    gross: number;
    net: number;
    gst: number;
    discounts: number;
    refunds: number;
  };
  orders: {
    total: number;
    completed: number;
    cancelled: number;
  };
  averages: {
    aov: number;
    itemsPerOrder: number;
    revenuePerTable: number;
    revenuePerCustomer: number;
    revenuePerHour: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    repeatRate: number;
    clv: number;
  };
  occupancy: {
    activeTables: number;
    currentOccupancyRate: number;
    peakOccupancyRate: number;
  };
}

interface ExecutiveTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const ExecutiveTab: React.FC<ExecutiveTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<ExecutiveData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExecutive = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/executive?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch executive dashboard');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching executive analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchExecutive();
  }, [fetchExecutive, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700/50 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Comparison indicator today vs yesterday
  const revDiff = data.revenue.today - data.revenue.yesterday;
  const isPositive = revDiff >= 0;
  const pctChange = data.revenue.yesterday > 0 
    ? ((revDiff / data.revenue.yesterday) * 100).toFixed(1) 
    : '0.0';

  // Occupancy Radial Data
  const occupancyChartData = [
    {
      name: 'Peak Occupancy',
      value: data.occupancy.peakOccupancyRate,
      fill: '#f59e0b',
    },
    {
      name: 'Current Occupancy',
      value: data.occupancy.currentOccupancyRate,
      fill: '#FF6B35',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Upper Row: Quick Comparatives & Core Revenue ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales Card */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1f2937]/30 dark:to-[#111827]/10 border border-slate-200 dark:border-[#374151]/30 rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B35]/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Today's Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {fmt(data.revenue.today)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center text-[#FF6B35]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span className={`flex items-center gap-0.5 font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {pctChange}%
            </span>
            <span className="text-slate-400 dark:text-gray-500 font-medium">vs yesterday ({fmt(data.revenue.yesterday)})</span>
          </div>
        </div>

        {/* Gross Sales */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1f2937]/30 dark:to-[#111827]/10 border border-slate-200 dark:border-[#374151]/30 rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Gross Sales</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {fmt(data.revenue.gross)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 font-medium">
            <span>Includes GST: {fmt(data.revenue.gst)}</span>
          </div>
        </div>

        {/* Net Sales */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1f2937]/30 dark:to-[#111827]/10 border border-slate-200 dark:border-[#374151]/30 rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Net Sales</p>
              <h3 className="text-2xl font-black text-[#FF6B35] mt-2">
                {fmt(data.revenue.net)}
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 font-medium">
            <span>Discounts: {fmt(data.revenue.discounts)} | Refunds: {fmt(data.revenue.refunds)}</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#1f2937]/30 dark:to-[#111827]/10 border border-slate-200 dark:border-[#374151]/30 rounded-[24px] p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">Orders Overview</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {data.orders.total} <span className="text-xs font-medium text-slate-400">Total</span>
              </h3>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 font-medium">
            <span className="text-emerald-500 font-bold">{data.orders.completed} Served</span>
            <span>|</span>
            <span className="text-rose-500 font-bold">{data.orders.cancelled} Cancelled</span>
          </div>
        </div>
      </div>

      {/* ─── Middle Row: Advanced KPIs and Customer CRM ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations & Averages */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            Operating & Performance Averages
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Average Order Value</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{fmt(data.averages.aov)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Average Items / Order</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{data.averages.itemsPerOrder} items</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Revenue per Table</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{fmt(data.averages.revenuePerTable)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Revenue per Customer</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{fmt(data.averages.revenuePerCustomer)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Revenue per Operating Hour</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{fmt(data.averages.revenuePerHour)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-100 dark:border-[#374151]/20 rounded-[20px] p-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Weekly Revenue</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{fmt(data.revenue.weekly)}</p>
            </div>
          </div>
        </div>

        {/* Table Occupancy Gauges */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B35]" />
              Table Occupancy Gauges
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500">Real-time and historic peak occupancy rate</p>
          </div>

          <div className="h-[180px] my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={12} data={occupancyChartData}>
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 'bold' }}
                  background
                  dataKey="value"
                />
                <Legend iconSize={8} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-[#374151]/20 pt-4">
            <div>
              <span className="text-slate-400 dark:text-gray-500">Currently Active</span>
              <p className="text-base font-black text-slate-800 dark:text-white mt-0.5">{data.occupancy.activeTables} Tables</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 dark:text-gray-500">Peak Occupancy</span>
              <p className="text-base font-black text-amber-500 mt-0.5">{data.occupancy.peakOccupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Customer Cohorts & CRM ─── */}
      <div className="bg-gradient-to-r from-[#FF6B35]/5 to-indigo-500/5 dark:from-[#FF6B35]/5 dark:to-indigo-500/5 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#FF6B35]" />
          CRM Customer Cohorts & Loyalty Value
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111827]/40 border border-slate-150 dark:border-[#374151]/30 rounded-[20px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Total Unique Customers</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{data.customers.total}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827]/40 border border-slate-150 dark:border-[#374151]/30 rounded-[20px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">New Customers</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{data.customers.new}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827]/40 border border-slate-150 dark:border-[#374151]/30 rounded-[20px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center text-[#FF6B35]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Returning Customers</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{data.customers.returning}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827]/40 border border-slate-150 dark:border-[#374151]/30 rounded-[20px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-500">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">Repeat Rate / LTV CLV</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {data.customers.repeatRate}% | <span className="text-emerald-500 font-black">{fmt(data.customers.clv)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

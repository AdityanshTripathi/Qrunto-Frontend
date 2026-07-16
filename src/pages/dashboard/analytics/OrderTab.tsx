import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface TimingData {
  avgPrepTime: number;
  avgDeliveryTime: number;
  avgTableTurnaround: number;
  delayPercentage: {
    kitchen: number;
    waiter: number;
  };
}

interface StatusesData {
  completed: number;
  cancelled: number;
  rejected: number;
  pending: number;
}

interface ConversionData {
  qrViews: number;
  cartSessions: number;
  ordersPlaced: number;
  cartAbandonmentRate: number;
}

interface OrderAnalyticsData {
  timing: TimingData;
  statuses: StatusesData;
  conversion: ConversionData;
}

interface OrderTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

export const OrderTab: React.FC<OrderTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<OrderAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/orders?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch order analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching order analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchOrderAnalytics();
  }, [fetchOrderAnalytics, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Funnel chart data
  const funnelData = [
    { name: '1. QR Menu Views', value: data.conversion.qrViews, color: '#3b82f6' },
    { name: '2. Cart Sessions', value: data.conversion.cartSessions, color: '#FF6B35' },
    { name: '3. Orders Placed', value: data.conversion.ordersPlaced, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Speed & Timings KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Avg Prep Time</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.timing.avgPrepTime} mins</h3>
            </div>
            <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center text-[#FF6B35]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">KOT submission to ready status</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Avg Service Time</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.timing.avgDeliveryTime} mins</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Order creation to served status</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Table Turnaround</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.timing.avgTableTurnaround} mins</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Avg duration from check-in to payment</span>
        </div>
      </div>

      {/* 2. Funnel and Service Delays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Menu Conversion Funnel
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Analyze catalog engagement vs completed checkouts</span>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 5, right: 25, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-[#374151]/20 pt-4 text-xs font-semibold text-slate-500 dark:text-gray-400">
            <div>
              <span className="text-[10px] text-slate-400 block">Cart Abandonment Rate</span>
              <span className="text-lg font-black text-rose-500 mt-1 block">{data.conversion.cartAbandonmentRate}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Scan to Order Conversion</span>
              <span className="text-lg font-black text-emerald-500 mt-1 block">
                {data.conversion.qrViews > 0 ? ((data.conversion.ordersPlaced / data.conversion.qrViews) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Delay and Statuses Breakdown */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Service Delays & Volumes
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Identify bottleneck areas and check overall statuses</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-600 dark:text-gray-300">Kitchen Delay Ratio</span>
                <span className="font-black text-rose-500">{data.timing.delayPercentage.kitchen}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${data.timing.delayPercentage.kitchen}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">Orders exceeding 20 minutes prep target</span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-600 dark:text-gray-300">Waiter Delay Ratio</span>
                <span className="font-black text-amber-500">{data.timing.delayPercentage.waiter}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${data.timing.delayPercentage.waiter}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block">Ready-to-serve transition lag &gt; 5 mins</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-[#374151]/20 pt-4 text-center mt-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block">Completed</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{data.statuses.completed}</span>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block">Pending</span>
              <span className="text-sm font-black text-yellow-600 dark:text-yellow-400 mt-1 block">{data.statuses.pending}</span>
            </div>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block">Cancelled</span>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400 mt-1 block">{data.statuses.cancelled}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <span className="text-[9px] text-slate-400 font-bold block">Rejected</span>
              <span className="text-sm font-black text-slate-600 dark:text-slate-400 mt-1 block">{data.statuses.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

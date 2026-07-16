import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp,
  Calendar,
  Clock,
  Coffee,
  Award,
  Sparkles,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SalesData {
  trends: Array<{
    timeLabel: string;
    revenue: number;
    orders: number;
  }>;
  heatmap: Array<{
    day: string;
    hour: number;
    revenue: number;
  }>;
  metrics: {
    bestDay: {
      date: string;
      revenue: number;
    };
    worstDay: {
      date: string;
      revenue: number;
    };
    weekdayWeekend: {
      weekday: number;
      weekend: number;
    };
    daypart: {
      lunch: number;
      dinner: number;
    };
  };
  categoryRevenue: Array<{
    name: string;
    revenue: number;
  }>;
}

interface SalesTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const PIE_COLORS = ['#FF6B35', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const SalesTab: React.FC<SalesTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/sales?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch sales analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching sales analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
          <div className="h-56 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Donut data for Weekday vs Weekend
  const wwData = [
    { name: 'Weekday', value: data.metrics.weekdayWeekend.weekday },
    { name: 'Weekend', value: data.metrics.weekdayWeekend.weekend },
  ];

  // Helper for Heatmap color intensity
  const maxRevenue = Math.max(...data.heatmap.map((h) => h.revenue), 1);
  const getHeatmapColor = (revenue: number) => {
    const intensity = Math.min(revenue / maxRevenue, 1);
    if (intensity === 0) return 'bg-slate-100 dark:bg-slate-800/20';
    if (intensity < 0.25) return 'bg-[#FF6B35]/10 text-[#FF6B35]';
    if (intensity < 0.5) return 'bg-[#FF6B35]/30 text-white';
    if (intensity < 0.75) return 'bg-[#FF6B35]/65 text-white';
    return 'bg-[#FF6B35] text-white font-bold shadow-sm';
  };

  // Days list for Heatmap matrix
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Show key restaurant hours: 11:00 to 23:00 (11 AM to 11 PM)
  const hoursToShow = Array.from({ length: 13 }, (_, i) => i + 11);

  return (
    <div className="space-y-6">
      {/* 1. Revenue & Order Trends */}
      <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Revenue & Order Trend
        </h3>

        {data.trends.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-[#9ca3af] text-sm">No sales data in this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.trends} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.3} className="dark:[stroke:#374151]" />
              <XAxis dataKey="timeLabel" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? fmt(Number(value)) : value, name]} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#salesGrad)" name="revenue" dot={{ fill: '#FF6B35', r: 4 }} />
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="url(#ordersGrad)" name="orders" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 2. Heatmap & Daily Extremes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Sales Hourly Heatmap (₹)
            </h3>

            <div className="grid grid-cols-14 gap-1.5 text-center text-[10px] font-bold text-slate-400 dark:text-gray-500 mb-2">
              <div>Day</div>
              {hoursToShow.map((h) => (
                <div key={h}>{h}:00</div>
              ))}
            </div>

            <div className="space-y-1.5">
              {daysOfWeek.map((d) => (
                <div key={d} className="grid grid-cols-14 gap-1.5 items-center">
                  <div className="text-[10px] font-bold text-slate-500 dark:text-gray-400 text-left truncate">{d.slice(0, 3)}</div>
                  {hoursToShow.map((h) => {
                    const cell = data.heatmap.find((hm) => hm.day === d && hm.hour === h);
                    const rev = cell?.revenue || 0;
                    return (
                      <div
                        key={h}
                        title={`${d} at ${h}:00 - ${fmt(rev)}`}
                        className={`h-7 rounded-md flex items-center justify-center text-[9px] font-semibold transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(rev)}`}
                      >
                        {rev > 0 ? `${Math.round(rev / 100) / 10}k` : '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extremes & Dayparts */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sales Breakdown
            </h3>
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-100 dark:border-[#374151]/20">
                <span className="text-[10px] text-slate-400 font-semibold block">Best Sales Day</span>
                <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">
                  {data.metrics.bestDay.date !== 'N/A' 
                    ? `${new Date(data.metrics.bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                    : 'N/A'}
                </span>
                <span className="text-xs font-extrabold text-emerald-500">{fmt(data.metrics.bestDay.revenue)}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#111827]/40 rounded-xl border border-slate-100 dark:border-[#374151]/20">
                <span className="text-[10px] text-slate-400 font-semibold block">Worst Sales Day</span>
                <span className="text-sm font-black text-slate-800 dark:text-white mt-1 block">
                  {data.metrics.worstDay.date !== 'N/A' 
                    ? `${new Date(data.metrics.worstDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                    : 'N/A'}
                </span>
                <span className="text-xs font-extrabold text-rose-500">{fmt(data.metrics.worstDay.revenue)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-4">
            <span className="text-[10px] text-slate-400 font-semibold mb-2 block">Daypart Split (Lunch vs Dinner)</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5 text-amber-500" /> Lunch (11-4)</span>
                <span className="font-extrabold">{fmt(data.metrics.daypart.lunch)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${(data.metrics.daypart.lunch / (data.metrics.daypart.lunch + data.metrics.daypart.dinner || 1)) * 100}%` }} 
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Dinner (6-11)</span>
                <span className="font-extrabold">{fmt(data.metrics.daypart.dinner)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category & Weekday Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Bar Chart */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Revenue by Menu Category (₹)
          </h3>

          {data.categoryRevenue.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-[#9ca3af] text-sm">No category revenue available.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.categoryRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'rgba(255,107,53,0.02)' }} />
                <Bar dataKey="revenue" fill="#FF6B35" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {data.categoryRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekday vs Weekend Donut Chart */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Weekday vs Weekend Split
          </h3>

          <div className="h-[150px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wwData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#FF6B35" />
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-semibold pt-2 text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Weekdays: {fmt(data.metrics.weekdayWeekend.weekday)}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full" /> Weekends: {fmt(data.metrics.weekdayWeekend.weekend)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

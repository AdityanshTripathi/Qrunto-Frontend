import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Activity,
  Award,
  Gift,
  Calendar,
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

interface SegmentationData {
  vip: number;
  dormant: number;
  churned: number;
  active: number;
}

interface BehaviorData {
  avgSpend: number;
  frequencyDays: number;
  clv: number;
}

interface UpcomingEventsData {
  birthdays: number;
  anniversaries: number;
}

interface RetentionRow {
  cohort: string;
  size: number;
  m1: number;
  m2: number;
  m3: number;
}

interface CustomerAnalyticsData {
  summary: {
    total: number;
    new: number;
    returning: number;
  };
  segmentation: SegmentationData;
  behavior: BehaviorData;
  upcomingEvents: UpcomingEventsData;
  retentionMatrix: RetentionRow[];
}

interface CustomerTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);


export const CustomerTab: React.FC<CustomerTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/customers?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch customer analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching customer analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchCustomerAnalytics();
  }, [fetchCustomerAnalytics, refreshTrigger]);

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

  // Segment bar chart data
  const segmentChartData = [
    { name: 'Active', count: data.segmentation.active, color: '#10b981' },
    { name: 'VIP', count: data.segmentation.vip, color: '#3b82f6' },
    { name: 'Dormant', count: data.segmentation.dormant, color: '#f59e0b' },
    { name: 'Churned', count: data.segmentation.churned, color: '#ef4444' },
  ];

  // Helper for cohort cell background
  const getCohortColor = (value: number, total: number) => {
    if (total === 0 || value === 0) return 'bg-slate-50 dark:bg-slate-800/10 text-slate-300';
    const rate = (value / total) * 100;
    if (rate > 70) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold';
    if (rate > 50) return 'bg-emerald-500/10 text-emerald-500';
    if (rate > 30) return 'bg-[#FF6B35]/10 text-[#FF6B35]';
    return 'bg-[#FF6B35]/5 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive CRM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Average CLV</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{fmt(data.behavior.clv)}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Average cumulative spend per customer profile</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Average Visit Interval</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.behavior.frequencyDays} days</h3>
            </div>
            <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center text-[#FF6B35]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Average days between consecutive orders</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Upcoming Celebrations</span>
              <div className="flex gap-4 mt-2">
                <div>
                  <span className="text-2xl font-black text-pink-500">{data.upcomingEvents.birthdays}</span>
                  <span className="text-[9px] text-slate-400 font-bold block">Birthdays</span>
                </div>
                <div className="border-l border-slate-100 dark:border-[#374151]/20 pl-4">
                  <span className="text-2xl font-black text-indigo-500">{data.upcomingEvents.anniversaries}</span>
                  <span className="text-[9px] text-slate-400 font-bold block">Anniversaries</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">Events occurring within the next 7 days</span>
        </div>
      </div>

      {/* 2. Customer Segmentation & Cohort Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segmentation Distribution */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              RFM Segments
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Database distribution based on recency and spending</span>
          </div>

          <div className="h-[180px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData} margin={{ left: -25, right: 10 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={30}>
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-[#374151]/20 pt-4">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active: {data.segmentation.active}</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> VIP: {data.segmentation.vip}</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Dormant: {data.segmentation.dormant}</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Churned: {data.segmentation.churned}</div>
          </div>
        </div>

        {/* Cohort Retention Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Customer Retention Cohorts
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Track month-over-month customer return rates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs">
              <thead className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-[#374151]/20">
                <tr>
                  <th className="py-2 text-left">Cohort Month</th>
                  <th className="py-2">Base Size</th>
                  <th className="py-2">Month 1</th>
                  <th className="py-2">Month 2</th>
                  <th className="py-2">Month 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/10 text-slate-700 dark:text-gray-300">
                {data.retentionMatrix.map((row, index) => (
                  <tr key={index}>
                    <td className="py-3 text-left font-bold">{row.cohort}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{row.size}</td>
                    <td className={`py-3 rounded-lg ${getCohortColor(row.m1, row.size)}`}>
                      {row.m1 > 0 ? `${((row.m1 / row.size) * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className={`py-3 rounded-lg ${getCohortColor(row.m2, row.size)}`}>
                      {row.m2 > 0 ? `${((row.m2 / row.size) * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className={`py-3 rounded-lg ${getCohortColor(row.m3, row.size)}`}>
                      {row.m3 > 0 ? `${((row.m3 / row.size) * 100).toFixed(0)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Award,
  Sparkles,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface MembersData {
  joined: number;
  active: number;
}

interface PointsData {
  issued: number;
  redeemed: number;
  redemptionRate: number;
}

interface CouponRoiRow {
  code: string;
  redemptions: number;
  revenueLift: number;
}

interface LoyaltyAnalyticsData {
  members: MembersData;
  points: PointsData;
  couponRoi: CouponRoiRow[];
}

interface LoyaltyTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<LoyaltyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/loyalty?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch loyalty analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching loyalty analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchLoyaltyAnalytics();
  }, [fetchLoyaltyAnalytics, refreshTrigger]);

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

  // Chart data comparing Points Issued vs Points Redeemed
  const pointsChartData = [
    {
      name: 'Loyalty Points',
      Issued: data.points.issued,
      Redeemed: data.points.redeemed,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Loyalty KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Loyalty Registrations</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">+{data.members.joined}</h3>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">New members joined during this period</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Active Members</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.members.active}</h3>
            </div>
            <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center text-[#FF6B35]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Members active in last 30 days</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Redemption Rate</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{data.points.redemptionRate}%</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Ratio of redeemed points to newly issued points</span>
        </div>
      </div>

      {/* 2. Points ledger comparing chart & Coupon ROI leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points comparisons */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Points Issued vs Redeemed
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Analyze newly generated liabilities vs customer engagement</span>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointsChartData} margin={{ left: 10, right: 10 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Issued" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={45} />
                <Bar dataKey="Redeemed" fill="#FF6B35" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-[#374151]/20 pt-4 text-xs font-semibold text-slate-500 dark:text-gray-400">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Issued</span>
              <span className="text-lg font-black text-blue-500 mt-1 block">{data.points.issued.toLocaleString()} pts</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Total Redeemed</span>
              <span className="text-lg font-black text-[#FF6B35] mt-1 block">{data.points.redeemed.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Coupon ROI Leaderboard */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Coupon Campaign Leaderboard
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Track coupon redemption volume and total revenue lift generated</span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {data.couponRoi.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-[#9ca3af] text-xs">No active coupon redemptions recorded.</div>
            ) : (
              data.couponRoi.map((item, index) => (
                <div key={item.code} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400 font-bold">Rank #{index + 1}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{item.code}</span>
                  </div>
                  <div className="flex gap-6 text-right font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Redeemed</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block">{item.redemptions} times</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Rev Lift</span>
                      <span className="text-xs font-black text-emerald-500 mt-0.5 block">{fmt(item.revenueLift)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

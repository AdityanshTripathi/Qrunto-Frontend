import React from 'react';
import { Users, AlertTriangle, Gift, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VipCustomer {
  name: string;
  email: string | null;
  phone: string;
  ltv: number;
  orders: number;
}

interface RfmSegments {
  Champions?: number;
  Loyal?: number;
  PotentialLoyalist?: number;
  New?: number;
  AtRisk?: number;
  Churned?: number;
}

interface CustomerData {
  totalCustomers?: number;
  rfmSegments?: RfmSegments;
  vipCount?: number;
  churnedCount?: number;
  dormantCount?: number;
  vipCustomers?: VipCustomer[];
  loyaltyPointsIssued?: number;
  loyaltyPointsRedeemed?: number;
  couponsRedeemed?: number;
  upcomingOccasions?: number;
}

interface CustomerTabProps {
  data: CustomerData;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const CustomerTab: React.FC<CustomerTabProps> = ({ data }) => {
  const totalCustomers = data?.totalCustomers || 0;
  const churnedCount = data?.churnedCount || 0;
  const dormantCount = data?.dormantCount || 0;
  const upcomingOccasions = data?.upcomingOccasions || 0;
  const vipCustomers = data?.vipCustomers || [];

  const rfmSegments = data?.rfmSegments || {
    Champions: 0,
    Loyal: 0,
    PotentialLoyalist: 0,
    New: 0,
    AtRisk: 0,
    Churned: 0,
  };

  const rfmChartData = [
    { name: 'Champions', count: rfmSegments.Champions || 0 },
    { name: 'Loyal', count: rfmSegments.Loyal || 0 },
    { name: 'Potential', count: rfmSegments.PotentialLoyalist || 0 },
    { name: 'New', count: rfmSegments.New || 0 },
    { name: 'At Risk', count: rfmSegments.AtRisk || 0 },
    { name: 'Churned', count: rfmSegments.Churned || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total CRM Base</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{totalCustomers}</h4>
          </div>
        </div>

        {/* Churned Customers */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lost (&gt;90 Days)</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{churnedCount}</h4>
          </div>
        </div>

        {/* Dormant Customers */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dormant (&gt;30 Days)</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{dormantCount}</h4>
          </div>
        </div>

        {/* Occasions */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Occasions (Next 30D)</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{upcomingOccasions}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFM Segmentation Graph */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            RFM Customer Segmentation Sizing
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rfmChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.15} className="dark:[stroke:#374151]" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VIP Patrons Leaderboard */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 flex flex-col">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Top 5 VIP Customer Leaderboard
          </h3>

          {vipCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs my-auto">No VIP customers tracked yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-auto">
              {vipCustomers.slice(0, 5).map((vip, idx) => (
                <div key={vip.phone} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{vip.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{vip.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-black text-[#FF6B35]">{fmt(vip.ltv)}</h4>
                    <p className="text-[9px] text-slate-400">{vip.orders} visits</p>
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

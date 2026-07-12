import React from 'react';
import { Award, Gift, RefreshCw, Star, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface LoyaltyData {
  membersCount?: number;
  activeMembersCount?: number;
  pointsIssued?: number;
  pointsRedeemed?: number;
  redemptionRate?: number;
  repeatPurchaseLift?: number;
  loyaltyRevenue?: number;
  couponRoi?: number;
}

interface LoyaltyTabProps {
  data: LoyaltyData;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#FF6B35', '#3b82f6'];

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({ data }) => {
  const pointsRedeemed = data?.pointsRedeemed || 0;
  const pointsIssued = data?.pointsIssued || 0;
  const redemptionRate = data?.redemptionRate || 0;
  const repeatPurchaseLift = data?.repeatPurchaseLift || 0;
  const loyaltyRevenue = data?.loyaltyRevenue || 0;
  const couponRoi = data?.couponRoi || 0;
  const membersCount = data?.membersCount || 0;
  const activeMembersCount = data?.activeMembersCount || 0;

  const pointSplitData = [
    { name: 'Redeemed Points', value: pointsRedeemed },
    { name: 'Unredeemed Balance', value: Math.max(0, pointsIssued - pointsRedeemed) },
  ].filter(v => v.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loyalty Members</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{membersCount}</h4>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Members</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{activeMembersCount}</h4>
          </div>
        </div>

        {/* Redemption Rate */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Redemption Rate</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{redemptionRate}%</h4>
          </div>
        </div>

        {/* Repeat Lift */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repeat Spend Lift</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">+{repeatPurchaseLift}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Point splits */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" />
            Loyalty Points Valuation
          </h3>

          <div className="flex flex-col items-center">
            {pointSplitData.length === 0 ? (
              <p className="text-slate-400 text-xs py-10">No points issued yet.</p>
            ) : (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pointSplitData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pointSplitData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">Points Redeemed: {pointsRedeemed} pts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">Active Balance: {Math.max(0, pointsIssued - pointsRedeemed)} pts</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Coupon ROI */}
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Coupon Marketing ROI
          </h3>

          <div className="my-auto space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/35 border p-5 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-500">Loyalty Member Share</h4>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{fmt(loyaltyRevenue)}</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">
                Revenue Generator
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/35 border p-5 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-500">Coupon Code Revenue ROI</h4>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{couponRoi}x</p>
              </div>
              <div className="text-[10px] text-slate-400 max-w-[120px] text-right">
                Returns ₹{couponRoi} for every ₹1 of discount issued.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

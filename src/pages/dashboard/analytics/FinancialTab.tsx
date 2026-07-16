import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  CreditCard,
  Layers,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface SummaryData {
  gross: number;
  net: number;
  expenses: number;
  profit: number;
  gst: number;
  grossMargin: number;
}

interface PaymentMethods {
  upi: number;
  cash: number;
  card: number;
}

interface ExpenseBreakdownRow {
  category: string;
  amount: number;
}

interface FinancialAnalyticsData {
  summary: SummaryData;
  paymentMethods: PaymentMethods;
  expenseBreakdown: ExpenseBreakdownRow[];
}

interface FinancialTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#FF6B35', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const FinancialTab: React.FC<FinancialTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<FinancialAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancialAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/financials?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch financial analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching financial analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchFinancialAnalytics();
  }, [fetchFinancialAnalytics, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200 dark:bg-slate-700/50 rounded-3xl" />
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

  // Payments split data for Pie Chart
  const paymentsData = [
    { name: 'UPI', value: data.paymentMethods.upi },
    { name: 'Cash', value: data.paymentMethods.cash },
    { name: 'Card', value: data.paymentMethods.card },
  ].filter(item => item.value > 0);

  // Expense split data for Pie Chart
  const expensesData = data.expenseBreakdown.map(item => ({
    name: item.category.toUpperCase(),
    value: item.amount,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards (4 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider block">Net Revenue</span>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{fmt(data.summary.net)}</h3>
          <span className="text-[9px] text-slate-400 mt-2 block">Gross sales minus discounts & refunds</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider block">Operating Expenses</span>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{fmt(data.summary.expenses)}</h3>
          <span className="text-[9px] text-slate-400 mt-2 block">Total costs (Salaries, rent, utilities, supplies)</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider block">Net Profit</span>
          <h3 className="text-2xl font-black text-emerald-500 mt-1">{fmt(data.summary.profit)}</h3>
          <span className="text-[9px] text-slate-400 mt-2 block">Net earnings after all expenses</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider block">Profit Margin</span>
          <h3 className="text-2xl font-black text-[#FF6B35] mt-1">{data.summary.grossMargin}%</h3>
          <span className="text-[9px] text-slate-400 mt-2 block">Net profit margin percentage</span>
        </div>
      </div>

      {/* 2. Payment Splits & Expense Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Split */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Channel Split
          </h3>

          <div className="h-[180px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentsData}
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
                  <Cell fill="#10b981" />
                  <Cell fill="#FF6B35" />
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-semibold pt-4 text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-[#374151]/20">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> UPI: {fmt(data.paymentMethods.upi)}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Cash: {fmt(data.paymentMethods.cash)}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full" /> Card: {fmt(data.paymentMethods.card)}</span>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Expense Breakdown
          </h3>

          <div className="h-[180px] relative flex items-center justify-center">
            {expensesData.length === 0 ? (
              <div className="text-center text-slate-500 text-xs">No expenses logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {expensesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="max-h-[80px] overflow-y-auto grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 dark:text-gray-400 border-t border-slate-100 dark:border-[#374151]/20 pt-4">
            {data.expenseBreakdown.map((item, idx) => (
              <div key={item.category} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{item.category.toUpperCase()}: {fmt(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Taxes & Adjustments Report */}
      <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
        <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Percent className="w-4 h-4" />
          Financial & GST Tax Statement
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
            <span className="text-[10px] text-slate-400 font-bold block">Gross Revenue Sales (Base + GST)</span>
            <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">{fmt(data.summary.gross)}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
            <span className="text-[10px] text-slate-400 font-bold block">GST Collected</span>
            <span className="text-base font-black text-[#FF6B35] mt-1 block">{fmt(data.summary.gst)}</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
            <span className="text-[10px] text-slate-400 font-bold block">Net Operating Income (Post Tax & Profit)</span>
            <span className="text-base font-black text-emerald-500 mt-1 block">{fmt(data.summary.net - data.summary.gst)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Percent, Ban, Award } from 'lucide-react';

interface KpiData {
  netSales: number;
  grossSales: number;
  gstCollected: number;
  discountsGiven: number;
  refundAmount: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  aov: number;
  avgItemsPerOrder: number;
  revenuePerTable: number;
  revenuePerCustomer: number;
  uniqueCustomersCount: number;
  totalTablesCount: number;
  occupiedTablesCount: number;
  currentOccupancy: number;
}

interface KpiGridProps {
  current: KpiData;
  comparison: KpiData | null;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ current, comparison }) => {
  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const calculateTrend = (curr: number, comp: number | undefined) => {
    if (!comp || comp === 0) return null;
    const val = ((curr - comp) / comp) * 100;
    return {
      value: Math.abs(val).toFixed(1) + '%',
      isPositive: val >= 0,
    };
  };

  const kpis = [
    {
      title: 'Net Sales',
      value: fmt(current.netSales),
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/25',
      trend: calculateTrend(current.netSales, comparison?.netSales),
      subtitle: `Gross: ${fmt(current.grossSales)}`,
    },
    {
      title: 'Total Orders',
      value: current.totalOrders,
      icon: <ShoppingBag className="w-5 h-5 text-[#FF6B35]" />,
      bg: 'bg-[#FF6B35]/10 border-[#FF6B35]/25',
      trend: calculateTrend(current.totalOrders, comparison?.totalOrders),
      subtitle: `Completed: ${current.completedOrders}`,
    },
    {
      title: 'Avg Order Value (AOV)',
      value: fmt(current.aov),
      icon: <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/25',
      trend: calculateTrend(current.aov, comparison?.aov),
      subtitle: `Avg Items: ${current.avgItemsPerOrder} / order`,
    },
    {
      title: 'Current Occupancy',
      value: `${current.currentOccupancy}%`,
      icon: <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bg: 'bg-purple-500/10 border-purple-500/25',
      trend: null,
      subtitle: `${current.occupiedTablesCount} / ${current.totalTablesCount} tables occupied`,
    },
    {
      title: 'Cancelled Orders',
      value: current.cancelledOrders,
      icon: <Ban className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-500/10 border-rose-500/25',
      trend: calculateTrend(current.cancelledOrders, comparison?.cancelledOrders),
      subtitle: `Refunds: ${fmt(current.refundAmount)}`,
    },
    {
      title: 'Customer LTV / Avg Spend',
      value: fmt(current.revenuePerCustomer),
      icon: <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/25',
      trend: calculateTrend(current.revenuePerCustomer, comparison?.revenuePerCustomer),
      subtitle: `Customers: ${current.uniqueCustomersCount}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="bg-white/40 dark:bg-[#1f2937]/35 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[22px] p-5 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] text-slate-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">
                {kpi.title}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {kpi.value}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${kpi.bg}`}>
              {kpi.icon}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-3 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">
              {kpi.subtitle}
            </span>
            {kpi.trend && (
              <span
                className={`font-extrabold px-1.5 py-0.5 rounded-md ${
                  kpi.trend.isPositive
                    ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
                }`}
              >
                {kpi.trend.isPositive ? '↑' : '↓'} {kpi.trend.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

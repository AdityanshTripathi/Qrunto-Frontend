import React from 'react';
import { Clock, ShoppingBag, Eye, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface OrderSourceCount {
  name: string;
  count: number;
}

interface OrderData {
  totalOrders: number;
  avgPrepTimeMin: number;
  avgDeliveryTimeMin: number;
  avgTableTimeMin: number;
  kitchenDelayPercent: number;
  waiterDelayPercent: number;
  sources: OrderSourceCount[];
  qrScanToOrderConversion: number;
  cartAbandonmentRate: number;
  avgBasketSize: number;
}

interface OrderTabProps {
  data: OrderData;
}

const COLORS = ['#FF6B35', '#3b82f6', '#10b981'];

export const OrderTab: React.FC<OrderTabProps> = ({ data }) => {
  const funnelSteps = [
    { label: 'QR Scans', value: '100%', subtitle: 'Menu Visitor views' },
    { label: 'Cart Views', value: `${(100 - data.cartAbandonmentRate).toFixed(0)}%`, subtitle: 'Added items to cart' },
    { label: 'Orders Placed', value: `${data.qrScanToOrderConversion}%`, subtitle: 'Successful checkouts' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[22px] p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Avg Prep Time</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.avgPrepTimeMin} min</h3>
            <p className="text-[10px] text-slate-400">Target order prep: 15 mins</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#FF6B35]/25 border-t-[#FF6B35] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 animate-pulse">
            <Clock className="w-5 h-5 text-[#FF6B35]" />
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[22px] p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Avg Table Time</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.avgTableTimeMin} min</h3>
            <p className="text-[10px] text-slate-400">Total table turnaround</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/25 border-t-blue-500 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[22px] p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Basket Size</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.avgBasketSize} items</h3>
            <p className="text-[10px] text-slate-400">Average items per ticket</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/25 border-t-emerald-500 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Kitchen & Waiter Efficiency
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Kitchen Delays (&gt; target mins)</span>
                <span className="text-rose-600 dark:text-rose-400">{data.kitchenDelayPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${data.kitchenDelayPercent}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Waiter Delays (Service &gt; 5 mins)</span>
                <span className="text-amber-600 dark:text-amber-400">{data.waiterDelayPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${data.waiterDelayPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-5 flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] text-slate-500 dark:text-[#9ca3af] font-bold uppercase tracking-wider">Order Sources</span>
              <div className="flex gap-4 mt-2">
                {data.sources.map((s, idx) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">{s.count} {s.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {data.sources.length > 0 && (
              <PieChart width={80} height={80}>
                <Pie
                  data={data.sources}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={30}
                  dataKey="count"
                >
                  {data.sources.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-5 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Conversion Funnel Analysis
          </h3>

          <div className="space-y-4">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="relative flex items-center">
                <div
                  className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF6B35]/80 dark:from-[#FF6B35]/10 dark:to-[#FF6B35]/60 h-14 rounded-2xl flex items-center justify-between px-4 transition-all"
                  style={{
                    width: idx === 0 ? '100%' : idx === 1 ? `${100 - data.cartAbandonmentRate}%` : `${data.qrScanToOrderConversion}%`,
                    minWidth: '150px',
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 dark:text-white truncate">{step.label}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-300 truncate">{step.subtitle}</p>
                  </div>
                  <span className="text-sm font-black text-[#FF6B35]">{step.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

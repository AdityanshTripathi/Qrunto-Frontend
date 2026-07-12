import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Calendar, Layers, Clock, ShoppingBag } from 'lucide-react';

interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface HeatmapCell {
  dow: number;
  hour: number;
  revenue: number;
  orders: number;
}

interface CategorySale {
  name: string;
  revenue: number;
}

interface SalesData {
  trends: SalesTrend[];
  heatmap: HeatmapCell[];
  bestDay: string;
  worstDay: string;
  weekdayRevenue: number;
  weekendRevenue: number;
  lunchRevenue: number;
  dinnerRevenue: number;
  otherTimeRevenue: number;
  dineInRevenue: number;
  takeawayRevenue: number;
  modifierRevenue: number;
  categories: CategorySale[];
}

interface SalesTabProps {
  data: SalesData;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#FF6B35', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const SalesTab: React.FC<SalesTabProps> = ({ data }) => {
  const mealTypeData = [
    { name: 'Lunch', value: data.lunchRevenue },
    { name: 'Dinner', value: data.dinnerRevenue },
    { name: 'Other Time', value: data.otherTimeRevenue },
  ].filter(v => v.value > 0);

  const orderTypeData = [
    { name: 'Dine-In', value: data.dineInRevenue },
    { name: 'Takeaway/Deliv', value: data.takeawayRevenue },
  ].filter(v => v.value > 0);

  const getHeatmapColor = (orders: number) => {
    if (orders === 0) return 'bg-slate-50 dark:bg-slate-900/30';
    if (orders <= 2) return 'bg-[#FF6B35]/15 text-[#FF6B35]';
    if (orders <= 5) return 'bg-[#FF6B35]/40 text-white';
    if (orders <= 10) return 'bg-[#FF6B35]/70 text-white';
    return 'bg-[#FF6B35] text-white font-bold';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Revenue & Order Trends
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenueSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.2} className="dark:[stroke:#374151]" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? fmt(Number(value)) : value, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#FF6B35" strokeWidth={2.5} fill="url(#gradRevenueSales)" dot={{ fill: '#FF6B35', r: 4 }} />
              <Area yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#3b82f6" strokeWidth={2} fill="none" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Revenue Allocation Splits
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2">LUNCH vs DINNER</span>
              {mealTypeData.length === 0 ? (
                <div className="text-[10px] text-slate-400 py-10">No data</div>
              ) : (
                <PieChart width={120} height={120}>
                  <Pie
                    data={mealTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mealTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              )}
              <div className="text-[9px] text-slate-500 flex flex-wrap justify-center gap-1.5 mt-2">
                {mealTypeData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2">DINE-IN vs TAKEAWAY</span>
              {orderTypeData.length === 0 ? (
                <div className="text-[10px] text-slate-400 py-10">No data</div>
              ) : (
                <PieChart width={120} height={120}>
                  <Pie
                    data={orderTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              )}
              <div className="text-[9px] text-slate-500 flex flex-wrap justify-center gap-1.5 mt-2">
                {orderTypeData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Category Revenue Share
          </h3>
          {data.categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No category data.</div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categories} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill="#FF6B35">
                    {data.categories.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best Day</p>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
            {data.bestDay !== 'None' ? new Date(data.bestDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'N/A'}
          </h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Worst Day</p>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
            {data.worstDay !== 'None' ? new Date(data.worstDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'N/A'}
          </h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekday Revenue</p>
          <h4 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(data.weekdayRevenue)}</h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modifier Add-ons</p>
          <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1">{fmt(data.modifierRevenue)}</h4>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
        <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Day-Hour Sales Heatmap (Orders Volume)
        </h3>

        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px] space-y-1 pt-2">
            <div className="flex items-center text-[9px] font-bold text-slate-400 mb-1 pl-10">
              {Array.from({ length: 24 }).map((_, h) => (
                <span key={h} className="w-7 text-center">{h}h</span>
              ))}
            </div>

            {DAYS.map((day, dIdx) => (
              <div key={day} className="flex items-center gap-1">
                <span className="w-8 text-[10px] font-bold text-slate-500 dark:text-slate-400">{day}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 24 }).map((_, h) => {
                    const cell = data.heatmap.find((c) => c.dow === dIdx && c.hour === h) || { orders: 0, revenue: 0 };
                    return (
                      <div
                        key={h}
                        title={`${day} at ${h}:00 - ${cell.orders} orders, ${fmt(cell.revenue)}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] cursor-pointer transition-all hover:scale-105 ${getHeatmapColor(cell.orders)}`}
                      >
                        {cell.orders > 0 ? cell.orders : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border" />
            <span>No sales</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-[#FF6B35]/15 border" />
            <span>Low (1-2)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-[#FF6B35]/40" />
            <span>Mid (3-5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-[#FF6B35]/70" />
            <span>High (6-10)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-[#FF6B35]" />
            <span>Peak (&gt;10)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

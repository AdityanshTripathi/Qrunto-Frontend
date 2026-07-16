import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Award,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface MenuItemPerformance {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  cost: number;
  profit: number;
  views: number;
  conversion: number;
}

interface MenuBundle {
  items: string[];
  frequency: number;
}

interface MenuAnalyticsData {
  menuPerformance: MenuItemPerformance[];
  bundles: MenuBundle[];
}

interface MenuTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const MenuTab: React.FC<MenuTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<MenuAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMenuAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/menu?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch menu analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching menu analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchMenuAnalytics();
  }, [fetchMenuAnalytics, refreshTrigger]);

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

  // Calculate averages for the menu engineering matrix
  const performance = data.menuPerformance || [];
  const totalSold = performance.reduce((sum, item) => sum + item.sold, 0);
  const avgSold = performance.length > 0 ? totalSold / performance.length : 0;
  const totalProfit = performance.reduce((sum, item) => sum + (item.profit / (item.sold || 1)), 0);
  const avgProfit = performance.length > 0 ? totalProfit / performance.length : 0;

  // Filter items based on search query
  const filteredPerformance = performance.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scatter chart data
  const scatterData = performance.map((item) => ({
    x: parseFloat((item.profit / (item.sold || 1)).toFixed(2)), // Profit margin per unit
    y: item.sold, // Quantity sold
    name: item.name,
    z: item.revenue,
  }));

  // Custom tool-tip for scatter chart
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const info = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-xl text-xs">
          <p className="font-bold text-slate-800 dark:text-white mb-1.5">{info.name}</p>
          <p className="text-slate-500 dark:text-gray-400">Unit Profit: <span className="font-bold text-emerald-500">{fmt(info.x)}</span></p>
          <p className="text-slate-500 dark:text-gray-400">Qty Sold: <span className="font-bold text-[#FF6B35]">{info.y}</span></p>
          <p className="text-slate-500 dark:text-gray-400">Total Rev: <span className="font-bold text-blue-500">{fmt(info.z)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Menu Engineering Scatter Chart */}
      <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Menu Engineering Matrix
            </h3>
            <span className="text-xs text-slate-400 block mt-1">Classifies items by Popularity (Sales Vol) vs Profitability (Unit Margin)</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Stars (High Pop, High Profit)</span>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">Plowhorses (High Pop, Low Profit)</span>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-full border border-indigo-500/20">Puzzles (Low Pop, High Profit)</span>
            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">Dogs (Low Pop, Low Profit)</span>
          </div>
        </div>

        {scatterData.length === 0 ? (
          <div className="text-center py-20 text-slate-500 dark:text-[#9ca3af] text-sm">No menu performance data available.</div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Unit Profit"
                  unit="₹"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  label={{ value: 'Unit Profit (₹)', position: 'bottom', fill: '#64748b', fontSize: 11, offset: 0 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Qty Sold"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, offset: 0 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip content={<CustomScatterTooltip />} />
                <ReferenceLine x={avgProfit} stroke="#64748b" strokeOpacity={0.4} strokeDasharray="4 4" />
                <ReferenceLine y={avgSold} stroke="#64748b" strokeOpacity={0.4} strokeDasharray="4 4" />
                <Scatter name="Menu Items" data={scatterData} fill="#FF6B35" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Top Bundles & Performance Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Bundles */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Frequently Bought Together
            </h3>
            <span className="text-xs text-slate-400 block mb-4">Leverage item combinations for promotional menu bundling</span>
          </div>

          <div className="space-y-3">
            {data.bundles.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-[#9ca3af] text-xs">Not enough order pairs to determine bundles.</div>
            ) : (
              data.bundles.map((bundle, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
                  <div className="flex flex-col gap-1 pr-2">
                    <span className="text-[10px] text-slate-400 font-bold">Bundle #{index + 1}</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white truncate">
                      {bundle.items.join(' + ')}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Orders</span>
                    <span className="text-xs font-black text-emerald-500 mt-0.5 block">{bundle.frequency} times</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Item performance details table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4" />
              Item Performance Breakdown
            </h3>
            <div className="relative w-full sm:w-48">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-[220px]">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-[#374151]/20">
                <tr>
                  <th className="py-2">Item Name</th>
                  <th className="py-2 text-right">Sold</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">Profit</th>
                  <th className="py-2 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#374151]/10 text-slate-700 dark:text-gray-300">
                {filteredPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No items match the search.</td>
                  </tr>
                ) : (
                  filteredPerformance.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-2.5 font-bold truncate max-w-[120px]">{item.name}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white">{item.sold}</td>
                      <td className="py-2.5 text-right">{fmt(item.revenue)}</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-500">{fmt(item.profit)}</td>
                      <td className="py-2.5 text-right text-[#FF6B35] font-semibold">{item.conversion}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClipboardList,
  AlertTriangle,
  TrendingDown,
  Activity,
  Layers,
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

interface ValueData {
  totalStockValue: number;
  wastageCost: number;
}

interface ConsumptionRow {
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface TurnoverRow {
  materialName: string;
  turnoverRatio: number;
}

interface InventoryAnalyticsData {
  value: ValueData;
  consumption: ConsumptionRow[];
  turnover: TurnoverRow[];
  lowStockCount: number;
  deadStockCount: number;
}

interface InventoryTabProps {
  startDate: string;
  endDate: string;
  token: string | null;
  baseUrl: string;
  refreshTrigger: number;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const COLORS = ['#FF6B35', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const InventoryTab: React.FC<InventoryTabProps> = ({
  startDate,
  endDate,
  token,
  baseUrl,
  refreshTrigger,
}) => {
  const [data, setData] = useState<InventoryAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInventoryAnalytics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/analytics/inventory?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to fetch inventory analytics');
      setData(resData);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching inventory analytics');
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, baseUrl]);

  useEffect(() => {
    fetchInventoryAnalytics();
  }, [fetchInventoryAnalytics, refreshTrigger]);

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

  return (
    <div className="space-y-6">
      {/* 1. Value & Stock Health KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Stock Valuation</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{fmt(data.value.totalStockValue)}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Total value of current active raw material stock</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Stock Wastage Cost</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1.5">{fmt(data.value.wastageCost)}</h3>
            </div>
            <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-4 block">Cumulative cost of spoilage & wastage records</span>
        </div>

        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-[#9ca3af] uppercase tracking-wider">Alerts & Dead Stock</span>
              <div className="flex gap-4 mt-2">
                <div>
                  <span className="text-2xl font-black text-rose-500">{data.lowStockCount}</span>
                  <span className="text-[9px] text-slate-400 font-bold block">Low Stock</span>
                </div>
                <div className="border-l border-slate-100 dark:border-[#374151]/20 pl-4">
                  <span className="text-2xl font-black text-amber-500">{data.deadStockCount}</span>
                  <span className="text-[9px] text-slate-400 font-bold block">Dead Stock</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block">Critical stock status alerts</span>
        </div>
      </div>

      {/* 2. Consumption Bar Chart & Details List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Consumption Chart */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Ingredient Consumption Costs
            </h3>
            <span className="text-xs text-slate-400 block mb-6">Total raw material cost deducted via sales & checkouts</span>
          </div>

          <div className="h-[200px] mb-4">
            {data.consumption.length === 0 ? (
              <div className="text-center py-16 text-slate-500">No consumption logs.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.consumption} margin={{ left: -15, right: 10 }}>
                  <XAxis dataKey="materialName" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => fmt(Number(value))} />
                  <Bar dataKey="cost" fill="#FF6B35" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {data.consumption.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <span className="text-[10px] text-slate-400 block text-center">Top moving items by consumption costs</span>
        </div>

        {/* Detailed consumption ledger list */}
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Stock Turnover Ledger
            </h3>
            <span className="text-xs text-slate-400 block mb-4">Compare quantities moving against current inventory levels</span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {data.consumption.map((c) => {
              const turnInfo = data.turnover.find(t => t.materialName === c.materialName);
              return (
                <div key={c.materialName} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#111827]/40 rounded-2xl border border-slate-100 dark:border-[#374151]/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black text-slate-800 dark:text-white truncate">
                      {c.materialName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Qty: {c.quantity} {c.unit}
                    </span>
                  </div>
                  <div className="flex gap-6 text-right font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Cost Value</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">{fmt(c.cost)}</span>
                    </div>
                    <div className="border-l border-slate-100 dark:border-[#374151]/20 pl-4">
                      <span className="text-[9px] text-slate-400 block">Turnover</span>
                      <span className="text-xs font-black text-emerald-500 mt-0.5 block">{turnInfo?.turnoverRatio || 1.5}x</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

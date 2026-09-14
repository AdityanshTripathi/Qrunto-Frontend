import { useCallback, useEffect, useRef, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { api } from '../../../lib/api';
import type { ConsumptionAnalytics, InventoryData } from './inventory-types';
import { formatCurrency, isoDate } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader } from './InventoryPrimitives';

type Range = 'today' | '7' | '30' | 'month' | 'custom';

function rangeDates(range: Range, customStart: string, customEnd: string) {
  const end = new Date();
  const start = new Date(end);
  if (range === 'today') start.setHours(0, 0, 0, 0);
  if (range === '7') start.setDate(start.getDate() - 6);
  if (range === '30') start.setDate(start.getDate() - 29);
  if (range === 'month') start.setDate(1);
  return { startDate: range === 'custom' ? customStart : isoDate(start), endDate: range === 'custom' ? customEnd : isoDate(end) };
}

export function InventoryReports({ data }: { data: InventoryData }) {
  const [range, setRange] = useState<Range>('7');
  const [customStart, setCustomStart] = useState(isoDate(new Date()));
  const [customEnd, setCustomEnd] = useState(isoDate(new Date()));
  const [analytics, setAnalytics] = useState<ConsumptionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const dates = rangeDates(range, customStart, customEnd);
    if (!dates.startDate || !dates.endDate || dates.startDate > dates.endDate) { setError('Choose a valid report date range.'); return; }
    const request = ++sequence.current; setLoading(true); setError(null);
    try {
      const response = await api.get(`/inventory/reports/analytics/consumption?startDate=${encodeURIComponent(dates.startDate)}&endDate=${encodeURIComponent(dates.endDate)}`);
      if (request === sequence.current) setAnalytics(response.analytics);
    } catch (requestError: unknown) {
      if (request === sequence.current) setError(requestError instanceof Error ? requestError.message : 'Report could not be loaded.');
    } finally { if (request === sequence.current) setLoading(false); }
  }, [range, customStart, customEnd]);
  useEffect(() => { let cancelled = false; void Promise.resolve().then(() => { if (!cancelled) return load(); }); return () => { cancelled = true; sequence.current += 1; }; }, [load]);

  return <div className="space-y-6"><SectionHeader title="Reports" description="Operational reporting backed by current inventory APIs." />
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"><label className="text-xs font-bold text-slate-500">Period<select value={range} onChange={event => setRange(event.target.value as Range)} className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="today">Today</option><option value="7">7 days</option><option value="30">30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select></label>{range === 'custom' && <><label className="text-xs font-bold text-slate-500">From<input type="date" value={customStart} onChange={event => setCustomStart(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label><label className="text-xs font-bold text-slate-500">To<input type="date" value={customEnd} onChange={event => setCustomEnd(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950" /></label></>}<ActionButton tone="secondary" disabled={loading} onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</ActionButton></div>
    <div className="grid gap-3 sm:grid-cols-3"><article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Current stock value</p><p className="mt-2 text-2xl font-black">{formatCurrency(data.metrics.totalValue)}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Consumption today</p><p className="mt-2 text-2xl font-black">{formatCurrency(data.metrics.todayConsumption)}</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Food-costed dishes</p><p className="mt-2 text-2xl font-black">{data.recipes.length}</p></article></div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : loading ? <div role="status" className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">Loading consumption report…</div> : !analytics?.dailyConsumption.length ? <EmptyState title="No consumption in this period" description="Only paid order deductions with configured recipes appear in this report." /> : <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><h3 className="flex items-center gap-2 font-black"><BarChart3 className="h-5 w-5 text-[#FF6B35]" /> Daily consumption</h3><div className="mt-4 space-y-3">{analytics.dailyConsumption.map(day => <div key={day.date} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 dark:border-slate-800"><span className="text-slate-500">{day.date}</span><strong>{formatCurrency(day.cost)}</strong></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><h3 className="font-black">Top consumed inventory</h3><div className="mt-4 space-y-3">{analytics.topConsumedItems.map((item, index) => <div key={item.name} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black dark:bg-slate-800">{index + 1}</span><span className="flex-1 text-sm">{item.name}</span><strong className="text-sm">{formatCurrency(item.cost)}</strong></div>)}</div></section></div>}
    <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700"><strong className="text-slate-700 dark:text-slate-200">Backend gaps:</strong> purchase trends, stock-variance value, fast/slow-moving quantities, ledger history and batch expiry reports need additional read endpoints. They are intentionally not estimated here.</div>
  </div>;
}

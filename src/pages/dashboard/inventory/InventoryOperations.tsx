import { useState } from 'react';
import { CalendarClock, ClipboardCheck, Plus, Scale, Trash2 } from 'lucide-react';
import type { AuditRecord, InventoryDialog, OperationView, RawMaterial, WastageRecord } from './inventory-types';
import { formatCurrency, formatInventoryDate, getStockStatus, isInCurrentMonth, WASTAGE_REASON_LABELS } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader, StatusBadge } from './InventoryPrimitives';

interface Props {
  rawMaterials: RawMaterial[];
  wastageRecords: WastageRecord[];
  auditRecords: AuditRecord[];
  timeZone: string;
  openDialog: (dialog: InventoryDialog) => void;
}

export function InventoryOperations({ rawMaterials, wastageRecords, auditRecords, timeZone, openDialog }: Props) {
  const [view, setView] = useState<OperationView>('wastage');
  const tabs: Array<{ id: OperationView; label: string; icon: typeof Trash2 }> = [
    { id: 'wastage', label: 'Wastage', icon: Trash2 },
    { id: 'adjustments', label: 'Adjustments', icon: Scale },
    { id: 'count', label: 'Stock count', icon: ClipboardCheck },
    { id: 'expiry', label: 'Expiry', icon: CalendarClock },
  ];
  return (
    <div className="space-y-5">
      <SectionHeader title="Operations" description="Day-to-day stock controls and reconciliation." />
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-900" aria-label="Inventory operations">
        {tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setView(tab.id)} aria-current={view === tab.id ? 'page' : undefined} className={`inline-flex min-w-max items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold ${view === tab.id ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}
      </div>

      {view === 'wastage' && <WastagePanel records={wastageRecords} timeZone={timeZone} onAdd={() => openDialog({ type: 'wastage' })} disabled={!rawMaterials.length} />}
      {view === 'adjustments' && <AdjustmentsPanel items={rawMaterials} onAdjust={item => openDialog({ type: 'adjust', item })} />}
      {view === 'count' && <CountPanel audits={auditRecords} timeZone={timeZone} onStart={() => openDialog({ type: 'count' })} disabled={!rawMaterials.length} />}
      {view === 'expiry' && <ExpiryPanel />}
    </div>
  );
}

function WastagePanel({ records, timeZone, onAdd, disabled }: { records: WastageRecord[]; timeZone: string; onAdd: () => void; disabled: boolean }) {
  const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const now = new Date();
  const today = dayFormatter.format(now);
  const recentDays = new Set(Array.from({ length: 7 }, (_, index) => { const date = new Date(now); date.setDate(date.getDate() - index); return dayFormatter.format(date); }));
  const total = (predicate: (record: WastageRecord) => boolean) => records.filter(predicate).reduce((sum, record) => sum + Number(record.cost), 0);
  const todayTotal = total(record => dayFormatter.format(new Date(record.wasteDate)) === today);
  const weekTotal = total(record => recentDays.has(dayFormatter.format(new Date(record.wasteDate))));
  const monthTotal = total(record => isInCurrentMonth(record.wasteDate, timeZone));
  return <section className="space-y-4"><SectionHeader title="Wastage log" description="Recorded losses reduce live stock and retain the responsible user." action={<ActionButton tone="danger" disabled={disabled} onClick={onAdd}><Plus className="h-4 w-4" /> Record wastage</ActionButton>} /><div className="grid grid-cols-3 gap-3">{[['Today', todayTotal], ['Last 7 days', weekTotal], ['This month', monthTotal]].map(([label, value]) => <article key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-[10px] font-extrabold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-black text-red-600">{formatCurrency(Number(value))}</p></article>)}</div>{!records.length ? <EmptyState title="No wastage recorded" description="Wastage incidents will appear here after they are submitted." /> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-slate-950/70"><tr>{['Date / time', 'Item', 'Quantity', 'Reason', 'Estimated value', 'Recorded by', 'Notes'].map(value => <th key={value} className="px-4 py-3 font-extrabold">{value}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{records.map(record => <tr key={record.id}><td className="px-4 py-4 text-xs text-slate-500">{formatInventoryDate(record.wasteDate, timeZone, true)}</td><td className="px-4 py-4 font-bold">{record.rawMaterial?.name}</td><td className="px-4 py-4">{record.quantity} {record.rawMaterial?.unit}</td><td className="px-4 py-4">{WASTAGE_REASON_LABELS[record.reason]}</td><td className="px-4 py-4 font-black text-red-600">{formatCurrency(Number(record.cost))}</td><td className="px-4 py-4">{record.user?.name ?? '—'}</td><td className="max-w-xs truncate px-4 py-4 text-slate-500">{record.notes || '—'}</td></tr>)}</tbody></table></div></div>}</section>;
}

function AdjustmentsPanel({ items, onAdjust }: { items: RawMaterial[]; onAdjust: (item: RawMaterial) => void }) {
  return <section className="space-y-4"><SectionHeader title="Manual adjustments" description="Correct known stock differences with a required reason and an auditable ledger entry." />{!items.length ? <EmptyState title="No items to adjust" description="Add inventory items before making an adjustment." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map(item => <article key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"><div><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-slate-500">{item.currentStock} {item.unit} · minimum {item.minimumStockLevel}</span><span className="mt-2 inline-block"><StatusBadge status={getStockStatus(item)} /></span></div><ActionButton tone="secondary" onClick={() => onAdjust(item)}>Adjust</ActionButton></article>)}</div>}</section>;
}

function CountPanel({ audits, timeZone, onStart, disabled }: { audits: AuditRecord[]; timeZone: string; onStart: () => void; disabled: boolean }) {
  return <section className="space-y-4"><SectionHeader title="Physical stock count" description="Complete counts reconcile system quantities immediately. Save-progress is not supported by the current API." action={<ActionButton disabled={disabled} onClick={onStart}><ClipboardCheck className="h-4 w-4" /> Start stock count</ActionButton>} />{!audits.length ? <EmptyState title="No completed stock counts" description="Start a stock count to compare physical and system quantities." /> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase text-slate-500 dark:bg-slate-950/70"><tr>{['Completed', 'Counted by', 'Items', 'Matched', 'With variance', 'Notes'].map(value => <th key={value} className="px-4 py-3 font-extrabold">{value}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{audits.map(audit => { const items = audit.items ?? []; const matched = items.filter(item => item.variance === 0).length; return <tr key={audit.id}><td className="px-4 py-4 text-slate-500">{formatInventoryDate(audit.auditDate, timeZone, true)}</td><td className="px-4 py-4 font-bold">{audit.user?.name ?? '—'}</td><td className="px-4 py-4">{items.length}</td><td className="px-4 py-4 text-emerald-600">{matched}</td><td className="px-4 py-4 text-red-600">{items.length - matched}</td><td className="max-w-xs truncate px-4 py-4 text-slate-500">{audit.notes || '—'}</td></tr>; })}</tbody></table></div></div>}</section>;
}

function ExpiryPanel() {
  return <section className="space-y-4"><SectionHeader title="Expiry and batches" description="Batch-level stock exists in the data model but is not exposed through the current inventory API." /><div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 dark:border-slate-700 dark:bg-slate-900/60"><CalendarClock className="h-7 w-7 text-slate-400" /><h3 className="mt-4 font-black">Backend endpoint required</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Expiry dates are saved when purchase-order items are received, but there is no endpoint to list batches or their remaining quantities. Expired stock will not be hidden or removed automatically. Until that endpoint exists, use Record Wastage or Adjust Stock for an explicit, auditable correction.</p></div></section>;
}

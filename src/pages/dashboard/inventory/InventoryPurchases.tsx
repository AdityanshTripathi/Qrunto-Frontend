import { Building2, Plus, ReceiptText } from 'lucide-react';
import type { InventoryDialog, InventorySupplier, PurchaseOrder, RawMaterial } from './inventory-types';
import { formatCurrency, formatInventoryDate } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader, StatusBadge } from './InventoryPrimitives';

interface Props {
  purchaseOrders: PurchaseOrder[];
  suppliers: InventorySupplier[];
  rawMaterials: RawMaterial[];
  timeZone: string;
  openDialog: (dialog: InventoryDialog) => void;
}

export function InventoryPurchases({ purchaseOrders, suppliers, rawMaterials, timeZone, openDialog }: Props) {
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const dayKey = (value: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  const receivedToday = purchaseOrders.filter(order => order.status === 'RECEIVED' && dayKey(order.receivedDate ?? order.orderDate) === todayKey).reduce((sum, order) => sum + Number(order.grandTotal), 0);
  const pending = purchaseOrders.filter(order => order.status !== 'RECEIVED' && order.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      <SectionHeader title="Purchases" description="Create purchase orders and receive stock against supplier invoices." action={<div className="flex gap-2"><ActionButton tone="secondary" onClick={() => openDialog({ type: 'supplier' })}><Building2 className="h-4 w-4" /> Suppliers</ActionButton><ActionButton disabled={!suppliers.length || !rawMaterials.length} onClick={() => openDialog({ type: 'purchase' })}><Plus className="h-4 w-4" /> New purchase order</ActionButton></div>} />
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Purchases today</p><p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(receivedToday)}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Awaiting receipt</p><p className="mt-2 text-2xl font-black">{pending.length}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"><p className="text-xs font-bold text-slate-500">Active suppliers</p><p className="mt-2 text-2xl font-black">{suppliers.length}</p></article>
      </div>
      {!purchaseOrders.length ? <EmptyState title="No purchases yet" description="Create a purchase order when you are ready to bring stock in." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/70"><tr>{['Date', 'Reference', 'Supplier', 'Invoice', 'Amount', 'Status', 'Action'].map(value => <th key={value} className="px-4 py-3 font-extrabold">{value}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{purchaseOrders.map(order => <tr key={order.id}><td className="px-4 py-4 text-slate-500">{formatInventoryDate(order.receivedDate ?? order.orderDate, timeZone)}</td><td className="px-4 py-4 font-bold">{order.poNumber}</td><td className="px-4 py-4">{order.supplier?.name ?? '—'}</td><td className="px-4 py-4 text-slate-500">{order.invoiceNumber || '—'}</td><td className="px-4 py-4 font-black">{formatCurrency(Number(order.grandTotal))}</td><td className="px-4 py-4"><StatusBadge status={order.status} /></td><td className="px-4 py-4">{order.status !== 'RECEIVED' && order.status !== 'CANCELLED' ? <ActionButton onClick={() => openDialog({ type: 'receive', purchaseOrder: order })}><ReceiptText className="h-4 w-4" /> Receive</ActionButton> : <span className="text-xs text-slate-400">Completed</span>}</td></tr>)}</tbody></table></div></div>
      )}
      <section className="space-y-3"><SectionHeader title="Suppliers" description="Contact details, credit terms and backend-calculated outstanding balances." />{!suppliers.length ? <EmptyState title="No suppliers" description="Add a supplier before creating a purchase order." action={<ActionButton onClick={() => openDialog({ type: 'supplier' })}>Add supplier</ActionButton>} /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{suppliers.map(supplier => <button key={supplier.id} onClick={() => openDialog({ type: 'supplier', supplier })} className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-orange-300 dark:border-slate-800 dark:bg-slate-900/60"><div className="flex justify-between gap-3"><strong>{supplier.name}</strong><span className="text-sm font-black text-red-600">{formatCurrency(Number(supplier.outstandingBalance))}</span></div><p className="mt-2 text-xs text-slate-500">{supplier.contactName || 'No contact name'} · {supplier.phone}</p><p className="mt-1 text-xs text-slate-400">{supplier.creditDays} day credit terms</p></button>)}</div>}</section>
    </div>
  );
}

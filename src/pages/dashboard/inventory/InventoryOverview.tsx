import { AlertTriangle, ClipboardCheck, PackagePlus, Scale, ShoppingCart, Trash2 } from 'lucide-react';
import type { InventoryData, InventoryDialog, InventoryTab } from './inventory-types';
import { formatCurrency, isInCurrentMonth } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader } from './InventoryPrimitives';

interface Props {
  data: InventoryData;
  timeZone: string;
  openDialog: (dialog: InventoryDialog) => void;
  navigate: (tab: InventoryTab) => void;
}

export function InventoryOverview({ data, timeZone, openDialog, navigate }: Props) {
  const { metrics, rawMaterials, purchaseOrders, wastageRecords } = data;
  const lowStock = rawMaterials.filter(item => item.currentStock <= item.minimumStockLevel);
  const monthPurchases = purchaseOrders
    .filter(order => order.status === 'RECEIVED' && isInCurrentMonth(order.receivedDate ?? order.orderDate, timeZone))
    .reduce((sum, order) => sum + Number(order.grandTotal), 0);
  const monthWastage = wastageRecords
    .filter(record => isInCurrentMonth(record.wasteDate, timeZone))
    .reduce((sum, record) => sum + Number(record.cost), 0);
  const pendingReceipt = purchaseOrders.find(order => order.status !== 'RECEIVED' && order.status !== 'CANCELLED');
  const wastageByItem = wastageRecords
    .filter(record => isInCurrentMonth(record.wasteDate, timeZone))
    .reduce<Record<string, number>>((result, record) => {
      const name = record.rawMaterial?.name ?? 'Unknown item';
      result[name] = (result[name] ?? 0) + Number(record.cost);
      return result;
    }, {});
  const topWaste = Object.entries(wastageByItem).sort((a, b) => b[1] - a[1])[0];

  const primaryCards = [
    { label: 'Total inventory value', value: formatCurrency(metrics.totalValue), detail: 'At weighted average cost' },
    { label: 'Inventory items', value: String(metrics.totalItems), detail: 'Active ingredients and supplies' },
    { label: 'Low stock', value: String(metrics.lowStockItems), detail: 'At or below minimum level' },
    { label: 'Out of stock', value: String(metrics.outOfStockItems), detail: 'Immediate attention required' },
  ];

  return (
    <div className="space-y-8">
      <section aria-labelledby="inventory-summary-heading" className="space-y-4">
        <SectionHeader title="Inventory at a glance" description="Live operational view of your active stock." />
        <h2 id="inventory-summary-heading" className="sr-only">Inventory summary</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {primaryCards.map(card => (
            <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
            </article>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-bold text-slate-500">Purchases this month</p><p className="mt-1 text-xl font-black text-emerald-600">{formatCurrency(monthPurchases)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-bold text-slate-500">Wastage this month</p><p className="mt-1 text-xl font-black text-red-600">{formatCurrency(monthWastage)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs font-bold text-slate-500">Stock health</p><p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{metrics.stockHealthScore === null ? 'Not available' : `${metrics.stockHealthScore}%`}</p>
          </article>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="space-y-4">
          <SectionHeader title="Attention required" description="Real alerts derived from current stock and recorded wastage." />
          {lowStock.length === 0 && !topWaste ? (
            <EmptyState title="Nothing urgent right now" description="All tracked items are above their minimum stock levels." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
              {lowStock.slice(0, 5).map(item => (
                <button key={item.id} onClick={() => openDialog({ type: 'detail', item })} className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-4 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <span className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-500/10"><AlertTriangle className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-800 dark:text-white">{item.name} is {item.currentStock <= 0 ? 'out of stock' : 'below minimum stock'}</strong><span className="text-xs text-slate-500">{item.currentStock} {item.unit} available · minimum {item.minimumStockLevel} {item.unit}</span></span>
                </button>
              ))}
              {topWaste && (
                <button onClick={() => navigate('operations')} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-500/10"><Trash2 className="h-4 w-4" /></span>
                  <span><strong className="block text-sm text-slate-800 dark:text-white">{topWaste[0]} has the highest recorded wastage this month</strong><span className="text-xs text-slate-500">{formatCurrency(topWaste[1])} recorded loss</span></span>
                </button>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader title="Quick actions" description="Common inventory tasks, one step away." />
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
            {[
              { label: 'Add item', icon: PackagePlus, action: () => openDialog({ type: 'item' }), disabled: false },
              { label: 'Receive stock', icon: ShoppingCart, action: () => pendingReceipt && openDialog({ type: 'receive', purchaseOrder: pendingReceipt }), disabled: !pendingReceipt },
              { label: 'Record wastage', icon: Trash2, action: () => openDialog({ type: 'wastage' }), disabled: rawMaterials.length === 0 },
              { label: 'Adjust stock', icon: Scale, action: () => openDialog({ type: 'adjust' }), disabled: rawMaterials.length === 0 },
              { label: 'Start stock count', icon: ClipboardCheck, action: () => openDialog({ type: 'count' }), disabled: rawMaterials.length === 0 },
            ].map(({ label, icon: Icon, action, disabled }) => (
              <button key={label} onClick={action} disabled={disabled} className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/5">
                <Icon className="h-5 w-5 text-[#FF6B35]" /><span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{label}</span>
              </button>
            ))}
            <ActionButton tone="secondary" onClick={() => navigate('stock')}>View all stock</ActionButton>
          </div>
        </section>
      </div>
    </div>
  );
}

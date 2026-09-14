import { useMemo, useState } from 'react';
import { ArrowUpDown, Edit2, Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { InventoryDialog, RawMaterial } from './inventory-types';
import { formatCurrency, formatInventoryDate, getStockStatus, stockValue } from './inventory-utils';
import { ActionButton, EmptyState, SectionHeader, StatusBadge } from './InventoryPrimitives';

interface Props {
  items: RawMaterial[];
  timeZone: string;
  openDialog: (dialog: InventoryDialog) => void;
}

type SortKey = 'name' | 'stock' | 'value' | 'updated';

export function InventoryStock({ items, timeZone, openDialog }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState<SortKey>('name');
  const categories = useMemo(() => [...new Set(items.map(item => item.category))].sort(), [items]);
  const filtered = useMemo(() => items.filter(item => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query);
    const matchesCategory = category === 'All' || item.category === category;
    const itemStatus = getStockStatus(item);
    return matchesSearch && matchesCategory && (status === 'All' || itemStatus === status);
  }).sort((a, b) => {
    if (sort === 'stock') return a.currentStock - b.currentStock;
    if (sort === 'value') return stockValue(b) - stockValue(a);
    if (sort === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return a.name.localeCompare(b.name);
  }), [items, search, category, status, sort]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Stock" description="Every active ingredient and supply, with clear reorder thresholds." action={<ActionButton onClick={() => openDialog({ type: 'item' })}><Plus className="h-4 w-4" /> Add inventory item</ActionButton>} />
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto] dark:border-slate-800 dark:bg-slate-900/60">
        <label className="relative"><span className="sr-only">Search stock</span><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search item or SKU" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950" /></label>
        <select aria-label="Filter by category" value={category} onChange={event => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option>All</option>{categories.map(value => <option key={value}>{value}</option>)}</select>
        <select aria-label="Filter by stock status" value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option>All</option><option>Healthy</option><option>Low Stock</option><option>Out of Stock</option></select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950"><ArrowUpDown className="h-4 w-4 text-slate-400" /><span className="sr-only">Sort stock</span><select value={sort} onChange={event => setSort(event.target.value as SortKey)} className="bg-transparent py-2.5 text-sm outline-none"><option value="name">Name</option><option value="stock">Lowest stock</option><option value="value">Highest value</option><option value="updated">Recently updated</option></select></label>
      </div>

      {filtered.length === 0 ? <EmptyState title="No stock items found" description={items.length ? 'Try changing your search or filters.' : 'Add your first ingredient to begin tracking stock.'} /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950/70"><tr>{['Item / ingredient', 'Category', 'Current stock', 'Unit', 'Minimum', 'Average cost', 'Stock value', 'Status', 'Last updated', ''].map(label => <th key={label} className="px-4 py-3 font-extrabold">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-4"><button onClick={() => openDialog({ type: 'detail', item })} className="text-left"><strong className="block text-slate-900 hover:text-[#FF6B35] dark:text-white">{item.name}</strong><span className="text-xs text-slate-400">{item.sku}</span></button></td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                    <td className="px-4 py-4 font-black text-slate-900 dark:text-white">{item.currentStock}</td>
                    <td className="px-4 py-4 uppercase text-slate-500">{item.unit}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.minimumStockLevel}</td>
                    <td className="px-4 py-4">{formatCurrency(item.averageCost)}</td>
                    <td className="px-4 py-4 font-bold">{formatCurrency(stockValue(item))}</td>
                    <td className="px-4 py-4"><StatusBadge status={getStockStatus(item)} /></td>
                    <td className="px-4 py-4 text-xs text-slate-500">{formatInventoryDate(item.updatedAt, timeZone)}</td>
                    <td className="px-4 py-4"><div className="flex gap-1"><button onClick={() => openDialog({ type: 'item', item })} title={`Edit ${item.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDialog({ type: 'adjust', item })} title={`Adjust ${item.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-[#FF6B35] dark:hover:bg-orange-500/10"><SlidersHorizontal className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">Showing {filtered.length} of {items.length} active items. Expiry status is excluded because batch-level inventory is not exposed by the current API.</div>
        </div>
      )}
    </div>
  );
}

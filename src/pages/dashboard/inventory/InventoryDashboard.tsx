import { useState } from 'react';
import { BarChart3, BookOpen, Boxes, ClipboardList, Package, ShoppingCart } from 'lucide-react';
import { useRestaurantTimezone } from '../../../lib/timezone';
import type { InventoryDialog, InventoryTab } from './inventory-types';
import { InventoryDialogs } from './InventoryDialogs';
import { InventoryErrorState, InventoryLoading } from './InventoryPrimitives';
import { InventoryOverview } from './InventoryOverview';
import { InventoryStock } from './InventoryStock';
import { InventoryRecipes } from './InventoryRecipes';
import { InventoryPurchases } from './InventoryPurchases';
import { InventoryOperations } from './InventoryOperations';
import { InventoryReports } from './InventoryReports';
import { useInventoryWorkspace } from './useInventoryWorkspace';

const tabs: Array<{ id: InventoryTab; label: string; icon: typeof Package }> = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'stock', label: 'Stock', icon: Boxes },
  { id: 'recipes', label: 'Recipes', icon: BookOpen },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'operations', label: 'Operations', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export const InventoryDashboard = () => {
  const timeZone = useRestaurantTimezone();
  const [activeTab, setActiveTab] = useState<InventoryTab>('overview');
  const [dialog, setDialog] = useState<InventoryDialog>(null);
  const { data, loading, error, refreshInventory } = useInventoryWorkspace();

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B35] text-white shadow-sm shadow-orange-500/20"><Package className="h-5 w-5" /></span>
          <div><h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Inventory</h1><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Know what you have, what it costs, and what needs attention.</p></div>
        </div>
        {!loading && !error && <p className="text-xs font-medium text-slate-400">{data.metrics.totalItems} active items</p>}
      </header>

      <nav aria-label="Inventory sections" className="overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/60">
          {tabs.map(tab => { const Icon = tab.icon; const selected = tab.id === activeTab; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={selected ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${selected ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}
        </div>
      </nav>

      {loading ? <InventoryLoading /> : error ? <InventoryErrorState message={error} onRetry={() => void refreshInventory()} /> : (
        <main>
          {activeTab === 'overview' && <InventoryOverview data={data} timeZone={timeZone} openDialog={setDialog} navigate={setActiveTab} />}
          {activeTab === 'stock' && <InventoryStock items={data.rawMaterials} timeZone={timeZone} openDialog={setDialog} />}
          {activeTab === 'recipes' && <InventoryRecipes recipes={data.recipes} menuItems={data.menuItems} rawMaterials={data.rawMaterials} openDialog={setDialog} />}
          {activeTab === 'purchases' && <InventoryPurchases purchaseOrders={data.purchaseOrders} suppliers={data.suppliers} rawMaterials={data.rawMaterials} timeZone={timeZone} openDialog={setDialog} />}
          {activeTab === 'operations' && <InventoryOperations rawMaterials={data.rawMaterials} wastageRecords={data.wastageRecords} auditRecords={data.auditRecords} timeZone={timeZone} openDialog={setDialog} />}
          {activeTab === 'reports' && <InventoryReports data={data} />}
        </main>
      )}

      <InventoryDialogs dialog={dialog} data={data} timeZone={timeZone} onClose={() => setDialog(null)} onMutated={refreshInventory} />
    </div>
  );
};

export default InventoryDashboard;

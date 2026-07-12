import React from 'react';
import { AlertCircle, Archive, Clipboard, TrendingDown, DollarSign } from 'lucide-react';

interface MovingItem {
  name: string;
  quantity: number;
}

interface SupplierPerformance {
  name: string;
  avgDelayDays: number;
  posReceived: number;
}

interface RawMaterialStock {
  name: string;
  stock: number;
  unit: string;
  value: number;
}

interface InventoryData {
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  wastageCost: number;
  fastMoving: MovingItem[];
  slowMoving: MovingItem[];
  supplierPerformance: SupplierPerformance[];
  rawMaterialsList: RawMaterialStock[];
}

interface InventoryTabProps {
  data: InventoryData;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const InventoryTab: React.FC<InventoryTabProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Value</p>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">{fmt(data.inventoryValue)}</h4>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Out of Stock</p>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">{data.outOfStockCount} items</h4>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Low Stock Level</p>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">{data.lowStockCount} items</h4>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wastage Loss</p>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">{fmt(data.wastageCost)}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-5">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Stock Turnover Speed
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400">FAST MOVING INGREDIENTS</h4>
              {data.fastMoving.length === 0 ? (
                <p className="text-[10px] text-slate-400">No consumption logged.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.fastMoving.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-[11px] p-1.5 bg-slate-50 dark:bg-slate-900/35 rounded-lg border">
                      <span className="font-extrabold truncate max-w-[80px]">{item.name}</span>
                      <span className="text-[#FF6B35] font-black">{item.quantity.toFixed(1)} units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-600 dark:text-amber-400">SLOW / DEAD INGREDIENTS</h4>
              {data.slowMoving.length === 0 ? (
                <p className="text-[10px] text-slate-400">All inventory moving fine.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.slowMoving.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-[11px] p-1.5 bg-slate-50 dark:bg-slate-900/35 rounded-lg border">
                      <span className="font-extrabold truncate max-w-[80px]">{item.name}</span>
                      <span className="text-slate-500 font-bold">0 consumption</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Supplier Delivery Performance
          </h3>

          {data.supplierPerformance.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs my-auto">No supplier PO records yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 my-auto">
              {data.supplierPerformance.map((sup) => (
                <div key={sup.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{sup.name}</h4>
                    <p className="text-[9px] text-slate-400">{sup.posReceived} shipments received</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-extrabold px-1.5 py-0.5 rounded-md text-[10px] ${
                      sup.avgDelayDays <= 1 
                        ? 'text-emerald-600 bg-emerald-500/10'
                        : 'text-amber-600 bg-amber-500/10'
                    }`}>
                      {sup.avgDelayDays} day delay avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Award, Layers, TrendingUp, Info } from 'lucide-react';

interface MatrixItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  price: number;
  cost: number;
  unitMargin: number;
  totalProfit: number;
  viewCount: number;
  conversionRate: number;
  quadrant: string;
}

interface MenuData {
  matrix: MatrixItem[];
  bestSelling: MatrixItem[];
  worstSelling: MatrixItem[];
  highestProfit: MatrixItem[];
}

interface MenuTabProps {
  data: MenuData;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const MenuTab: React.FC<MenuTabProps> = ({ data }) => {
  const stars = data.matrix.filter((item) => item.quadrant === 'Star');
  const plowhorses = data.matrix.filter((item) => item.quadrant === 'Plowhorse');
  const puzzles = data.matrix.filter((item) => item.quadrant === 'Puzzle');
  const dogs = data.matrix.filter((item) => item.quadrant === 'Dog');

  return (
    <div className="space-y-6">
      <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Menu Engineering Matrix
          </h3>
          <div className="group relative flex items-center gap-1 cursor-pointer">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-400">What is this?</span>
            <div className="absolute right-0 top-6 w-60 p-2.5 bg-white dark:bg-slate-900 border text-[9px] text-slate-500 rounded-xl shadow-xl hidden group-hover:block z-30">
              Classifies dishes into: <br />
              <b>★ Stars</b>: High Popularity, High Profit<br />
              <b>♞ Plowhorses</b>: High Popularity, Low Profit<br />
              <b>? Puzzles</b>: Low Popularity, High Profit<br />
              <b>⚠ Dogs</b>: Low Popularity, Low Profit
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400">★ STARS (High Volume, High Profit)</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-600 rounded">{stars.length}</span>
            </div>
            {stars.length === 0 ? (
              <p className="text-[10px] text-slate-400">No items qualify.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stars.map((item) => (
                  <span key={item.id} className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border rounded-lg shadow-sm">
                    {item.name} <span className="text-emerald-500">({item.quantity} sold)</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black text-blue-600 dark:text-blue-400">? PUZZLES (Low Volume, High Profit)</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/15 text-blue-600 rounded">{puzzles.length}</span>
            </div>
            {puzzles.length === 0 ? (
              <p className="text-[10px] text-slate-400">No items qualify.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {puzzles.map((item) => (
                  <span key={item.id} className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border rounded-lg shadow-sm">
                    {item.name} <span className="text-blue-500">(margin: {fmt(item.unitMargin)})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black text-amber-600 dark:text-amber-400">♞ PLOWHORSES (High Volume, Low Profit)</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/15 text-amber-600 rounded">{plowhorses.length}</span>
            </div>
            {plowhorses.length === 0 ? (
              <p className="text-[10px] text-slate-400">No items qualify.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {plowhorses.map((item) => (
                  <span key={item.id} className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border rounded-lg shadow-sm">
                    {item.name} <span className="text-amber-500">({item.quantity} sold)</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-black text-rose-600 dark:text-rose-400">⚠ DOGS (Low Volume, Low Profit)</h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/15 text-rose-600 rounded">{dogs.length}</span>
            </div>
            {dogs.length === 0 ? (
              <p className="text-[10px] text-slate-400">No items qualify.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {dogs.map((item) => (
                  <span key={item.id} className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border rounded-lg shadow-sm">
                    {item.name} <span className="text-rose-500">(low volume)</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Top Selling Menu Items
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.bestSelling.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{item.name}</h4>
                </div>
                <div className="text-right">
                  <span className="font-black text-[#FF6B35]">{item.quantity} sold</span>
                  <p className="text-[9px] text-slate-400">Rev: {fmt(item.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-[#1f2937]/25 border border-slate-200/50 dark:border-[#374151]/30 backdrop-blur-md rounded-[26px] p-6">
          <h3 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Highest Profit Contributions
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.highestProfit.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white">{item.name}</h4>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">+{fmt(item.totalProfit)} profit</span>
                  <p className="text-[9px] text-slate-400">Margin: {fmt(item.unitMargin)} / unit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

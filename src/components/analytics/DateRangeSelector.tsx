import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

interface DateRangeSelectorProps {
  onRangeChange: (start: Date, end: Date, comparison: boolean) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Last 30 Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [comparePrevious, setComparePrevious] = useState(true);

  const ranges = [
    { name: 'Today', getValue: () => {
      const s = new Date(); s.setHours(0,0,0,0);
      const e = new Date(); e.setHours(23,59,59,999);
      return { s, e };
    }},
    { name: 'Yesterday', getValue: () => {
      const s = new Date(); s.setDate(s.getDate() - 1); s.setHours(0,0,0,0);
      const e = new Date(); e.setDate(e.getDate() - 1); e.setHours(23,59,59,999);
      return { s, e };
    }},
    { name: 'Last 7 Days', getValue: () => {
      const s = new Date(); s.setDate(s.getDate() - 6); s.setHours(0,0,0,0);
      const e = new Date(); e.setHours(23,59,59,999);
      return { s, e };
    }},
    { name: 'Last 30 Days', getValue: () => {
      const s = new Date(); s.setDate(s.getDate() - 29); s.setHours(0,0,0,0);
      const e = new Date(); e.setHours(23,59,59,999);
      return { s, e };
    }},
    { name: 'This Month', getValue: () => {
      const now = new Date();
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(); e.setHours(23,59,59,999);
      return { s, e };
    }},
    { name: 'Last Month', getValue: () => {
      const now = new Date();
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      e.setHours(23,59,59,999);
      return { s, e };
    }},
  ];

  const handleRangeSelect = (rangeName: string, getValue: () => { s: Date; e: Date }) => {
    setSelectedRange(rangeName);
    setIsOpen(false);
    const { s, e } = getValue();
    onRangeChange(s, e, comparePrevious);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    const s = new Date(customStart); s.setHours(0,0,0,0);
    const eDate = new Date(customEnd); eDate.setHours(23,59,59,999);
    setSelectedRange('Custom');
    setIsOpen(false);
    onRangeChange(s, eDate, comparePrevious);
  };

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-white dark:bg-[#1f2937]/50 border border-slate-200 dark:border-[#374151]/30 hover:border-[#FF6B35]/40 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm"
      >
        <Calendar className="w-4 h-4 text-[#FF6B35]" />
        <span>{selectedRange}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-2xl p-4 shadow-2xl space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Ranges</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ranges.map((r) => (
                <button
                  key={r.name}
                  onClick={() => handleRangeSelect(r.name, r.getValue)}
                  className={`px-3 py-1.5 rounded-lg text-left text-xs transition-all flex items-center justify-between ${
                    selectedRange === r.name
                      ? 'bg-[#FF6B35]/15 text-[#FF6B35] font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{r.name}</span>
                  {selectedRange === r.name && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Custom Date Range</p>
            <form onSubmit={handleCustomSubmit} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!customStart || !customEnd}
                className="w-full py-2 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-xs font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
              >
                Apply Range
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Compare with Prior Period</span>
            <input
              type="checkbox"
              checked={comparePrevious}
              onChange={(evt) => {
                const isChecked = evt.target.checked;
                setComparePrevious(isChecked);
                const match = ranges.find((r) => r.name === selectedRange);
                if (match) {
                  const { s, e } = match.getValue();
                  onRangeChange(s, e, isChecked);
                }
              }}
              className="w-4 h-4 text-[#FF6B35] rounded focus:ring-[#FF6B35]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';

export function InventoryLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading inventory">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map(item => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />)}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800" />
      <span className="sr-only">Loading inventory data…</span>
    </div>
  );
}

export function InventoryErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-500" />
      <h2 className="font-bold text-slate-900 dark:text-white">Inventory could not be loaded</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">{message}</p>
      <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
        <RefreshCw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <Inbox className="mx-auto mb-3 h-7 w-7 text-slate-400" />
      <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ActionButton({ children, onClick, disabled = false, tone = 'primary', type = 'button' }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
}) {
  const tones = {
    primary: 'bg-[#FF6B35] text-white hover:bg-orange-600 shadow-orange-500/15',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/15',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}>
      {disabled && <LoaderCircle className="h-4 w-4 animate-spin" />}{children}
    </button>
  );
}

export function StatusBadge({ status }: { status: 'Healthy' | 'Low Stock' | 'Out of Stock' | 'RECEIVED' | 'PENDING' | 'DRAFT' | 'CANCELLED' }) {
  const classes = status === 'Healthy' || status === 'RECEIVED'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
    : status === 'Low Stock' || status === 'PENDING' || status === 'DRAFT'
      ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${classes}`}>{status}</span>;
}

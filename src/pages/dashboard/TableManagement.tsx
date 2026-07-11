import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import {
  Plus,
  QrCode,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  Download,
  Eye,
  EyeOff,
  TableProperties,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';
import { SkeletonLoader } from '../../components/SkeletonLoader';

// Helper to rewrite URL to localhost if running in local environment
const getTableUrl = (url: string | null): string => {
  if (!url) return '';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return url.replace(/https?:\/\/[^\/]+/, 'http://localhost:5173');
  }
  return url;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  qrCodeUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────
const CreateTableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number/name is required').max(20, 'Too long (max 20 chars)'),
});

const UpdateTableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number/name is required').max(20, 'Too long (max 20 chars)'),
});

type CreateTableInputs = z.infer<typeof CreateTableSchema>;
type UpdateTableInputs = z.infer<typeof UpdateTableSchema>;

// ─── QR Canvas Component ──────────────────────────────────────────────────────
const QRCodeCanvas: React.FC<{ value: string; size?: number }> = ({ value, size = 160 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#111827', light: '#FFFFFF' },
    }).catch((err) => console.error('QR generation error:', err));
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />;
};

// ─── Download QR helper ───────────────────────────────────────────────────────
const downloadQR = async (value: string, tableNumber: string) => {
  try {
    const dataUrl = await QRCode.toDataURL(value, {
      width: 512,
      margin: 3,
      color: { dark: '#111827', light: '#FFFFFF' },
    });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ordio-table-${tableNumber}.png`;
    link.click();
    toast.success(`QR code for Table ${tableNumber} downloaded!`);
  } catch (err) {
    toast.error('Failed to download QR code');
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export const TableManagement: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [qrViewTable, setQrViewTable] = useState<RestaurantTable | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const addForm = useForm<CreateTableInputs>({ resolver: zodResolver(CreateTableSchema) });
  const editForm = useForm<UpdateTableInputs>({ resolver: zodResolver(UpdateTableSchema) });

  // ─── Fetch tables ──────────────────────────────────────────────────────────
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/tables');
      setTables(res.tables || []);
    } catch (err: any) {
      toast.error('Failed to load tables: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  // ─── Create table ──────────────────────────────────────────────────────────
  const onCreateSubmit = async (data: CreateTableInputs) => {
    setActionLoading(true);
    try {
      await api.post('/tables', { tableNumber: data.tableNumber });
      toast.success(`Table "${data.tableNumber}" created with QR code!`);
      setIsAddModalOpen(false);
      addForm.reset();
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create table');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Edit table ────────────────────────────────────────────────────────────
  const handleOpenEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    editForm.reset({ tableNumber: table.tableNumber });
  };

  const onEditSubmit = async (data: UpdateTableInputs) => {
    if (!editingTable) return;
    setActionLoading(true);
    try {
      await api.patch(`/tables/${editingTable.id}`, { tableNumber: data.tableNumber });
      toast.success('Table updated successfully');
      setEditingTable(null);
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update table');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (table: RestaurantTable) => {
    setActionLoading(true);
    try {
      await api.patch(`/tables/${table.id}`, { isActive: !table.isActive });
      toast.success(`Table ${table.tableNumber} ${!table.isActive ? 'activated' : 'deactivated'}`);
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Delete table ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await api.delete(`/tables/${id}`);
      toast.success('Table deactivated successfully');
      setDeleteConfirmId(null);
      fetchTables();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate table');
    } finally {
      setActionLoading(false);
    }
  };

  const activeTables = tables.filter(t => t.isActive);
  const inactiveTables = tables.filter(t => !t.isActive);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tables & QR Codes</h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af]">
            Create tables and generate QR codes for customers to scan and order directly.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all shadow-md shadow-[#FF6B35]/15 hover:shadow-[#FF6B35]/25 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </button>
      </div>

      {/* Stats bar */}
      {!loading && tables.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total Tables', value: tables.length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Active Tables', value: activeTables.length, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Inactive Tables', value: inactiveTables.length, color: 'text-slate-600 dark:text-gray-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-[#1f2937]/25 border border-slate-200 dark:border-[#374151]/35 rounded-[16px] px-3 sm:px-5 py-3 sm:py-4 text-center">
              <p className={`text-xl sm:text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <SkeletonLoader type="grid" count={6} />
      ) : tables.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/20 border border-slate-200 dark:border-[#374151]/40 rounded-[24px] p-10 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-[#9ca3af]">
            <QrCode className="w-7 sm:w-8 h-7 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200">No tables yet</h3>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af] max-w-sm mt-1 mb-6">
            Add your restaurant tables to generate unique QR codes. Customers scan these to view the menu and place orders.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4b5563] border border-slate-300 dark:border-[#4b5563]/40 font-semibold text-sm text-slate-800 dark:text-white rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`bg-white dark:bg-[#1f2937]/25 border border-slate-200 dark:border-[#374151]/35 hover:border-[#FF6B35]/30 rounded-[20px] overflow-hidden flex flex-col transition-all duration-200 group ${!table.isActive ? 'opacity-55' : ''
                }`}
            >
              {/* QR Code Display */}
              <div className="bg-slate-50 dark:bg-white/5 p-5 sm:p-6 flex items-center justify-center border-b border-slate-200 dark:border-[#374151]/25 relative">
                {table.qrCodeUrl ? (
                  <div className="flex items-center justify-center">
                    <QRCodeCanvas value={getTableUrl(table.qrCodeUrl)} size={130} />
                  </div>
                ) : (
                  <div className="w-32 sm:w-36 h-32 sm:h-36 bg-slate-200 dark:bg-[#374151]/30 rounded-xl flex items-center justify-center text-slate-400 dark:text-[#9ca3af]">
                    <QrCode className="w-10 h-10" />
                  </div>
                )}

                {/* Status overlay badge */}
                {!table.isActive && (
                  <div className="absolute inset-0 bg-[#111827]/60 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-red-600/90 text-white text-xs font-bold rounded-full">
                      Inactive
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center text-[#FF6B35]">
                      <TableProperties className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Table {table.tableNumber}</p>
                      <p className={`text-[10px] font-semibold ${table.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-gray-500'}`}>
                        {table.isActive ? '● Active' : '● Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR URL */}
                {table.qrCodeUrl && (
                  <a
                    href={getTableUrl(table.qrCodeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-[#9ca3af] hover:text-[#FF6B35] transition-colors mb-3 truncate"
                    title={getTableUrl(table.qrCodeUrl)}
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{getTableUrl(table.qrCodeUrl)}</span>
                  </a>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-auto">
                  {/* Download QR */}
                  {table.qrCodeUrl && (
                    <button
                      onClick={() => downloadQR(getTableUrl(table.qrCodeUrl), table.tableNumber)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151]/40 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold"
                      title="Download QR Code"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  )}

                  {/* View QR enlarged */}
                  <button
                    onClick={() => setQrViewTable(table)}
                    className="p-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151]/40 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all"
                    title="View QR Code"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggleActive(table)}
                    disabled={actionLoading}
                    className={`p-2 rounded-xl border transition-all ${table.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-100 dark:bg-[#374151]/20 text-slate-500 dark:text-[#9ca3af] border-slate-200 dark:border-[#374151]/40 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    title={table.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {table.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(table)}
                    className="p-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151]/40 rounded-xl text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all"
                    title="Edit Table"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete confirmation */}
                  {deleteConfirmId === table.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(table.id)}
                        disabled={actionLoading}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 bg-slate-200 dark:bg-[#374151] text-slate-600 dark:text-gray-300 rounded-lg transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(table.id)}
                      className="p-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 rounded-xl text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-all"
                      title="Deactivate Table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add Table Modal ────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[24px] shadow-2xl p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF6B35]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-[#374151]/40 mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#FF6B35]" />
                Add New Table
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={addForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d1d5db] mb-2">
                  Table Number / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. T1, T2, VIP-1, Patio-3"
                  className={`w-full bg-slate-50 dark:bg-[#111827]/70 border ${addForm.formState.errors.tableNumber ? 'border-red-500' : 'border-slate-300 dark:border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  {...addForm.register('tableNumber')}
                />
                {addForm.formState.errors.tableNumber && (
                  <p className="text-red-500 text-xs mt-1">{addForm.formState.errors.tableNumber.message}</p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-[#9ca3af] mt-1.5">
                  A unique QR code will be auto-generated for this table.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-[#374151] hover:bg-slate-200 dark:hover:bg-[#4b5563] font-semibold text-sm text-slate-800 dark:text-white rounded-[12px] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-[12px] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                  {actionLoading ? 'Creating...' : 'Create & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Table Modal ────────────────────────────────────────────────── */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingTable(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[24px] shadow-2xl p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 z-10">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-[#374151]/40 mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#FF6B35]" />
                Edit Table {editingTable.tableNumber}
              </h2>
              <button onClick={() => setEditingTable(null)} className="p-1.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#d1d5db] mb-2">New Table Number / Name</label>
                <input
                  type="text"
                  className={`w-full bg-slate-50 dark:bg-[#111827]/70 border ${editForm.formState.errors.tableNumber ? 'border-red-500' : 'border-slate-300 dark:border-[#374151] focus:ring-[#FF6B35]'
                    } rounded-[12px] py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  {...editForm.register('tableNumber')}
                />
                {editForm.formState.errors.tableNumber && (
                  <p className="text-red-500 text-xs mt-1">{editForm.formState.errors.tableNumber.message}</p>
                )}
                <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1.5">
                  ⚠ Renaming regenerates the QR code URL. Reprint QR codes after renaming.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTable(null)} className="flex-1 py-3 bg-slate-100 dark:bg-[#374151] hover:bg-slate-200 dark:hover:bg-[#4b5563] font-semibold text-sm text-slate-800 dark:text-white rounded-[12px] transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-[12px] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QR Full View Modal ──────────────────────────────────────────────── */}
      {qrViewTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setQrViewTable(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 z-10 flex flex-col items-center gap-5 max-w-sm w-full">
            <button onClick={() => setQrViewTable(null)} className="absolute top-4 right-4 p-1.5 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Table {qrViewTable.tableNumber}</h2>
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] text-center mt-1">Scan to view menu & order</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl">
              {qrViewTable.qrCodeUrl && <QRCodeCanvas value={getTableUrl(qrViewTable.qrCodeUrl)} size={220} />}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-[#9ca3af] text-center max-w-[200px] break-all">
              {getTableUrl(qrViewTable.qrCodeUrl)}
            </p>

            {qrViewTable.qrCodeUrl && (
              <button
                onClick={() => downloadQR(getTableUrl(qrViewTable.qrCodeUrl), qrViewTable.tableNumber)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF6B35] hover:bg-orange-600 font-semibold text-sm text-white rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                Download QR Code (PNG)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;

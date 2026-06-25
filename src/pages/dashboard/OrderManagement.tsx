import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Utensils,
  Eye,
  RefreshCw,
  Receipt,
  FileText,
  Coffee,
  Printer,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

interface Table {
  id: string;
  tableNumber: string;
}

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  createdAt: string;
  table: Table;
  orderItems: OrderItem[];
}

interface OrderStats {
  NEW: number;
  PREPARING: number;
  READY: number;
  SERVED: number;
  CANCELLED: number;
}

// ─── Format Currency ──────────────────────────────────────────────────────────
const fmt = (amount: number, _currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://backend-steel-seven-97.vercel.app/api');

export const OrderManagement: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ NEW: 0, PREPARING: 0, READY: 0, SERVED: 0, CANCELLED: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [pollInterval, setPollInterval] = useState<number>(10000);

  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7_DAYS' | '1_MONTH' | '1_YEAR' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState<string>('');

  const getFilteredOrders = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(todayStart.getTime() - 365 * 24 * 60 * 60 * 1000);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (dateFilter) {
        case 'TODAY':
          return orderDate >= todayStart;
        case '7_DAYS':
          return orderDate >= sevenDaysAgo;
        case '1_MONTH':
          return orderDate >= thirtyDaysAgo;
        case '1_YEAR':
          return orderDate >= oneYearAgo;
        case 'CUSTOM':
          if (!customDate) return true;
          const [year, month, day] = customDate.split('-').map(Number);
          const start = new Date(year, month - 1, day);
          const end = new Date(year, month - 1, day, 23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        case 'ALL':
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  const fetchOrdersAndStats = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);

    try {
      let ordersUrl = `${BASE_URL}/orders`;
      if (activeTab !== 'ALL') {
        ordersUrl += `?status=${activeTab}`;
      }
      const ordersRes = await fetch(ordersUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error(ordersData.error || 'Failed to fetch orders');
      
      if (orders.length > 0 && ordersData.orders.length > orders.length) {
        const hasNew = ordersData.orders.some((o: Order) => o.status === 'NEW' && !orders.some(prev => prev.id === o.id));
        if (hasNew) {
          toast.success('🔔 New Order Received!', { duration: 5000 });
          // Play notification chime sound using synthesized Web Audio API for maximum reliability
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const playTone = (freq: number, duration: number, delay: number) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = freq;
              osc.type = 'sine';
              gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);
              osc.start(audioCtx.currentTime + delay);
              osc.stop(audioCtx.currentTime + delay + duration);
            };
            // Double chime: E5 (659.25Hz) then G5 (783.99Hz)
            playTone(659.25, 0.15, 0);
            playTone(783.99, 0.25, 0.12);
          } catch (soundErr) {
            console.log('Audio playback blocked by browser or unsupported', soundErr);
          }
        }
      }
      setOrders(ordersData.orders);

      const statsRes = await fetch(`${BASE_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (!statsRes.ok) throw new Error(statsData.error || 'Failed to fetch order stats');
      setStats(statsData.stats);

    } catch (err: any) {
      toast.error(err.message || 'Error syncing data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, activeTab, orders]);

  useEffect(() => {
    fetchOrdersAndStats();
    const timer = setInterval(() => {
      fetchOrdersAndStats(true);
    }, pollInterval);
    return () => clearInterval(timer);
  }, [pollInterval, activeTab, token]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!token) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');
      
      toast.success(`Order status updated to ${nextStatus}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      
      const statsRes = await fetch(`${BASE_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData.stats);

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'NEW': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
      case 'PREPARING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      case 'READY': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'SERVED': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
    }
  };

  const renderActionButtons = (order: Order) => {
    const isUpdating = updatingId === order.id;
    switch (order.status) {
      case 'NEW':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all"
            >
              Decline
            </button>
            <button
              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
              disabled={isUpdating}
              className="px-4 py-1.5 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF6B35]/15 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Accept
            </button>
          </div>
        );
      case 'PREPARING':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUpdateStatus(order.id, 'READY')}
              disabled={isUpdating}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/15 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Ready
            </button>
          </div>
        );
      case 'READY':
        return (
          <button
            onClick={() => handleUpdateStatus(order.id, 'SERVED')}
            disabled={isUpdating}
            className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-1.5"
          >
            <Utensils className="w-3.5 h-3.5" />
            Serve Order
          </button>
        );
      default:
        return (
          <span className="text-xs text-slate-500 dark:text-gray-500 font-medium italic">
            Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Upper bar with title & stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Live Order Kitchen
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af]">Accept, prepare, and track orders in real time.</p>
        </div>

        {/* Polling & Refresh Controls */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 rounded-2xl px-4 py-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-[#9ca3af] font-medium flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Auto-refresh
          </span>
          <select
            value={pollInterval}
            onChange={(e) => setPollInterval(Number(e.target.value))}
            className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151]/40 rounded-lg text-xs text-slate-800 dark:text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          <button
            onClick={() => fetchOrdersAndStats()}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#374151]/50 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Manual sync"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'] as OrderStatus[]).map((status) => {
          let label: string = status;
          let iconColor = 'text-blue-600 dark:text-blue-400';
          let bgColor = 'from-blue-500/10 to-transparent border-blue-500/20';

          if (status === 'PREPARING') {
            label = 'Preparing';
            iconColor = 'text-amber-600 dark:text-amber-400';
            bgColor = 'from-amber-500/10 to-transparent border-amber-500/20';
          } else if (status === 'READY') {
            label = 'Ready';
            iconColor = 'text-emerald-600 dark:text-emerald-400';
            bgColor = 'from-emerald-500/10 to-transparent border-emerald-500/20';
          } else if (status === 'SERVED') {
            label = 'Served';
            iconColor = 'text-slate-500 dark:text-gray-400';
            bgColor = 'from-slate-500/10 to-transparent border-slate-500/20';
          } else if (status === 'CANCELLED') {
            label = 'Cancelled';
            iconColor = 'text-rose-600 dark:text-rose-400';
            bgColor = 'from-rose-500/10 to-transparent border-rose-500/20';
          } else {
            label = 'New';
          }

          return (
            <div
              key={status}
              onClick={() => setActiveTab(status)}
              className={`cursor-pointer rounded-2xl border bg-gradient-to-br p-3 sm:p-4 transition-all hover:scale-[1.02] ${bgColor} ${
                activeTab === status ? 'border-[#FF6B35]/50 ring-1 ring-[#FF6B35]/30' : ''
              }`}
            >
              <p className="text-xs text-slate-500 dark:text-[#9ca3af] font-semibold">{label}</p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${iconColor}`}>{stats[status] ?? 0}</h3>
            </div>
          );
        })}
      </div>

      {/* Tab Filter Line */}
      <div className="border-b border-slate-200 dark:border-[#374151]/30 flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 text-sm font-semibold relative transition-all whitespace-nowrap ${
            activeTab === 'ALL' ? 'text-[#FF6B35]' : 'text-slate-500 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All ({Object.values(stats).reduce((a, b) => a + b, 0)})
          {activeTab === 'ALL' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
          )}
        </button>
        {(['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'] as OrderStatus[]).map((status) => {
          const count = stats[status] ?? 0;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`pb-3 text-sm font-semibold relative transition-all whitespace-nowrap ${
                activeTab === status ? 'text-[#FF6B35]' : 'text-slate-500 dark:text-[#9ca3af] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status === 'NEW' ? `New (${count})`
                : status === 'PREPARING' ? `Preparing (${count})`
                : status === 'READY' ? `Ready (${count})`
                : status === 'SERVED' ? `Served (${count})`
                : `Cancelled (${count})`}
              {activeTab === status && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">Filter Date:</span>
          {[
            { id: 'ALL', label: 'All time' },
            { id: 'TODAY', label: 'Today' },
            { id: '7_DAYS', label: '7 days' },
            { id: '1_MONTH', label: '1 month' },
            { id: '1_YEAR', label: '1 year' },
            { id: 'CUSTOM', label: 'By date' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setDateFilter(filter.id as any);
                if (filter.id !== 'CUSTOM') setCustomDate('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                dateFilter === filter.id
                  ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/15'
                  : 'bg-slate-55 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/60 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-200">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Select date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-slate-55 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/60 rounded-xl text-xs font-semibold text-slate-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            />
          </div>
        )}
      </div>

      {/* Orders Grid/List */}
      {loading ? (
        <SkeletonLoader type="grid" count={6} />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/15 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-10 sm:p-16 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[280px] sm:min-h-[350px]">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-[#9ca3af]">
            <Coffee className="w-7 sm:w-8 h-7 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200">No orders found</h3>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af] max-w-xs mt-1">
            {orders.length === 0 
              ? `There are currently no orders in the status filter: ${activeTab}.`
              : `No orders matching your selected date filter in status: ${activeTab}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#1f2937]/30 border border-slate-200 dark:border-[#374151]/40 rounded-[22px] p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#374151]/70 hover:shadow-md transition-all group"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-[#FF6B35] font-extrabold uppercase bg-[#FF6B35]/10 px-2 py-0.5 rounded-md border border-[#FF6B35]/25">
                      {order.orderNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                      Table {order.table.tableNumber}
                    </h4>
                    {order.customerName && (
                      <p className="text-xs text-slate-600 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-1 font-medium">
                        <span>👤 {order.customerName}</span>
                        {order.customerPhone && <span className="text-slate-400 dark:text-gray-500 font-normal">({order.customerPhone})</span>}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getStatusBadgeStyles(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Time */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9ca3af] mb-4">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(order.createdAt).toLocaleDateString()})
                </div>

                {/* Items Summary */}
                <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-3 space-y-2 mb-6">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 dark:text-gray-300 font-medium">
                        <strong className="text-[#FF6B35] mr-1">{item.quantity}×</strong> {item.itemName}
                      </span>
                      <span className="text-slate-500 dark:text-[#9ca3af] font-semibold">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="mt-2 bg-amber-50 dark:bg-[#111827]/40 border border-amber-200 dark:border-[#374151]/20 rounded-xl p-2.5 text-[11px] text-amber-700 dark:text-amber-400/90 leading-relaxed italic">
                      <strong className="text-amber-600 dark:text-amber-500 font-bold block mb-0.5 not-italic">Notes:</strong>
                      "{order.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-slate-100 dark:border-[#374151]/20 pt-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="p-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151]/60 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center gap-1 text-xs font-semibold border border-slate-200 dark:border-transparent"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
                {renderActionButtons(order)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detail Modal ────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          <div className="relative bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/55 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-[#374151]/30">
              <div>
                <span className="text-xs text-[#FF6B35] font-extrabold uppercase bg-[#FF6B35]/15 px-2.5 py-1 rounded-md border border-[#FF6B35]/30">
                  {selectedOrder.orderNumber}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Order Details — Table {selectedOrder.table.tableNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#374151] rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto scrollbar-thin">
              {/* Order Status & Time */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4">
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] uppercase font-bold tracking-wider">Status</p>
                  <span className={`text-xs font-bold inline-block border px-2 py-0.5 rounded-full mt-1 ${getStatusBadgeStyles(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 dark:text-[#9ca3af] uppercase font-bold tracking-wider">Order Time</p>
                  <p className="text-xs text-slate-800 dark:text-white font-semibold mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()} · {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              {selectedOrder.customerName && (
                <div>
                  <h4 className="text-xs text-[#FF6B35] font-extrabold uppercase tracking-wider mb-2">
                    Customer Details
                  </h4>
                  <div className="bg-slate-50 dark:bg-[#111827]/25 border border-slate-200 dark:border-[#374151]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-400">Name</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedOrder.customerName}</p>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="sm:text-right">
                        <p className="text-[10px] text-slate-400">Phone</p>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedOrder.customerPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div>
                <h4 className="text-xs text-[#FF6B35] font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Order Items
                </h4>
                <div className="bg-slate-50 dark:bg-[#111827]/25 border border-slate-200 dark:border-[#374151]/20 rounded-2xl p-4 space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-[#374151]/20 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.itemName}</p>
                        <p className="text-xs text-slate-500 dark:text-[#9ca3af] mt-0.5">
                          {fmt(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-gray-200">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-xs text-amber-600 dark:text-amber-500 font-extrabold uppercase tracking-wider mb-2">
                    Customer Notes
                  </h4>
                  <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed italic">
                    "{selectedOrder.notes}"
                  </div>
                </div>
              )}

              {/* Summary calculations */}
              <div>
                <h4 className="text-xs text-slate-500 dark:text-[#9ca3af] font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Receipt Summary
                </h4>
                <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-[#9ca3af]">Subtotal</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{fmt(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <>
                      <div className="flex justify-between text-xs pl-2 border-l border-slate-200 dark:border-[#374151]/30">
                        <span className="text-slate-500 dark:text-[#9ca3af]">CGST (50%)</span>
                        <span className="text-slate-900 dark:text-white font-medium">{fmt(selectedOrder.taxAmount / 2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pl-2 border-l border-slate-200 dark:border-[#374151]/30">
                        <span className="text-slate-500 dark:text-[#9ca3af]">SGST (50%)</span>
                        <span className="text-slate-900 dark:text-white font-medium">{fmt(selectedOrder.taxAmount / 2)}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-slate-200 dark:border-[#374151]/40 pt-2 flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-base">Total Bill</span>
                    <span className="font-extrabold text-[#FF6B35] text-lg">{fmt(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Quick Action */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-[#111827]/50 border-t border-slate-200 dark:border-[#374151]/40 flex justify-between gap-4">
              <button
                onClick={() => { window.print(); }}
                className="px-4 py-2 bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4b5563] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print KOT
              </button>
              {renderActionButtons(selectedOrder)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

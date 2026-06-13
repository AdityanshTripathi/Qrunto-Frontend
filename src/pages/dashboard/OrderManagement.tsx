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
const fmt = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

const BASE_URL = 'https://backend-steel-seven-97.vercel.app/api';

export const OrderManagement: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ NEW: 0, PREPARING: 0, READY: 0, SERVED: 0, CANCELLED: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [pollInterval, setPollInterval] = useState<number>(10000); // 10s default

  // Fetch orders and stats
  const fetchOrdersAndStats = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);

    try {
      // 1. Fetch Orders
      let ordersUrl = `${BASE_URL}/orders`;
      if (activeTab !== 'ALL') {
        ordersUrl += `?status=${activeTab}`;
      }
      const ordersRes = await fetch(ordersUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error(ordersData.error || 'Failed to fetch orders');
      
      // Check for any new order to trigger a sound/toast
      if (orders.length > 0 && ordersData.orders.length > orders.length) {
        const hasNew = ordersData.orders.some((o: Order) => o.status === 'NEW' && !orders.some(prev => prev.id === o.id));
        if (hasNew) {
          toast.success('🔔 New Order Received!', { duration: 5000 });
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
            audio.play();
          } catch (e) {
            // Browser might block audio play without user interaction
          }
        }
      }
      setOrders(ordersData.orders);

      // 2. Fetch Stats
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

  // Polling hook
  useEffect(() => {
    fetchOrdersAndStats();
    const timer = setInterval(() => {
      fetchOrdersAndStats(true);
    }, pollInterval);
    return () => clearInterval(timer);
  }, [pollInterval, activeTab, token]);

  // Update Status
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
      
      // Update local state to avoid full reload flickers
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      
      // Re-fetch stats in background
      const statsRes = await fetch(`${BASE_URL}/orders/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData.stats);

      // Update detail modal if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to determine status styling
  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'PREPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'READY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'SERVED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/25';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    }
  };

  // Action flow helper
  const renderActionButtons = (order: Order) => {
    const isUpdating = updatingId === order.id;
    switch (order.status) {
      case 'NEW':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all"
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
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all"
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
          <span className="text-xs text-gray-500 font-medium italic">
            Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper bar with title & stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Live Order Kitchen
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-sm text-[#9ca3af]">Accept, prepare, and track orders in real time.</p>
        </div>

        {/* Polling & Refresh Controls */}
        <div className="flex items-center gap-3 bg-[#1f2937]/35 border border-[#374151]/30 rounded-2xl px-4 py-2 self-start md:self-auto">
          <span className="text-xs text-[#9ca3af] font-medium flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Auto-refresh
          </span>
          <select
            value={pollInterval}
            onChange={(e) => setPollInterval(Number(e.target.value))}
            className="bg-[#111827] border border-[#374151]/40 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          <button
            onClick={() => fetchOrdersAndStats()}
            className="p-1.5 hover:bg-[#374151]/50 rounded-lg text-gray-400 hover:text-white transition-all"
            title="Manual sync"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'] as OrderStatus[]).map((status) => {
          let label: string = status;
          let iconColor = 'text-blue-400';
          let bgColor = 'from-blue-500/10 to-transparent border-blue-500/20';

          if (status === 'PREPARING') {
            label = 'Preparing';
            iconColor = 'text-amber-400';
            bgColor = 'from-amber-500/10 to-transparent border-amber-500/20';
          } else if (status === 'READY') {
            label = 'Ready';
            iconColor = 'text-emerald-400';
            bgColor = 'from-emerald-500/10 to-transparent border-emerald-500/20';
          } else if (status === 'SERVED') {
            label = 'Served';
            iconColor = 'text-gray-400';
            bgColor = 'from-gray-500/10 to-transparent border-gray-500/20';
          } else if (status === 'CANCELLED') {
            label = 'Cancelled';
            iconColor = 'text-rose-400';
            bgColor = 'from-rose-500/10 to-transparent border-rose-500/20';
          } else {
            label = 'New';
          }

          return (
            <div
              key={status}
              onClick={() => setActiveTab(status)}
              className={`cursor-pointer rounded-2xl border bg-gradient-to-br p-4 transition-all hover:scale-[1.02] ${bgColor} ${
                activeTab === status ? 'border-[#FF6B35]/50 ring-1 ring-[#FF6B35]/30' : ''
              }`}
            >
              <p className="text-xs text-[#9ca3af] font-semibold">{label}</p>
              <h3 className={`text-2xl font-bold mt-1 ${iconColor}`}>{stats[status] ?? 0}</h3>
            </div>
          );
        })}
      </div>

      {/* Tab Filter Line */}
      <div className="border-b border-[#374151]/30 flex gap-4 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 text-sm font-semibold relative transition-all ${
            activeTab === 'ALL' ? 'text-[#FF6B35]' : 'text-[#9ca3af] hover:text-white'
          }`}
        >
          All Orders ({Object.values(stats).reduce((a, b) => a + b, 0)})
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
                activeTab === status ? 'text-[#FF6B35]' : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {status === 'NEW'
                ? `New (${count})`
                : status === 'PREPARING'
                ? `Preparing (${count})`
                : status === 'READY'
                ? `Ready (${count})`
                : status === 'SERVED'
                ? `Served (${count})`
                : `Cancelled (${count})`}
              {activeTab === status && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
          <p className="text-[#9ca3af] text-sm font-medium">Fetching orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#1f2937]/15 border border-[#374151]/30 rounded-[28px] p-16 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-16 h-16 bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-[#9ca3af]">
            <Coffee className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-200">No orders here</h3>
          <p className="text-sm text-[#9ca3af] max-w-xs mt-1">
            There are currently no orders in the status filter: <strong className="text-white">{activeTab}</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1f2937]/30 border border-[#374151]/40 rounded-[22px] p-5 backdrop-blur-md flex flex-col justify-between hover:border-[#374151]/70 transition-all group"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-[#FF6B35] font-extrabold uppercase bg-[#FF6B35]/10 px-2 py-0.5 rounded-md border border-[#FF6B35]/25">
                      {order.orderNumber}
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-1.5">
                      Table {order.table.tableNumber}
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getStatusBadgeStyles(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Time */}
                <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] mb-4">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(order.createdAt).toLocaleDateString()})
                </div>

                {/* Items Summary */}
                <div className="border-t border-[#374151]/20 pt-3 space-y-2 mb-6">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300 font-medium">
                        <strong className="text-[#FF6B35] mr-1">{item.quantity}×</strong> {item.itemName}
                      </span>
                      <span className="text-[#9ca3af] font-semibold">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="mt-2 bg-[#111827]/40 border border-[#374151]/20 rounded-xl p-2.5 text-[11px] text-amber-400/90 leading-relaxed italic">
                      <strong className="text-amber-500 font-bold block mb-0.5 not-italic">Notes:</strong>
                      "{order.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="border-t border-[#374151]/20 pt-4 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="p-2 bg-[#374151]/30 hover:bg-[#374151]/60 text-gray-300 hover:text-white rounded-xl transition-all flex items-center gap-1 text-xs font-semibold"
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

          <div className="relative bg-[#1f2937] border border-[#374151]/55 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#374151]/30">
              <div>
                <span className="text-xs text-[#FF6B35] font-extrabold uppercase bg-[#FF6B35]/15 px-2.5 py-1 rounded-md border border-[#FF6B35]/30">
                  {selectedOrder.orderNumber}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2">
                  Order Details — Table {selectedOrder.table.tableNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-[#374151] rounded-xl text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Order Status & Time */}
              <div className="flex justify-between items-center bg-[#111827]/40 border border-[#374151]/30 rounded-2xl p-4">
                <div>
                  <p className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-wider">Status</p>
                  <span className={`text-xs font-bold inline-block border px-2 py-0.5 rounded-full mt-1 ${getStatusBadgeStyles(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-wider">Order Time</p>
                  <p className="text-xs text-white font-semibold mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()} · {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs text-[#FF6B35] font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Order Items
                </h4>
                <div className="bg-[#111827]/25 border border-[#374151]/20 rounded-2xl p-4 space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b border-[#374151]/20 pb-2.5 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-white">{item.itemName}</p>
                        <p className="text-xs text-[#9ca3af] mt-0.5">
                          {fmt(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-gray-200">{fmt(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-xs text-amber-500 font-extrabold uppercase tracking-wider mb-2">
                    Customer Notes
                  </h4>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-400/90 leading-relaxed italic">
                    "{selectedOrder.notes}"
                  </div>
                </div>
              )}

              {/* Summary calculations */}
              <div>
                <h4 className="text-xs text-[#9ca3af] font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Receipt Summary
                </h4>
                <div className="bg-[#111827]/40 border border-[#374151]/30 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9ca3af]">Subtotal</span>
                    <span className="text-white font-semibold">{fmt(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#9ca3af]">Tax Amount</span>
                      <span className="text-white font-semibold">{fmt(selectedOrder.taxAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#374151]/40 pt-2 flex justify-between">
                    <span className="font-bold text-white text-base">Total Bill</span>
                    <span className="font-extrabold text-[#FF6B35] text-lg">{fmt(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Quick Action */}
            <div className="px-6 py-5 bg-[#111827]/50 border-t border-[#374151]/40 flex justify-between gap-4">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#374151] hover:bg-[#4b5563] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
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

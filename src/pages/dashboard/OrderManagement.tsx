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
  Plus,
  X,
  Search,
  Minus,
  Download,
  Share2,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';

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
  kotNumber?: string | null;
  invoiceNumber?: string | null;
}

interface OrderStats {
  NEW: number;
  ACCEPTED: number;
  PREPARING: number;
  READY: number;
  SERVED: number;
  PAID: number;
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
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ NEW: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, SERVED: 0, PAID: 0, CANCELLED: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [pollInterval, setPollInterval] = useState<number>(10000);

  // KOT and Invoice states
  const [addingItemsOrder, setAddingItemsOrder] = useState<Order | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeMenuCat, setActiveMenuCat] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [waiterCart, setWaiterCart] = useState<Record<string, number>>({});
  const [submittingItems, setSubmittingItems] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [printPayload, setPrintPayload] = useState<any | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(null);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<string>('CASH');

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
      case 'ACCEPTED': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
      case 'PREPARING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      case 'READY': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'SERVED': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25';
      case 'PAID': return 'bg-teal-500/10 text-teal-600 dark:text-[#2dd4bf] border-teal-500/25';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
    }
  };

  // ─── Add Items / Menu Methods ────────────────────────────────────────────────
  const fetchMenu = async () => {
    const slug = user?.restaurants?.[0]?.slug;
    if (!slug) return;
    setLoadingMenu(true);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
        setMenuItems(data.menuItems || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (addingItemsOrder) {
      fetchMenu();
    }
  }, [addingItemsOrder]);

  const updateCartQty = (itemId: string, change: number) => {
    setWaiterCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + change;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddItemsSubmit = async () => {
    if (!addingItemsOrder) return;
    const itemsPayload = Object.entries(waiterCart).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }));

    if (itemsPayload.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setSubmittingItems(true);
    try {
      const slug = user?.restaurants?.[0]?.slug;
      const res = await fetch(`${BASE_URL}/public/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: addingItemsOrder.table.tableNumber,
          items: itemsPayload,
          existingOrderId: addingItemsOrder.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add items');

      toast.success('Items successfully added to order!');
      setAddingItemsOrder(null);
      setWaiterCart({});
      fetchOrdersAndStats(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add items');
    } finally {
      setSubmittingItems(false);
    }
  };

  // ─── PDF Generation Methods ─────────────────────────────────────────────────
  const downloadKOTPDF = async (order: Order) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150]
    });

    const kotNum = order.kotNumber || `KOT-${order.orderNumber.split('-').pop()}`;
    
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('KITCHEN ORDER TICKET', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('----------------------------------', 40, 14, { align: 'center' });
    doc.text(`KOT #: ${kotNum}`, 5, 20);
    doc.text(`Order #: ${order.orderNumber}`, 5, 24);
    doc.text(`Table #: Table ${order.table.tableNumber}`, 5, 28);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 5, 32);
    doc.text('----------------------------------', 40, 36, { align: 'center' });
    doc.text('Qty   Item Description', 5, 42);
    doc.text('----------------------------------', 40, 46, { align: 'center' });

    let y = 52;
    order.orderItems.forEach((item) => {
      doc.text(`${item.quantity} x   ${item.itemName}`, 5, y);
      y += 5;
    });

    doc.text('----------------------------------', 40, y, { align: 'center' });
    y += 5;
    doc.text('Kitchen Copy - Direct Service', 40, y, { align: 'center' });

    doc.save(`KOT_${order.orderNumber}.pdf`);
  };

  const downloadInvoicePDF = async (order: Order, invoice: any, restInfo: any) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(restInfo.name.toUpperCase(), 40, 10, { align: 'center' });
    doc.setFontSize(7);
    if (restInfo.address) {
      doc.text(restInfo.address, 40, 14, { align: 'center', maxWidth: 70 });
    }
    if (restInfo.gstNumber) {
      doc.text(`GSTIN: ${restInfo.gstNumber}`, 40, 22, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.text('----------------------------------', 40, 26, { align: 'center' });
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 5, 32);
    doc.text(`Order #: ${order.orderNumber}`, 5, 36);
    doc.text(`Table #: Table ${order.table.tableNumber}`, 5, 40);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`, 5, 44);
    doc.text('----------------------------------', 40, 48, { align: 'center' });
    doc.text('Qty   Item Description        Amount', 5, 54);
    doc.text('----------------------------------', 40, 58, { align: 'center' });

    let y = 64;
    order.orderItems.forEach((item) => {
      const nameStr = item.itemName.padEnd(20, ' ').substring(0, 20);
      const amtStr = (item.totalPrice).toFixed(2).padStart(8, ' ');
      doc.text(`${item.quantity} x  ${nameStr}${amtStr}`, 5, y);
      y += 5;
    });

    doc.text('----------------------------------', 40, y, { align: 'center' });
    y += 5;
    
    doc.text(`Subtotal:              ${invoice.subtotal.toFixed(2).padStart(8, ' ')}`, 5, y);
    y += 5;
    if (invoice.discount > 0) {
      doc.text(`Discount:             -${invoice.discount.toFixed(2).padStart(8, ' ')}`, 5, y);
      y += 5;
    }
    if (invoice.gst > 0) {
      doc.text(`GST:                   ${invoice.gst.toFixed(2).padStart(8, ' ')}`, 5, y);
      y += 5;
    }
    
    doc.text('----------------------------------', 40, y, { align: 'center' });
    y += 5;
    doc.setFont('courier', 'bold');
    doc.text(`Grand Total:          INR ${(invoice.grandTotal).toFixed(2).padStart(8, ' ')}`, 5, y);
    y += 6;
    doc.setFont('courier', 'bold');
    doc.text(`Mode: ${invoice.paymentMethod} / ${invoice.paymentStatus}`, 5, y);
    y += 6;
    doc.text('----------------------------------', 40, y, { align: 'center' });
    y += 5;
    doc.text('Thank you! Visit Again!', 40, y, { align: 'center' });

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  // ─── Print / Download Actions ──────────────────────────────────────────────
  const handlePrintKOT = (order: Order) => {
    setPrintPayload({
      type: 'KOT',
      order,
    });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadKOT = (order: Order) => {
    downloadKOTPDF(order);
  };

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${order.id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invoice not generated yet');

      const settingsRes = await fetch(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settingsData = await settingsRes.json();

      downloadInvoicePDF(order, data.invoice, {
        name: settingsData.restaurant.name,
        address: settingsData.restaurant.address,
        gstNumber: settingsData.restaurant.gstNumber,
      });
    } catch (err: any) {
      toast.error(err.message || 'Invoice is not generated yet. Please generate invoice first.');
    }
  };

  const handlePrintExistingInvoice = async (order: Order) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${order.id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch invoice');

      const settingsRes = await fetch(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settingsData = await settingsRes.json();

      setPrintPayload({
        type: 'INVOICE',
        order,
        invoice: data.invoice,
        restaurantName: settingsData.restaurant.name,
        restaurantAddress: settingsData.restaurant.address,
        restaurantGst: settingsData.restaurant.gstNumber,
      });

      setTimeout(() => {
        window.print();
      }, 300);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch invoice');
    }
  };
  const handleGenerateInvoiceSubmit = async (order: Order) => {
    setGeneratingInvoiceId(order.id);
    try {
      const res = await fetch(`${BASE_URL}/orders/${order.id}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          discount: invoiceDiscount,
          paymentMethod: invoicePaymentMethod,
          markPaid: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');

      toast.success('Invoice generated successfully!');
      
      const settingsRes = await fetch(`${BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const settingsData = await settingsRes.json();
      
      setPrintPayload({
        type: 'INVOICE',
        order,
        invoice: data.invoice,
        restaurantName: settingsData.restaurant.name,
        restaurantAddress: settingsData.restaurant.address,
        restaurantGst: settingsData.restaurant.gstNumber,
      });

      setIsInvoiceModalOpen(false);
      fetchOrdersAndStats(true);
      
      setTimeout(() => {
        window.print();
      }, 300);
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  const handleShareInvoice = async (order: Order) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${order.id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invoice not generated yet');

      const text = `Invoice #: ${data.invoice.invoiceNumber}\nTable: ${order.table.tableNumber}\nTotal: ₹${data.invoice.grandTotal}\nStatus: ${data.invoice.paymentStatus}\nThank you!`;
      await navigator.clipboard.writeText(text);
      toast.success('Invoice details copied to clipboard!');
    } catch (err: any) {
      toast.error(err.message || 'Invoice is not generated yet.');
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
              onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
              disabled={isUpdating}
              className="px-4 py-1.5 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF6B35]/15 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Accept
            </button>
          </div>
        );
      case 'ACCEPTED':
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
              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
              disabled={isUpdating}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/15 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Prepare
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
              className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/15 transition-all flex items-center gap-1.5"
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
      case 'SERVED':
        return (
          <button
            onClick={() => {
              setInvoiceDiscount(0);
              setInvoicePaymentMethod('CASH');
              setSelectedInvoiceOrder(order);
              setIsInvoiceModalOpen(true);
            }}
            disabled={isUpdating}
            className="w-full py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-500/15 transition-all flex items-center justify-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            Settle Bill
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
        {(['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'] as (keyof OrderStats)[]).map((status) => {
          let label: string = status;
          let iconColor = 'text-blue-600 dark:text-blue-400';
          let bgColor = 'from-blue-500/10 to-transparent border-blue-500/20';

          if (status === 'ACCEPTED') {
            label = 'Accepted';
            iconColor = 'text-purple-600 dark:text-purple-400';
            bgColor = 'from-purple-500/10 to-transparent border-purple-500/20';
          } else if (status === 'PREPARING') {
            label = 'Preparing';
            iconColor = 'text-amber-600 dark:text-amber-400';
            bgColor = 'from-amber-500/10 to-transparent border-amber-500/20';
          } else if (status === 'READY') {
            label = 'Ready';
            iconColor = 'text-[#10b981] dark:text-[#34d399]';
            bgColor = 'from-emerald-500/10 to-transparent border-emerald-500/20';
          } else if (status === 'SERVED') {
            label = 'Served';
            iconColor = 'text-sky-500 dark:text-sky-400';
            bgColor = 'from-sky-500/10 to-transparent border-sky-500/20';
          } else if (status === 'PAID') {
            label = 'Paid';
            iconColor = 'text-teal-600 dark:text-[#2dd4bf]';
            bgColor = 'from-teal-500/10 to-transparent border-teal-500/20';
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
        {(['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'] as (keyof OrderStats)[]).map((status) => {
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
                : status === 'ACCEPTED' ? `Accepted (${count})`
                : status === 'PREPARING' ? `Preparing (${count})`
                : status === 'READY' ? `Ready (${count})`
                : status === 'SERVED' ? `Served (${count})`
                : status === 'PAID' ? `Paid (${count})`
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

                {/* Quick Actions Bar */}
                <div className="grid grid-cols-2 gap-2 mt-2 mb-4 pt-3 border-t border-slate-100 dark:border-[#374151]/20">
                  <button
                    onClick={() => setAddingItemsOrder(order)}
                    className="py-1.5 px-2 bg-orange-55 dark:bg-orange-500/5 hover:bg-orange-100 text-[#FF6B35] rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] font-bold border border-orange-200 dark:border-[#FF6B35]/15"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Items
                  </button>

                  {/* Print KOT Action (NEW, ACCEPTED, PREPARING) */}
                  {['NEW', 'ACCEPTED', 'PREPARING'].includes(order.status) ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePrintKOT(order)}
                        className="flex-1 py-1.5 px-2 bg-indigo-50 dark:bg-indigo-500/5 hover:bg-indigo-100 text-indigo-500 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] font-bold border border-indigo-200 dark:border-indigo-500/15"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        KOT
                      </button>
                      <button
                        onClick={() => handleDownloadKOT(order)}
                        className="p-1.5 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 text-slate-500 dark:text-gray-300 rounded-xl transition-all border border-slate-200 dark:border-transparent"
                        title="Download KOT PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {/* Invoice Action (SERVED, PAID) */}
                      <button
                        onClick={() => {
                          if (order.invoiceNumber) {
                            handlePrintExistingInvoice(order);
                          } else {
                            setInvoiceDiscount(0);
                            setInvoicePaymentMethod('CASH');
                            setSelectedInvoiceOrder(order);
                            setIsInvoiceModalOpen(true);
                          }
                        }}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 dark:bg-emerald-500/5 hover:bg-emerald-100 text-emerald-500 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/15"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        {order.invoiceNumber ? 'Print Bill' : 'Settle Bill'}
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-1.5 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 text-slate-500 dark:text-gray-300 rounded-xl transition-all border border-slate-200 dark:border-transparent"
                        title="Download Bill PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareInvoice(order)}
                        className="p-1.5 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 text-slate-500 dark:text-gray-300 rounded-xl transition-all border border-slate-200 dark:border-transparent"
                        title="Copy invoice details"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
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
                onClick={() => handlePrintKOT(selectedOrder)}
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

      {/* ─── Add Items Modal ──────────────────────────────────────────────── */}
      {addingItemsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setAddingItemsOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-[#374151]/35 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Add Items to Order #{addingItemsOrder.orderNumber}</h3>
                <span className="text-[10px] text-[#FF6B35] font-black uppercase tracking-wider">Table T-{addingItemsOrder.table.tableNumber}</span>
              </div>
              <button onClick={() => setAddingItemsOrder(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Categories */}
            <div className="p-4 border-b border-slate-100 dark:border-[#374151]/35 space-y-3 bg-slate-50/50 dark:bg-[#111827]/10">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none"
                />
              </div>

              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveMenuCat('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 border transition-all ${
                    activeMenuCat === 'all'
                      ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                      : 'bg-white dark:bg-[#1f2937] border-slate-200 dark:border-[#374151]'
                  }`}
                >
                  All
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveMenuCat(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold shrink-0 border transition-all ${
                      activeMenuCat === cat.id
                        ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                        : 'bg-white dark:bg-[#1f2937] border-slate-200 dark:border-[#374151]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingMenu ? (
                <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF6B35]" /></div>
              ) : menuItems.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">No dishes available.</div>
              ) : (
                menuItems
                  .filter((item: any) => {
                    const matchCat = activeMenuCat === 'all' || item.categoryId === activeMenuCat;
                    const matchSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((item: any) => {
                    const qty = waiterCart[item.id] || 0;
                    return (
                      <div key={item.id} className="p-3 bg-slate-50 dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/30 rounded-2xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                          <p className="text-[10px] font-black text-[#FF6B35] mt-0.5">{fmt(item.price)}</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {qty === 0 ? (
                            <button
                              onClick={() => updateCartQty(item.id, 1)}
                              className="px-3 py-1.5 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white rounded-lg text-[10px] font-black tracking-wider uppercase transition-all"
                            >
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-[#FF6B35] rounded-lg px-1 py-0.5 text-white">
                              <button onClick={() => updateCartQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-black w-4 text-center">{qty}</span>
                              <button onClick={() => updateCartQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center hover:bg-white/10 rounded">
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            {Object.keys(waiterCart).length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-[#374151]/35 bg-slate-50 dark:bg-[#111827]/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {Object.values(waiterCart).reduce((a, b) => a + b, 0)} items added
                  </p>
                  <p className="text-sm font-black text-[#FF6B35]">
                    {fmt(Object.entries(waiterCart).reduce((sum, [id, qty]) => {
                      const item = menuItems.find((m) => m.id === id);
                      return sum + (item?.price || 0) * qty;
                    }, 0))}
                  </p>
                </div>
                <button
                  onClick={handleAddItemsSubmit}
                  disabled={submittingItems}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/15 disabled:opacity-60"
                >
                  {submittingItems ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Settle Bill / Invoice Modal ────────────────────────────────────── */}
      {isInvoiceModalOpen && selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsInvoiceModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] p-5 sm:p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#374151]/20">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Settle Order Bill</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Order #{selectedInvoiceOrder.orderNumber}</p>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Subtotal Display */}
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Order Subtotal:</span>
                <span className="text-slate-900 dark:text-white">{fmt(selectedInvoiceOrder.subtotal)}</span>
              </div>

              {/* Discount Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Apply Discount (₹ Rupees)</label>
                <input
                  type="number"
                  min="0"
                  max={selectedInvoiceOrder.subtotal}
                  value={invoiceDiscount}
                  onChange={(e) => setInvoiceDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-55 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-xs font-bold"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Payment Method</label>
                <select
                  value={invoicePaymentMethod}
                  onChange={(e) => setInvoicePaymentMethod(e.target.value)}
                  className="w-full bg-slate-55 dark:bg-[#111827]/40 border border-slate-300 dark:border-[#374151]/50 rounded-xl py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-xs font-bold"
                >
                  <option value="CASH">Cash 💵</option>
                  <option value="UPI">UPI / QR Code 📱</option>
                  <option value="CARD">Debit / Credit Card 💳</option>
                </select>
              </div>

              {/* Final Settle Calculation */}
              <div className="bg-slate-50 dark:bg-[#111827]/30 border border-slate-200 dark:border-[#374151]/30 rounded-2xl p-4 space-y-2 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount Applied:</span>
                  <span className="text-rose-500">-₹{invoiceDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-[#374151]/20 pt-2 text-sm">
                  <span className="text-slate-800 dark:text-white">Net Total:</span>
                  <span className="text-[#FF6B35] text-base">
                    ₹{Math.max(0, selectedInvoiceOrder.subtotal - invoiceDiscount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGenerateInvoiceSubmit(selectedInvoiceOrder)}
              disabled={generatingInvoiceId === selectedInvoiceOrder.id}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 transition-all"
            >
              {generatingInvoiceId === selectedInvoiceOrder.id ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Generate Invoice &amp; Settle</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Print Layout Container (Hidden on screen, visible during print) ─── */}
      {printPayload && (
        <div id="print-section" className="hidden print:block text-black font-sans text-xs p-2 w-[80mm] mx-auto bg-white">
          {printPayload.type === 'KOT' ? (
            <div className="space-y-2">
              <div className="text-center font-bold text-sm tracking-widest border-b-2 border-dashed border-black pb-2">
                KITCHEN ORDER TICKET
              </div>
              <div className="space-y-1 font-semibold border-b border-dashed border-black pb-2">
                <div>KOT #: {printPayload.order.kotNumber || `KOT-${printPayload.order.orderNumber.split('-').pop()}`}</div>
                <div>Order #: {printPayload.order.orderNumber}</div>
                <div>Table #: Table {printPayload.order.table.tableNumber}</div>
                <div>Date: {new Date(printPayload.order.createdAt).toLocaleString()}</div>
              </div>
              <div className="border-b border-dashed border-black py-2">
                <table className="w-full text-left font-bold">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="py-1 w-10">Qty</th>
                      <th className="py-1">Item Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printPayload.order.orderItems.map((item: any) => (
                      <tr key={item.id} className="align-top border-b border-slate-100 last:border-0">
                        <td className="py-1 font-extrabold">{item.quantity} x</td>
                        <td className="py-1">
                          <div>{item.itemName}</div>
                          {printPayload.order.notes && (
                            <div className="text-[10px] font-normal italic">
                              * {printPayload.order.notes}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center text-[10px] pt-2 italic border-t border-dashed border-black">
                Kitchen Copy - Direct Service
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-center space-y-1 border-b-2 border-dashed border-black pb-2">
                <div className="font-bold text-sm uppercase">{printPayload.restaurantName}</div>
                {printPayload.restaurantAddress && (
                  <div className="text-[10px] leading-tight font-medium max-w-[200px] mx-auto">
                    {printPayload.restaurantAddress}
                  </div>
                )}
                {printPayload.restaurantGst && (
                  <div className="text-[10px] font-bold">GSTIN: {printPayload.restaurantGst}</div>
                )}
              </div>
              <div className="space-y-1 font-semibold border-b border-dashed border-black pb-2 text-[10px]">
                <div>Invoice #: {printPayload.invoice.invoiceNumber}</div>
                <div>Order #: {printPayload.order.orderNumber}</div>
                <div>Table #: Table {printPayload.order.table.tableNumber}</div>
                <div>Date: {new Date(printPayload.invoice.createdAt).toLocaleString()}</div>
              </div>
              <div className="border-b border-dashed border-black py-2 text-[10px]">
                <table className="w-full text-left font-semibold">
                  <thead>
                    <tr className="border-b border-black font-bold">
                      <th className="py-1 w-10">Qty</th>
                      <th className="py-1">Item Description</th>
                      <th className="py-1 text-right w-16">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printPayload.order.orderItems.map((item: any) => (
                      <tr key={item.id} className="align-top border-b border-slate-100 last:border-0">
                        <td className="py-1 font-extrabold">{item.quantity} x</td>
                        <td className="py-1">{item.itemName}</td>
                        <td className="py-1 text-right">{(item.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1.5 border-b border-dashed border-black py-2 font-bold text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{printPayload.invoice.subtotal.toFixed(2)}</span>
                </div>
                {printPayload.invoice.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-{printPayload.invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {printPayload.invoice.gst > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({((printPayload.invoice.gst / (printPayload.invoice.subtotal - printPayload.invoice.discount)) * 100).toFixed(0)}%):</span>
                    <span>{printPayload.invoice.gst.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black border-t border-dashed border-black pt-1.5">
                  <span>Grand Total:</span>
                  <span>₹{printPayload.invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-1 font-semibold text-[10px] pb-2 border-b border-dashed border-black">
                <div>Payment Mode: {printPayload.invoice.paymentMethod}</div>
                <div>Payment Status: {printPayload.invoice.paymentStatus}</div>
              </div>
              <div className="text-center text-[10px] pt-2 font-bold uppercase tracking-wider">
                Thank you! Visit Again!
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Dynamic Print Media Styling Override ────────────────────────────── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-section, #print-section * {
            visibility: visible !important;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            padding: 4mm !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;

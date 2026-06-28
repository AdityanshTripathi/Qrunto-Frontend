import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { WaiterDashboardLayout } from '../../components/WaiterDashboardLayout';
import {
  Bell, BellRing, ClipboardList, Clock, Coffee, Plus, Search,
  ShoppingCart, User, Loader2, X, AlertTriangle, ShieldCheck, QrCode, Minus, Receipt
} from 'lucide-react';
import { OrderManagement } from '../dashboard/OrderManagement';

// Interfaces
interface Table {
  id: string;
  tableNumber: string;
  isActive: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  tableNumber: string;
  createdAt: string;
  items: OrderItem[];
  paymentStatus: string;
  customerName?: string | null;
  customerPhone?: string | null;
}

interface CustomerRequest {
  id: string;
  title: string;
  message: string;
  type: 'NEW_ORDER' | 'BILLING' | 'SYSTEM' | 'HELP_REQUEST';
  isRead: boolean;
  createdAt: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  foodType: 'veg' | 'nonveg';
}

interface Category {
  id: string;
  name: string;
}

const fmt = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('ordio.in') || import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://backend-steel-seven-97.vercel.app';
};

const SOCKET_URL = getSocketUrl();

export const WaiterDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';



  // Data states
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [billRequests, setBillRequests] = useState<CustomerRequest[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddItemsOpen, setIsAddItemsOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  
  // Settle bill states
  const [paymentMethods, setPaymentMethods] = useState<Record<string, 'CASH' | 'CARD' | 'UPI'>>({});
  const [settlingId, setSettlingId] = useState<string | null>(null);
  
  // Searching & Adding Cart
  const [menuSearch, setMenuSearch] = useState('');
  const [activeMenuCat, setActiveMenuCat] = useState('all');
  const [waiterCart, setWaiterCart] = useState<Record<string, number>>({});
  const [submittingItems, setSubmittingItems] = useState(false);
  
  const restaurantSlug = user?.restaurants[0]?.slug || '';
  const restaurantId = user?.restaurants[0]?.id || '';

  // Refs for tracking changes and avoiding stale closure bugs in polling intervals & sockets
  const requestsRef = useRef<CustomerRequest[]>([]);
  const ordersRef = useRef<Order[]>([]);

  useEffect(() => {
    requestsRef.current = [...requests, ...billRequests];
  }, [requests, billRequests]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Tone synthesis for alerts
  const playAlertSound = (type: 'order' | 'request') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, duration: number, delay: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };
      if (type === 'order') {
        playTone(523.25, 0.15, 0); // C5
        playTone(659.25, 0.25, 0.12); // E5
      } else {
        playTone(880.00, 0.1, 0); // A5
        playTone(880.00, 0.1, 0.15); // A5
      }
    } catch (err) {
      console.log('Audio playback blocked');
    }
  };

  // 1. Fetch Core Data
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch Tables
      const tablesRes = await api.get('/tables');
      setTables(tablesRes.tables || []);

      // Fetch Active Orders
      const ordersRes = await api.get('/orders');
      const mappedOrders: Order[] = (ordersRes.orders || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        tableNumber: order.table?.tableNumber || '',
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus || 'PENDING',
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items: (order.orderItems || []).map((item: any) => ({
          id: item.id,
          name: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      }));

      // Fetch Requests (Unread Notifications)
      const notifRes = await api.get('/notifications');
      const allNotifs: CustomerRequest[] = notifRes.notifications || [];
      const unreadHelpRequests = allNotifs.filter(n => !n.isRead && n.type === 'HELP_REQUEST');
      const unreadBillRequests = allNotifs.filter(n => !n.isRead && n.type === 'BILLING');

      // Change detection for new data when fetching silently (via polling or sockets)
      if (silent) {
        // 1. Check for new requests
        const currentReqIds = new Set(requestsRef.current.map(r => r.id));
        const newReqs = [...unreadHelpRequests, ...unreadBillRequests].filter(r => !currentReqIds.has(r.id));
        if (newReqs.length > 0) {
          newReqs.forEach(req => {
            toast.warning(`🔔 ${req.title}: ${req.message}`, { duration: 8000 });
          });
          playAlertSound('request');
        }

        // 2. Check for new orders or status transitions
        const currentOrderIds = new Set(ordersRef.current.map(o => o.id));
        const newOrders = mappedOrders.filter(o => !currentOrderIds.has(o.id) && o.status === 'NEW');
        if (newOrders.length > 0) {
          newOrders.forEach(order => {
            toast.info(`New Order #${order.orderNumber} placed at Table ${order.tableNumber}!`, { duration: 5000 });
          });
          playAlertSound('order');
        }

        // Check for items added to existing order
        ordersRef.current.forEach(oldOrder => {
          const newOrderObj = mappedOrders.find(o => o.id === oldOrder.id);
          if (newOrderObj && newOrderObj.items.length > oldOrder.items.length) {
            toast.info(`Items added to Order #${newOrderObj.orderNumber} at Table ${newOrderObj.tableNumber}!`, { duration: 5000 });
            playAlertSound('order');
          }
          if (newOrderObj && oldOrder.status !== 'READY' && newOrderObj.status === 'READY') {
            toast.info(`🍽️ Order #${newOrderObj.orderNumber} is READY to serve to Table ${newOrderObj.tableNumber}!`, { duration: 6000 });
            playAlertSound('order');
          }
        });
      }

      setOrders(mappedOrders);
      setRequests(unreadHelpRequests);
      setBillRequests(unreadBillRequests);

    } catch (err: any) {
      console.error(err);
      if (!silent) {
        toast.error('Failed to load server data');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 2. Fetch Restaurant Menu
  const fetchMenu = async () => {
    if (!restaurantSlug) return;
    try {
      const res = await fetch(`${SOCKET_URL}/api/public/${restaurantSlug}`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.menuItems || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMenu();

    // Fallback polling for serverless (Vercel) hosting where socket connections are unstable/unsupported
    const interval = setInterval(() => {
      fetchData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [restaurantSlug]);

  // 3. Socket.io Real-time Setup
  useEffect(() => {
    if (!restaurantId) return;

    const socket: Socket = io(SOCKET_URL);

    // Join Restaurant Room
    socket.emit('join_restaurant', restaurantId);

    // Socket events (delegated to delta-aware fetchData)
    socket.on('NEW_ORDER', () => fetchData(true));
    socket.on('ITEM_ADDED', () => fetchData(true));
    socket.on('CALL_WAITER', () => fetchData(true));
    socket.on('REQUEST_BILL', () => fetchData(true));
    socket.on('ORDER_UPDATED', () => fetchData(true));
    socket.on('ORDER_READY', () => fetchData(true));

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  // 4. Attend/Resolve Assistance Request
  const handleResolveRequest = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      toast.success('Request marked as attended');
      fetchData(true);
    } catch (err: any) {
      toast.error('Failed to resolve request');
    }
  };

  // Match billing notification to active order
  const getOrderForRequest = (req: CustomerRequest): Order | undefined => {
    const match = req.title.match(/Table\s+(\w+)/i) || req.message.match(/Table\s+(\w+)/i);
    if (match && match[1]) {
      const tableNum = match[1];
      return orders.find(
        (o) => o.tableNumber === tableNum && o.status !== 'PAID' && o.status !== 'CANCELLED'
      );
    }
    return undefined;
  };

  // Mark bill as paid from the waiter panel
  const handleMarkPaid = async (orderId: string, notifId: string) => {
    const method = paymentMethods[orderId] || 'CASH';
    setSettlingId(orderId);
    try {
      await api.post(`/orders/${orderId}/pay`, { paymentMethod: method });
      toast.success(`Bill settled via ${method}! Order status updated to SERVED.`);
      await api.patch(`/notifications/${notifId}/read`);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Error registering payment');
    } finally {
      setSettlingId(null);
    }
  };

  // 5. Update Order Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // 6. Manage Cart Quantities
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

  // 7. Submit Items to Existing Order (Merge Flow)
  const handleAddItemsSubmit = async (orderId: string, tableNumber: string) => {
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
      const res = await fetch(`${SOCKET_URL}/api/public/${restaurantSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: itemsPayload,
          existingOrderId: orderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add items');

      toast.success('Items successfully added and merged to order!');
      setIsAddItemsOpen(false);
      setIsDetailOpen(false);
      setWaiterCart({});
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add items');
    } finally {
      setSubmittingItems(false);
    }
  };

  // 8. Submit New Order
  const handleCreateOrderSubmit = async (tableNumber: string) => {
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
      const res = await fetch(`${SOCKET_URL}/api/public/${restaurantSlug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          items: itemsPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      toast.success('Order placed successfully for Table ' + tableNumber);
      setIsCreateOrderOpen(false);
      setWaiterCart({});
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setSubmittingItems(false);
    }
  };

  // Helper variables
  const activeOrders = orders.filter(o => o.status !== 'SERVED' && o.status !== 'CANCELLED');
  
  // Mapping Table ID to its Active Order
  const tableOrderMap = activeOrders.reduce<Record<string, Order>>((acc, order) => {
    const table = tables.find(t => t.tableNumber === order.tableNumber);
    if (table) {
      acc[table.id] = order;
    }
    return acc;
  }, {});

  // Mapping Table Number to its active Customer Assistance Requests
  const tableRequestsMap = requests.reduce<Record<string, CustomerRequest[]>>((acc, req) => {
    // Extract table number from notifications messages/titles like "Table 12 Settle Bill"
    const match = req.title.match(/Table\s+(\w+)/i) || req.message.match(/Table\s+(\w+)/i);
    if (match && match[1]) {
      const num = match[1];
      if (!acc[num]) acc[num] = [];
      acc[num].push(req);
    }
    return acc;
  }, {});

  // Cart helper calculations
  const cartTotalAmount = Object.entries(waiterCart).reduce((total, [itemId, qty]) => {
    const item = menuItems.find(m => m.id === itemId);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const cartTotalItems = Object.values(waiterCart).reduce((acc, q) => acc + q, 0);

  // Categories and search filter for Cart
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = activeMenuCat === 'all' || item.categoryId === activeMenuCat;
    return matchesSearch && matchesCat;
  });

  return (
    <WaiterDashboardLayout helpCount={requests.length} billCount={billRequests.length}>
      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard data...</p>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {!loading && activeTab === 'dashboard' && (
        <div className="space-y-6 text-left">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 p-4 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black">{tables.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Tables</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 p-4 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black">{activeOrders.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Orders</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 p-4 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 relative">
                <Bell className="w-5 h-5" />
                {requests.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
              </div>
              <div>
                <p className="text-xl font-black">{requests.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Calls</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 p-4 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black">
                  {orders.filter(o => o.status === 'READY').length}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Orders Ready</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Requests Card */}
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="font-black text-sm flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-500" />
                Active Customer Calls
              </h3>

              {requests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No pending customer assistance calls.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {requests.map(req => (
                    <div key={req.id} className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black text-red-600 dark:text-red-400">{req.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-300 mt-0.5">{req.message}</p>
                      </div>
                      <button
                        onClick={() => handleResolveRequest(req.id)}
                        className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black tracking-wider uppercase transition-all shadow-sm"
                      >
                        Attend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preparing / Active Orders */}
            <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[28px] p-5 shadow-sm space-y-4">
              <h3 className="font-black text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#FF6B35]" />
                Live Cooking Progress
              </h3>

              {activeOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No orders currently cooking.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {activeOrders.map(order => (
                    <div key={order.id} className="p-3 bg-slate-50 dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/30 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black">Order #{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Table {order.tableNumber} · {order.items?.length || 0} items</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        order.status === 'READY' 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : 'bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLES TAB */}
      {!loading && activeTab === 'tables' && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map(table => {
              const activeOrder = tableOrderMap[table.id];
              const isOccupied = !!activeOrder;
              const hasCalls = tableRequestsMap[table.tableNumber]?.length > 0;
              
              return (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    setIsDetailOpen(true);
                  }}
                  className={`p-5 rounded-[28px] border text-left flex flex-col justify-between aspect-square relative transition-all transform hover:scale-[1.02] shadow-sm ${
                    hasCalls
                      ? 'bg-red-500/10 border-red-500 shadow-lg shadow-red-500/10'
                      : isOccupied
                        ? 'bg-emerald-500/10 border-emerald-500'
                        : 'bg-white dark:bg-[#1f2937]/35 border-slate-200 dark:border-[#374151]/50 hover:bg-slate-50'
                  }`}
                >
                  {/* Flashing Alert Indicator */}
                  {hasCalls && (
                    <span className="absolute top-3 right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}

                  <span className={`text-[10px] font-black tracking-wider uppercase ${
                    hasCalls 
                      ? 'text-red-500' 
                      : isOccupied 
                        ? 'text-emerald-500' 
                        : 'text-slate-400'
                  }`}>
                    {hasCalls ? 'HELP CALL' : isOccupied ? 'OCCUPIED' : 'VACANT'}
                  </span>

                  <div>
                    <h4 className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white mt-2">
                      T-{table.tableNumber}
                    </h4>
                    {isOccupied && (
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate">
                        {fmt(activeOrder.totalAmount)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {!loading && activeTab === 'orders' && (
        <OrderManagement />
      )}

      {/* REQUESTS TAB */}
      {!loading && activeTab === 'requests' && (
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500 animate-pulse" />
              Customer Requests Log
            </h3>

            {requests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No active waiter calls or bill settlement requests.
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.id} className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-red-600 dark:text-red-400">{req.title}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-300 mt-1 leading-relaxed">{req.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        Received: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleResolveRequest(req.id)}
                      className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                      Mark Attended
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BILL REQUESTS TAB */}
      {!loading && activeTab === 'bills' && (
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-black text-sm flex items-center gap-2">
              <Receipt className="w-5 h-5 text-orange-500 animate-pulse" />
              Bill Settlement Requests
            </h3>

            {billRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No active bill settlement requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {billRequests.map(req => {
                  const matchedOrder = getOrderForRequest(req);
                  return (
                    <div key={req.id} className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-orange-500 font-extrabold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            Bill Request
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="text-sm font-black mt-2">{req.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{req.message}</p>

                        {matchedOrder ? (
                          <div className="mt-3 bg-slate-50 dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/20 rounded-xl p-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Order:</span>
                              <span className="font-bold">#{matchedOrder.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Customer:</span>
                              <span className="font-semibold">{matchedOrder.customerName || 'Walk-in'}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 dark:border-[#374151]/20">
                              <span className="text-slate-450 font-bold">Total Amount:</span>
                              <span className="font-extrabold text-[#FF6B35]">{fmt(matchedOrder.totalAmount)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-2 text-[11px] text-amber-600">
                            ⚠️ No active order found. Waiter can dismiss this alert.
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-[#374151]/20 flex items-center justify-between gap-2">
                        {matchedOrder ? (
                          <>
                            <select
                              value={paymentMethods[matchedOrder.id] || 'CASH'}
                              onChange={(e) => setPaymentMethods({ ...paymentMethods, [matchedOrder.id]: e.target.value as any })}
                              className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151]/40 rounded-xl text-xs text-slate-800 dark:text-white px-2 py-1.5 focus:outline-none"
                            >
                              <option value="CASH">💵 Cash</option>
                              <option value="CARD">💳 Card</option>
                              <option value="UPI">📱 UPI</option>
                            </select>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResolveRequest(req.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-gray-300 rounded-xl text-xs font-bold transition-all"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleMarkPaid(matchedOrder.id, req.id)}
                                disabled={settlingId === matchedOrder.id}
                                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                {settlingId === matchedOrder.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  'Settle'
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => handleResolveRequest(req.id)}
                            className="w-full py-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 text-slate-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-all"
                          >
                            Dismiss Alert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {!loading && activeTab === 'profile' && (
        <div className="space-y-6 text-left">
          <div className="bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/50 rounded-[28px] p-6 shadow-sm max-w-md mx-auto space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100 dark:border-[#374151]/35">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">{user?.name}</h3>
                <span className="px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 rounded-full text-[10px] font-black uppercase tracking-wider mt-1.5 inline-block">
                  Staff Waiter
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-100 dark:border-[#374151]/20 pb-3">
                <span className="text-slate-400 uppercase tracking-wider">Email</span>
                <span className="text-slate-800 dark:text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-[#374151]/20 pb-3">
                <span className="text-slate-400 uppercase tracking-wider">Restaurant Name</span>
                <span className="text-slate-800 dark:text-white">{user?.restaurants[0]?.name}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-slate-400 uppercase tracking-wider">Service Access</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Active Terminal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE DETAILS MODAL */}
      {isDetailOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-[#374151]/35 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white">Table {selectedTable.tableNumber} Details</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational Panel</span>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {tableOrderMap[selectedTable.id] ? (
                <>
                  {/* Order Details */}
                  <div className="bg-slate-50 dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/30 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#374151]/20">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Order</p>
                        <p className="font-black text-sm text-slate-800 dark:text-white">#{tableOrderMap[selectedTable.id].orderNumber}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/25 rounded-full text-[10px] font-black uppercase">
                        {tableOrderMap[selectedTable.id].status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300 font-medium">
                      {tableOrderMap[selectedTable.id].customerName && (
                        <p>👤 Customer: <strong>{tableOrderMap[selectedTable.id].customerName}</strong></p>
                      )}
                      {tableOrderMap[selectedTable.id].customerPhone && (
                        <p>📞 Phone: <strong>{tableOrderMap[selectedTable.id].customerPhone}</strong></p>
                      )}
                      <p>🕒 Time: <strong>{new Date(tableOrderMap[selectedTable.id].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</p>
                    <div className="divide-y divide-slate-100 dark:divide-[#374151]/20 border-b border-slate-100 dark:border-[#374151]/20 pb-3">
                      {tableOrderMap[selectedTable.id].items?.map(item => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {item.name} <strong className="text-[#FF6B35]">× {item.quantity}</strong>
                          </span>
                          <span className="font-bold">{fmt(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">Bill Total</span>
                      <span className="text-lg font-black text-[#FF6B35]">
                        {fmt(tableOrderMap[selectedTable.id].totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Table active calls */}
                  {tableRequestsMap[selectedTable.tableNumber]?.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                      <p className="text-xs font-black text-red-500 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-4 h-4" /> Pending Call Alerts
                      </p>
                      <div className="space-y-1.5">
                        {tableRequestsMap[selectedTable.tableNumber].map(req => (
                          <div key={req.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-gray-300">{req.message}</span>
                            <button
                              onClick={() => handleResolveRequest(req.id)}
                              className="text-red-500 dark:text-red-400 font-bold hover:underline"
                            >
                              Attend
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <Coffee className="w-12 h-12 mx-auto text-slate-300 dark:text-gray-700 mb-3" />
                  <p className="font-bold text-slate-800 dark:text-white">Table is Vacant</p>
                  <p className="text-xs text-slate-400 mt-1">No active order is registered on this table.</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-[#374151]/35 bg-slate-50 dark:bg-[#111827]/40 flex gap-3">
              {tableOrderMap[selectedTable.id] ? (
                <>
                  <button
                    onClick={() => {
                      setWaiterCart({});
                      setIsAddItemsOpen(true);
                    }}
                    className="flex-1 py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF6B35]/15"
                  >
                    <Plus className="w-4 h-4" />
                    Add Items to Order
                  </button>

                  <div className="relative flex-1">
                    <select
                      value={tableOrderMap[selectedTable.id].status}
                      onChange={(e) => handleUpdateStatus(tableOrderMap[selectedTable.id].id, e.target.value)}
                      className="w-full py-3 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151] rounded-2xl text-xs font-bold px-4 focus:outline-none text-slate-800 dark:text-white"
                    >
                      <option value="NEW">New Order</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready to Serve</option>
                      <option value="SERVED">Served</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setWaiterCart({});
                    setIsCreateOrderOpen(true);
                  }}
                  className="w-full py-3 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF6B35]/15"
                >
                  <Plus className="w-4 h-4" />
                  Place New Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND ADD ITEMS DIALOG (MERGE FLOW) */}
      {isAddItemsOpen && selectedTable && tableOrderMap[selectedTable.id] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddItemsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-[#374151]/35 flex items-center justify-between">
              <div>
                <h3 className="text-md font-black text-slate-800 dark:text-white">Add Items to Order #{tableOrderMap[selectedTable.id].orderNumber}</h3>
                <span className="text-[10px] text-[#FF6B35] font-black uppercase tracking-wider">Table T-{selectedTable.tableNumber}</span>
              </div>
              <button onClick={() => setIsAddItemsOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search */}
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

              {/* Categories */}
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
                {categories.map(cat => (
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
              {filteredMenuItems.map(item => {
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
              })}
            </div>

            {/* Cart Footer */}
            {cartTotalItems > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-[#374151]/35 bg-slate-50 dark:bg-[#111827]/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cartTotalItems} items added</p>
                  <p className="text-sm font-black text-[#FF6B35]">{fmt(cartTotalAmount)}</p>
                </div>
                <button
                  onClick={() => handleAddItemsSubmit(tableOrderMap[selectedTable.id].id, selectedTable.tableNumber)}
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

      {/* CREATE NEW ORDER DIALOG */}
      {isCreateOrderOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOrderOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/75 rounded-[28px] overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-[#374151]/35 flex items-center justify-between">
              <div>
                <h3 className="text-md font-black text-slate-800 dark:text-white">Place New Order</h3>
                <span className="text-[10px] text-[#FF6B35] font-black uppercase tracking-wider">Table T-{selectedTable.tableNumber}</span>
              </div>
              <button onClick={() => setIsCreateOrderOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search */}
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

              {/* Categories */}
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
                {categories.map(cat => (
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
              {filteredMenuItems.map(item => {
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
              })}
            </div>

            {/* Cart Footer */}
            {cartTotalItems > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-[#374151]/35 bg-slate-50 dark:bg-[#111827]/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cartTotalItems} items added</p>
                  <p className="text-sm font-black text-[#FF6B35]">{fmt(cartTotalAmount)}</p>
                </div>
                <button
                  onClick={() => handleCreateOrderSubmit(selectedTable.tableNumber)}
                  disabled={submittingItems}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/15 disabled:opacity-60"
                >
                  {submittingItems ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </WaiterDashboardLayout>
  );
};
export default WaiterDashboard;

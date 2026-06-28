import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Receipt, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  FileText,
  Printer,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
  status: string;
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

interface BillRequest {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface RestaurantDetails {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  logoUrl: string | null;
}

interface RestaurantSettings {
  currency: string;
  taxPercentage: number;
}

const fmt = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);

const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('ordio.in') || import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://backend-steel-seven-97.vercel.app/api');

export const BillsPage: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [billRequests, setBillRequests] = useState<BillRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantDetails, setRestaurantDetails] = useState<RestaurantDetails | null>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({ currency: 'INR', taxPercentage: 0 });
  
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<string, 'CASH' | 'CARD' | 'UPI'>>({});
  
  // Modal states for invoice preview
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [printType, setPrintType] = useState<boolean>(false);

  // Fetch initial core data
  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);

    try {
      // 1. Fetch unread notifications
      const notifRes = await fetch(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifData = await notifRes.json();
      if (!notifRes.ok) throw new Error(notifData.error || 'Failed to fetch notifications');
      
      // Filter BILLING notifications that are unread
      const billingReqs = (notifData.notifications || []).filter(
        (n: any) => !n.isRead && n.type === 'BILLING'
      );
      setBillRequests(billingReqs);

      // 2. Fetch active orders
      const ordersRes = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error(ordersData.error || 'Failed to fetch orders');
      setOrders(ordersData.orders || []);

    } catch (err: any) {
      toast.error(err.message || 'Error syncing data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  // Fetch settings on mount
  useEffect(() => {
    if (!token) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setRestaurantDetails(data.restaurant);
          setRestaurantSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings in BillsPage:', err);
      }
    };
    fetchSettings();
    fetchData();

    // Polling interval for updates
    const timer = setInterval(() => {
      fetchData(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [token, fetchData]);

  // Match notification table to active order
  const getOrderForRequest = (req: BillRequest): Order | undefined => {
    const match = req.title.match(/Table\s+(\w+)/i) || req.message.match(/Table\s+(\w+)/i);
    if (match && match[1]) {
      const tableNum = match[1];
      // Find order matching table number that is not already served/cancelled
      return orders.find(
        (o) => o.table.tableNumber === tableNum && o.status !== 'SERVED' && o.status !== 'CANCELLED'
      );
    }
    return undefined;
  };

  // Mark bill request as read / attended directly (without registering payment)
  const handleDismissRequest = async (notifId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to resolve request');
      toast.success('Request dismissed');
      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Error resolving request');
    }
  };

  // Mark order payment as settled
  const handleMarkPaid = async (orderId: string, notifId: string) => {
    if (!token) return;
    const method = paymentMethods[orderId] || 'CASH';
    setSettlingId(orderId);

    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register payment');

      toast.success(`Bill settled via ${method}! Order status updated to SERVED.`);
      
      // Auto dismiss/read the notification
      await fetch(`${BASE_URL}/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData(true);
    } catch (err: any) {
      toast.error(err.message || 'Error registering payment');
    } finally {
      setSettlingId(null);
    }
  };

  // Direct print Invoice
  const handlePrintInvoice = () => {
    setPrintType(true);
    setTimeout(() => {
      window.print();
      setPrintType(false);
    }, 150);
  };

  // Download PDF Invoice
  const handleDownloadInvoice = async (order: Order) => {
    const element = document.getElementById('modal-invoice-container');
    if (!element) {
      toast.error('Invoice element not found');
      return;
    }
    setDownloading(true);
    const toastId = toast.loading('Generating PDF invoice...');

    try {
      const originalStyle = element.style.cssText;
      element.style.cssText += 'background-color: #ffffff !important; color: #000000 !important;';

      const textElements = element.querySelectorAll('p, span, h1, h2, h3, h4, td, th');
      const originalColors: string[] = [];
      textElements.forEach((el) => {
        originalColors.push((el as HTMLElement).style.color);
        (el as HTMLElement).style.color = '#000000';
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      element.style.cssText = originalStyle;
      textElements.forEach((el, index) => {
        (el as HTMLElement).style.color = originalColors[index];
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${order.orderNumber.replace('ORD-', 'INV-')}.pdf`);
      toast.success('Invoice downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to generate PDF', err);
      toast.error('Failed to download invoice.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const renderBillContent = (order: Order, forPrint = false) => {
    const taxRate = restaurantSettings?.taxPercentage ?? 0;
    
    return (
      <div 
        id={forPrint ? "print-bill-container" : "modal-invoice-container"}
        className={`p-6 bg-white text-slate-800 ${forPrint ? 'w-full' : 'max-w-md mx-auto rounded-2xl border border-slate-200 shadow-sm'}`}
        style={forPrint ? { width: '80mm', margin: '0 auto', color: '#000000', backgroundColor: '#ffffff' } : { color: '#1e293b', backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="keep-color bg-slate-800 text-white p-4 rounded-t-xl flex justify-between items-center -mx-6 -mt-6 mb-4 shadow-sm">
          <div>
            <h2 className="text-sm font-black tracking-tight uppercase truncate max-w-[180px]">
              {restaurantDetails?.name || 'Restaurant'}
            </h2>
            <p className="text-[9px] text-slate-350 mt-0.5">Tax Invoice / Bill Statement</p>
            {restaurantDetails?.phone && (
              <p className="text-[8px] text-slate-400">Tel: {restaurantDetails.phone}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-base font-black tracking-wider text-slate-100">INVOICE</h1>
            <p className="text-[8px] text-slate-350">
              Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="text-[10px] text-slate-505 mb-3 space-y-0.5">
          {restaurantDetails?.address && <p>{restaurantDetails.address}</p>}
          {restaurantDetails?.gstNumber && (
            <p className="font-semibold text-slate-705">GSTIN: {restaurantDetails.gstNumber}</p>
          )}
        </div>

        {/* Meta Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] border-y border-slate-100 py-3 mb-3">
          <div>
            <span className="block font-bold text-slate-400 text-[9px] uppercase tracking-wider">Billed To:</span>
            {order.customerName ? (
              <>
                <p className="font-bold text-slate-800">{order.customerName}</p>
                {order.customerPhone && <p className="text-slate-550">{order.customerPhone}</p>}
              </>
            ) : (
              <p className="italic text-slate-500">Walk-in Guest</p>
            )}
            <p className="text-slate-500 mt-1">Table No: <strong>{order.table.tableNumber}</strong></p>
          </div>
          <div className="text-right">
            <span className="block font-bold text-slate-400 text-[9px] uppercase tracking-wider">Details:</span>
            <p className="font-black text-slate-800">
              Invoice No: <span className="text-[#FF6B35]">{(order.orderNumber).replace('ORD-', 'INV-')}</span>
            </p>
            <p className="text-slate-500">
              Order No: #{order.orderNumber}
            </p>
            <p className="text-slate-500 mt-0.5">
              Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="keep-color bg-slate-800 text-white font-bold text-[10px]">
                <th className="py-1.5 px-2 rounded-l">Item</th>
                <th className="py-1.5 px-2 text-center w-8">Qty</th>
                <th className="py-1.5 px-2 text-right w-16">Rate</th>
                <th className="py-1.5 px-2 text-right w-20 rounded-r">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {order.orderItems.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                  <td className="py-2 px-2 font-bold text-slate-800">{item.itemName}</td>
                  <td className="py-2 px-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-2 px-2 text-right text-slate-500">{fmt(item.unitPrice, restaurantSettings.currency)}</td>
                  <td className="py-2 px-2 text-right font-bold text-slate-800">{fmt(item.totalPrice, restaurantSettings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-4">
          <div className="w-48 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-500 px-1">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">{fmt(order.subtotal, restaurantSettings.currency)}</span>
            </div>
            {taxRate > 0 && (
              <div className="space-y-1 border-l border-slate-200 pl-2 text-slate-500">
                <div className="flex justify-between text-[10px]">
                  <span>CGST ({(taxRate / 2).toFixed(1)}%)</span>
                  <span>{fmt(order.taxAmount / 2, restaurantSettings.currency)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>SGST ({(taxRate / 2).toFixed(1)}%)</span>
                  <span>{fmt(order.taxAmount / 2, restaurantSettings.currency)}</span>
                </div>
              </div>
            )}
            <div className="keep-color bg-[#FFFAF0] border border-[#F3E1D3] rounded-xl p-2.5 flex justify-between items-center text-xs font-black text-[#FF6B35] shadow-sm">
              <span className="uppercase tracking-wider text-[9px]">Grand Total</span>
              <span className="text-sm">{fmt(order.totalAmount, restaurantSettings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-slate-200 pt-3 text-center space-y-3">
          <div className="text-[9px] text-slate-400 space-y-0.5">
            <p className="font-bold text-slate-700">Thank you for dining with us!</p>
            <p>Please visit again · Powered by Ordio</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Bill settlementRequests
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#9ca3af]">Manage incoming table bill requests and register cash counter payments.</p>
        </div>

        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-white dark:bg-[#1f2937]/35 border border-slate-200 dark:border-[#374151]/30 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 dark:text-gray-300 flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Requests
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="grid" count={3} />
      ) : billRequests.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2937]/15 border border-slate-200 dark:border-[#374151]/30 rounded-[28px] p-16 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-14 h-14 bg-slate-100 dark:bg-[#374151]/30 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200">All settled!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            There are currently no pending bill settlement requests from any table.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {billRequests.map((req) => {
            const matchedOrder = getOrderForRequest(req);
            
            return (
              <div 
                key={req.id}
                className="bg-white dark:bg-[#1f2937]/30 border border-slate-200 dark:border-[#374151]/40 rounded-[22px] p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#374151]/75 hover:shadow-md transition-all backdrop-blur-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-red-500 font-extrabold uppercase bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                      Bill Request
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1.5">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{req.message}</p>

                  {matchedOrder ? (
                    <div className="mt-4 bg-slate-50 dark:bg-[#111827]/40 border border-slate-100 dark:border-[#374151]/25 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Order No:</span>
                        <span className="font-bold text-slate-850 dark:text-white">#{matchedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Customer:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {matchedOrder.customerName || 'Walk-in'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1.5 border-t border-dashed border-slate-200 dark:border-[#374151]/25">
                        <span className="text-slate-400 font-bold">Total Amount:</span>
                        <span className="font-extrabold text-[#FF6B35] text-sm">
                          {fmt(matchedOrder.totalAmount, restaurantSettings.currency)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-xs text-amber-600">
                      ⚠️ No active order found for this table. Staff can dismiss this request manually.
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#374151]/20 flex items-center justify-between gap-3">
                  {matchedOrder ? (
                    <>
                      <button
                        onClick={() => setSelectedOrder(matchedOrder)}
                        className="p-2 bg-slate-100 dark:bg-[#374151]/30 hover:bg-slate-200 dark:hover:bg-[#374151]/60 text-slate-600 dark:text-gray-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Preview Customer Bill"
                      >
                        <Eye className="w-4 h-4" />
                        Bill
                      </button>

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <select
                          value={paymentMethods[matchedOrder.id] || 'CASH'}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, [matchedOrder.id]: e.target.value as any })}
                          className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#374151]/40 rounded-xl text-xs text-slate-800 dark:text-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                        >
                          <option value="CASH">💵 Cash</option>
                          <option value="CARD">💳 Card</option>
                          <option value="UPI">📱 UPI</option>
                        </select>

                        <button
                          onClick={() => handleMarkPaid(matchedOrder.id, req.id)}
                          disabled={settlingId !== null}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/15 flex items-center gap-1 disabled:opacity-50"
                        >
                          {settlingId === matchedOrder.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Settle
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDismissRequest(req.id)}
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

      {/* BILL MODAL PREVIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          <div className="relative bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-[#374151]/55 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-[#374151]/30">
              <span className="text-xs text-[#FF6B35] font-extrabold uppercase bg-[#FF6B35]/15 px-2.5 py-1 rounded-md border border-[#FF6B35]/30">
                Tax Invoice Preview
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#374151] rounded-xl text-slate-500 dark:text-gray-400 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex justify-center bg-slate-100 dark:bg-slate-900/50">
              {renderBillContent(selectedOrder)}
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-[#374151]/40 flex justify-between gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-slate-300 dark:border-[#374151]/80 hover:bg-slate-100 dark:hover:bg-[#374151]/30 text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  disabled={downloading}
                  className="px-4 py-2 bg-[#FF6B35]/15 hover:bg-[#FF6B35]/25 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#FF6B35]/15 transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printer Media Print Wrapper */}
      {printType && selectedOrder && (
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #print-bill-container, #print-bill-container * {
              visibility: visible !important;
            }
            #print-bill-container {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
          }
        `}</style>
      )}

      {printType && selectedOrder && (
        <div style={{ display: 'none' }} className="print-block">
          <style>{`
            @media print {
              .print-block {
                display: block !important;
              }
            }
          `}</style>
          {renderBillContent(selectedOrder, true)}
        </div>
      )}
    </div>
  );
};

export default BillsPage;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Star,
  Search,
  ChevronRight,
  Loader2,
  CheckCircle,
  Utensils,
  X,
  Receipt,
  QrCode,
  CreditCard,
  Smartphone,
  Check,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';


// ─── Types ────────────────────────────────────────────────────────────────────
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface Settings {
  currency: string;
  taxPercentage: number;
}

interface Category {
  id: string;
  name: string;
  displayOrder: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isFeatured: boolean;
  category: Category;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface PlacedOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  tableNumber: string;
  itemCount: number;
  createdAt: string;
}

// ─── Price Formatter ──────────────────────────────────────────────────────────
const fmt = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);

const BASE_URL = 'https://backend-steel-seven-97.vercel.app/api';

// ─── Component ────────────────────────────────────────────────────────────────
export const CustomerMenu: React.FC = () => {
  const { slug, tableNumber } = useParams<{ slug: string; tableNumber: string }>();

  // Data state
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<Settings>({ currency: 'INR', taxPercentage: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutConfirming, setIsCheckoutConfirming] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('ONLINE');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'CARD' | 'UPI' | null>(null);
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Live tracking state
  const [trackingOrder, setTrackingOrder] = useState<any>(null);



  // Fetch menu data
  useEffect(() => {
    if (!slug) return;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/public/${slug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Restaurant not found');
          return;
        }
        setRestaurant(data.restaurant);
        setSettings(data.settings);
        setCategories(data.categories);
        setMenuItems(data.menuItems);
      } catch (err: any) {
        setError('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  // Cart helpers
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl },
      ];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  }, []);

  const deleteFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }, []);

  const getQuantityInCart = (menuItemId: string) =>
    cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0;

  // Totals
  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const taxAmount = parseFloat(((subtotal * settings.taxPercentage) / 100).toFixed(2));
  const totalAmount = subtotal + taxAmount;
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Filtered items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredItems = menuItems.filter((item) => item.isFeatured).slice(0, 6);

  // Polling order status
  useEffect(() => {
    if (!placedOrder || !slug) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/${slug}/orders/${placedOrder.id}/status`);
        if (res.ok) {
          const data = await res.json();
          setTrackingOrder(data.order);
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [placedOrder, slug]);

  // Place order
  const handlePlaceOrder = async () => {
    if (!slug || !tableNumber || cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: decodeURIComponent(tableNumber),
          items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setPlacedOrder(data.order);
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutConfirming(false);

      if (paymentMethod === 'ONLINE') {
        // Open Razorpay simulated checkout modal
        setIsPaymentModalOpen(true);
      } else {
        toast.success('Order placed! Pay at counter after your meal.', { duration: 3000 });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Submit simulated payment to backend
  const handleMockPaymentSubmit = async (method: 'UPI' | 'CARD') => {
    if (!placedOrder || !slug) return;
    setPaymentProcessing(true);
    
    // Simulate Razorpay Gateway processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/orders/${placedOrder.id}/pay-mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment verification failed');
      
      setPaymentSuccess(true);
      toast.success('Payment Received! Chef is starting your order.', { duration: 3000 });
      
      // Update tracking order local state
      setTrackingOrder((prev: any) => prev ? { ...prev, paymentStatus: 'SUCCESS', paymentMethod: method } : null);
      
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setPaymentSuccess(false);
        setPaymentProcessing(false);
        setPaymentOption(null);
        setUpiApp(null);
        setUpiId('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed.');
      setPaymentProcessing(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin" />
          <p className="text-white font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found ─────────────────────────────────────────────────────
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6">
        <div className="text-center">
          <QrCode className="w-16 h-16 text-[#374151] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Restaurant Not Found</h2>
          <p className="text-[#9ca3af]">{error || 'This QR code may be invalid or the restaurant is unavailable.'}</p>
        </div>
      </div>
    );
  }

  // ─── Order Success / Live Tracking Screen ──────────────────────────────────
  if (placedOrder) {
    const currentStatus = trackingOrder?.status ?? placedOrder.status;
    const isPaid = (trackingOrder?.paymentStatus ?? 'PENDING') === 'SUCCESS';
    
    // Status helpers
    const getStatusStep = (status: string) => {
      switch (status) {
        case 'NEW': return 0;
        case 'PREPARING': return 1;
        case 'READY': return 2;
        case 'SERVED': return 3;
        default: return 0;
      }
    };

    const stepIndex = getStatusStep(currentStatus);
    const steps = [
      { label: 'Placed', desc: 'Order received by kitchen' },
      { label: 'Preparing', desc: 'Chef is cooking your food' },
      { label: 'Ready', desc: 'Ready for table service' },
      { label: 'Served', desc: 'Served hot at your table' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] flex flex-col justify-between p-4 pb-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pt-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#FF6B35]" />
              Qrunto Order Track
            </h2>
            <div className="bg-[#1f2937] border border-[#374151]/50 rounded-full px-3 py-1 text-xs text-[#9ca3af] font-semibold">
              Table {placedOrder.tableNumber}
            </div>
          </div>

          {/* Stepper Card */}
          <div className="bg-[#1f2937]/50 border border-[#374151]/40 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Status animation background */}
            {currentStatus === 'PREPARING' && (
              <div className="absolute top-2 right-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Cooking Active
              </div>
            )}
            {currentStatus === 'READY' && (
              <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3 h-3" />
                Ready to Serve!
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-[#9ca3af] text-xs font-semibold uppercase tracking-wider">Order Status</h3>
              <p className="text-2xl font-black text-white mt-1">
                {currentStatus === 'NEW' && 'Placed & Confirmed 🧾'}
                {currentStatus === 'PREPARING' && 'Chef is Cooking 🍳'}
                {currentStatus === 'READY' && 'Food is Ready! 🍽️'}
                {currentStatus === 'SERVED' && 'Order Served! 🎉'}
                {currentStatus === 'CANCELLED' && 'Order Cancelled ❌'}
              </p>
              <p className="text-[#9ca3af] text-xs mt-2">
                Order No: <span className="text-[#FF6B35] font-bold">{placedOrder.orderNumber}</span>
              </p>
            </div>

            {/* Step Stepper UI */}
            {currentStatus !== 'CANCELLED' && (
              <div className="relative pl-6 space-y-6 border-l-2 border-[#374151]">
                {steps.map((step, idx) => {
                  const isActive = idx === stepIndex;
                  const isCompleted = idx < stepIndex;
                  return (
                    <div key={idx} className="relative flex flex-col items-start gap-1">
                      {/* Stepper Dot */}
                      <div className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#FF6B35] border-[#FF6B35] scale-125 shadow-lg shadow-[#FF6B35]/40'
                          : isCompleted
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'bg-[#111827] border-[#374151]'
                      }`}>
                        {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                      </div>

                      <span className={`text-sm font-bold transition-all ${
                        isActive ? 'text-[#FF6B35]' : isCompleted ? 'text-emerald-400' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-[#9ca3af]">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentStatus === 'CANCELLED' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-center text-red-400">
                <ShieldAlert className="w-8 h-8 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Order Cancelled by Restaurant</p>
                  <p className="text-xs text-red-400/80">Please check with the service staff at the counter.</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status Card */}
          <div className="bg-[#1f2937]/50 border border-[#374151]/40 rounded-3xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#9ca3af] font-semibold">Bill Payment</p>
                <p className="font-extrabold text-white text-base mt-0.5">
                  {fmt(placedOrder.totalAmount, settings.currency)}
                </p>
              </div>
              <div>
                {isPaid ? (
                  <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                    Paid Online ✅
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="bg-amber-500/15 border border-amber-500/20 text-amber-400 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                      Pay Cash at Counter 💵
                    </span>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="text-[#FF6B35] font-bold text-xs hover:underline flex items-center gap-1"
                    >
                      Pay Online Now (Razorpay) ➡️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-[#1f2937]/30 border border-[#374151]/30 rounded-3xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Order Details</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {trackingOrder?.items ? (
                trackingOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-[#9ca3af]">
                      {item.name} <strong className="text-white">× {item.quantity}</strong>
                    </span>
                    <span className="text-white font-semibold">{fmt(item.totalPrice, settings.currency)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9ca3af]">{placedOrder.itemCount} Items</span>
                  <span className="text-white font-semibold">{fmt(placedOrder.totalAmount, settings.currency)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-[#374151]/40 mt-4 pt-3 flex justify-between text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-[#FF6B35]">{fmt(placedOrder.totalAmount, settings.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="max-w-md mx-auto w-full px-4 mt-6">
          <button
            onClick={() => setPlacedOrder(null)}
            className="w-full py-4 bg-[#374151] hover:bg-[#4b5563] text-white font-bold rounded-2xl transition-all text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4 text-[#FF6B35]" />
            Browse Menu / Add More Items
          </button>
        </div>

        {/* Floating Razorpay Simulation Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !paymentProcessing && setIsPaymentModalOpen(false)} />
            
            <div className="relative w-full max-w-sm bg-[#0f172a] rounded-[24px] border border-[#334155]/60 overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left">
              {/* Top Razorpay Banner */}
              <div className="bg-[#1e293b] p-4 flex items-center justify-between border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#3399FF] rounded flex items-center justify-center font-bold text-white text-xs">R</div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Razorpay Secure</h5>
                    <p className="text-[10px] text-gray-400">Qrunto Payments · Order ID: {placedOrder.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Amount to Pay</p>
                  <p className="text-sm font-black text-[#3399FF]">{fmt(placedOrder.totalAmount, settings.currency)}</p>
                </div>
              </div>

              {/* Payment Processing Screen */}
              {paymentProcessing ? (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                  {paymentSuccess ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                        <Check className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                      <p className="text-xs text-gray-400">Merchant is processing your order.</p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-12 h-12 text-[#3399FF] animate-spin" />
                      <h4 className="text-sm font-bold text-white">Securing Payment...</h4>
                      <p className="text-xs text-gray-400">Simulating bank gateway communication.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider text-center border-b border-[#334155] pb-2">Select Payment Method (Demo Mode)</h4>
                  
                  {paymentOption === null ? (
                    <div className="space-y-3">
                      {/* UPI Option */}
                      <button
                        onClick={() => setPaymentOption('UPI')}
                        className="w-full p-4 bg-[#1e293b] hover:bg-[#334155]/60 border border-[#334155] rounded-xl flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-[#3399FF]" />
                          <div>
                            <p className="font-bold text-sm text-white">Pay via UPI / QR</p>
                            <p className="text-xs text-gray-400">GPay, PhonePe, Paytm, BHIM</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>

                      {/* Card Option */}
                      <button
                        onClick={() => setPaymentOption('CARD')}
                        className="w-full p-4 bg-[#1e293b] hover:bg-[#334155]/60 border border-[#334155] rounded-xl flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-[#3399FF]" />
                          <div>
                            <p className="font-bold text-sm text-white">Pay via Card</p>
                            <p className="text-xs text-gray-400">Visa, Mastercard, RuPay, Maestro</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ) : paymentOption === 'UPI' ? (
                    <div className="space-y-4">
                      <button onClick={() => setPaymentOption(null)} className="text-[#3399FF] text-xs hover:underline flex items-center gap-1 font-semibold">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to methods
                      </button>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                          <button
                            key={app}
                            onClick={() => setUpiApp(app)}
                            className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                              upiApp === app
                                ? 'bg-[#3399FF]/15 border-[#3399FF] text-white'
                                : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:bg-[#334155]/60'
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Or Enter UPI ID</label>
                        <input
                          type="text"
                          placeholder="username@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]"
                        />
                      </div>

                      <button
                        onClick={() => handleMockPaymentSubmit('UPI')}
                        disabled={!upiApp && !upiId}
                        className="w-full py-3 bg-[#3399FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm mt-2"
                      >
                        Pay Demo {fmt(placedOrder.totalAmount, settings.currency)}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={() => setPaymentOption(null)} className="text-[#3399FF] text-xs hover:underline flex items-center gap-1 font-semibold">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to methods
                      </button>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase">Card Number</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleMockPaymentSubmit('CARD')}
                        disabled={cardNumber.length < 15}
                        className="w-full py-3 bg-[#3399FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm mt-2"
                      >
                        Pay Demo {fmt(placedOrder.totalAmount, settings.currency)}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }


  // ─── Main Menu ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111827] text-white pb-32">

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-[#1f2937] to-[#111827] border-b border-[#374151]/30 px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#FF6B35] to-orange-400 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-[#FF6B35]/20 shrink-0">
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{restaurant.name}</h1>
              <p className="text-sm text-[#9ca3af] mt-0.5 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Table {decodeURIComponent(tableNumber ?? '')}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151]/50 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35]/40 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* Featured Items */}
        {featuredItems.length > 0 && !searchQuery && activeCategory === 'all' && (
          <section>
            <h2 className="text-sm font-bold text-[#FF6B35] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Chef's Picks
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 w-44 bg-[#1f2937]/60 border border-[#374151]/40 rounded-[16px] overflow-hidden"
                >
                  <div className="h-28 bg-[#374151]/30 overflow-hidden">
                    {item.imageUrl && !failedImages[item.id] ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-[#374151]" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-white text-xs leading-tight line-clamp-1">{item.name}</p>
                    <p className="text-[#FF6B35] font-bold text-sm mt-1">{fmt(item.price, settings.currency)}</p>
                    <button
                      onClick={() => { addToCart(item); toast.success(`${item.name} added!`, { duration: 1200 }); }}
                      className="w-full mt-2 py-1.5 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                  : 'bg-[#1f2937]/40 text-[#9ca3af] border-[#374151]/40 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-[#1f2937]/40 text-[#9ca3af] border-[#374151]/40 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items List */}
        <section>
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <Utensils className="w-12 h-12 text-[#374151] mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No items found</p>
              <p className="text-gray-600 text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const qty = getQuantityInCart(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-[#1f2937]/40 border border-[#374151]/35 rounded-[16px] p-4 flex gap-4 transition-all hover:border-[#FF6B35]/20"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-[#374151]/40 overflow-hidden shrink-0">
                      {item.imageUrl && !failedImages[item.id] ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-7 h-7 text-[#374151]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
                            {item.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                          )}
                          <p className="text-[#FF6B35] font-extrabold text-sm mt-2">{fmt(item.price, settings.currency)}</p>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="mt-3 flex justify-end">
                        {qty === 0 ? (
                          <button
                            onClick={() => { addToCart(item); toast.success(`${item.name} added to cart!`, { duration: 1200 }); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B35] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl px-2 py-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 flex items-center justify-center bg-[#FF6B35]/20 hover:bg-[#FF6B35]/40 rounded-lg text-[#FF6B35] transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-extrabold text-white text-sm w-6 text-center">{qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-7 h-7 flex items-center justify-center bg-[#FF6B35] hover:bg-orange-600 rounded-lg text-white transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ─── Floating Cart Button ───────────────────────────────────────────── */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl py-4 px-6 flex items-center justify-between shadow-xl shadow-[#FF6B35]/30 transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-sm font-extrabold">{totalItems}</span>
              </div>
              <span className="text-sm">View Cart</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold">{fmt(totalAmount, settings.currency)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* ─── Cart Drawer ────────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Overlay */}
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Sheet */}
          <div className="relative bg-[#1f2937] border-t border-[#374151]/50 rounded-t-[28px] max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#374151] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#374151]/30">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#FF6B35]" />
                Your Cart
                <span className="text-[#9ca3af] text-sm font-normal">({totalItems} items)</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 bg-[#374151]/50 rounded-xl text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 bg-[#111827]/40 border border-[#374151]/30 rounded-2xl p-3">
                  <div className="w-12 h-12 rounded-xl bg-[#374151]/50 overflow-hidden shrink-0">
                    {item.imageUrl && !failedImages[item.menuItemId] ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages((prev) => ({ ...prev, [item.menuItemId]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-[#374151]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                    <p className="text-[#FF6B35] font-bold text-xs mt-0.5">{fmt(item.price, settings.currency)} × {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-[#374151]/50 rounded-xl p-1">
                      <button onClick={() => removeFromCart(item.menuItemId)} className="w-6 h-6 flex items-center justify-center bg-[#374151] rounded-lg text-white hover:bg-[#4b5563] transition-all">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white font-bold text-sm w-5 text-center">{item.quantity}</span>
                      <button onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, imageUrl: item.imageUrl, categoryId: '', description: null, isFeatured: false, category: { id: '', name: '', displayOrder: 0 } })} className="w-6 h-6 flex items-center justify-center bg-[#FF6B35] rounded-lg text-white hover:bg-orange-600 transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => deleteFromCart(item.menuItemId)} className="p-1.5 text-red-400 hover:text-red-300 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="px-5 pb-3 pt-2 border-t border-[#374151]/30">
              <div className="bg-[#111827]/50 border border-[#374151]/30 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Subtotal</span>
                  <span className="text-white font-semibold">{fmt(subtotal, settings.currency)}</span>
                </div>
                {settings.taxPercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9ca3af]">Tax ({settings.taxPercentage}%)</span>
                    <span className="text-white font-semibold">{fmt(taxAmount, settings.currency)}</span>
                  </div>
                )}
                <div className="border-t border-[#374151]/40 pt-2 flex justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-extrabold text-[#FF6B35] text-lg">{fmt(totalAmount, settings.currency)}</span>
                </div>
              </div>

              {/* Checkout confirm */}
              {isCheckoutConfirming ? (
                <div className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="bg-[#111827]/40 border border-[#374151]/30 rounded-xl p-3 space-y-2.5">
                    <p className="text-xs text-[#9ca3af] font-semibold">Select Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('ONLINE')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'ONLINE'
                            ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-white'
                            : 'bg-[#111827] border-[#374151] text-gray-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#FF6B35]" />
                        Pay Online (Demo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          paymentMethod === 'CASH'
                            ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-white'
                            : 'bg-[#111827] border-[#374151] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#FF6B35]" />
                        Pay at Counter
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    Confirm order for <strong className="text-white">Table {decodeURIComponent(tableNumber ?? '')}</strong>?
                  </p>

                  <div className="flex gap-3">
                    <button onClick={() => setIsCheckoutConfirming(false)} className="flex-1 py-3 bg-[#374151] hover:bg-[#4b5563] text-white font-semibold rounded-xl transition-all text-sm">
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                    >
                      {isPlacingOrder ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Placing...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" />Place Order!</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCheckoutConfirming(true)}
                  className="w-full py-4 bg-[#FF6B35] hover:bg-orange-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B35]/20"
                >
                  <Receipt className="w-5 h-5" />
                  Checkout · {fmt(totalAmount, settings.currency)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;

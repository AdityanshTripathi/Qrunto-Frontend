import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import {
  ShoppingCart, Plus, Minus, Trash2, Star, Search, ChevronRight,
  Loader2, CheckCircle, Utensils, X, Receipt, QrCode, CreditCard,
  Smartphone, Check, ArrowLeft, ShieldAlert, Bell, Sun, Moon, Flame,
  MapPin, ChevronLeft, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import bannerLight from '../assets/banner_light.jpg';
import bannerDark from '../assets/banner_dark.jpg';
import menuIcon from '../assets/menu_icon.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Restaurant { id: string; name: string; slug: string; logoUrl: string | null; }
interface Settings { currency: string; taxPercentage: number; }
interface Category { id: string; name: string; displayOrder: number; }
interface MenuItem {
  id: string; categoryId: string; name: string; description: string | null;
  price: number; imageUrl: string | null; isFeatured: boolean; isCompleteYourMeal?: boolean; category: Category;
  foodType: 'veg' | 'nonveg';
}
interface CartItem {
  menuItemId: string; name: string; price: number; quantity: number; imageUrl: string | null;
}

// ─── FSSAI Icons ──────────────────────────────────────────────────────────────
const VegIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="0.5" y="0.5" width="13" height="13" rx="1" stroke="#0f834a" strokeWidth="1" />
    <circle cx="7" cy="7" r="3" fill="#0f834a" />
  </svg>
);

const NonVegIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="0.5" y="0.5" width="13" height="13" rx="1" stroke="#e43b1e" strokeWidth="1" />
    <polygon points="7,3.5 3.5,10.5 10.5,10.5" fill="#e43b1e" />
  </svg>
);
interface PlacedOrder {
  id: string; orderNumber: string; status: string; subtotal: number;
  taxAmount: number; totalAmount: number; tableNumber: string; itemCount: number; createdAt: string;
  customerName?: string | null; customerPhone?: string | null;
}

const fmt = (amount: number, _currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

const BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://backend-steel-seven-97.vercel.app/api');

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name: string, value: string, hours: number) => {
  let expires = "";
  if (hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const deleteCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// ─── Component ────────────────────────────────────────────────────────────────
export const CustomerMenu: React.FC = () => {
  const { slug, tableNumber } = useParams<{ slug: string; tableNumber: string }>();

  // Data
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [settings, setSettings] = useState<Settings>({ currency: 'INR', taxPercentage: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutConfirming, setIsCheckoutConfirming] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [activeCookieOrder, setActiveCookieOrder] = useState<PlacedOrder | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);
  const [sendingAssistance, setSendingAssistance] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isSettleBillRequested, setIsSettleBillRequested] = useState(false);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<string>('default');
  const [filterVeg, setFilterVeg] = useState<boolean>(false);
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState<boolean>(false);

  // Carousel
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod] = useState<'ONLINE' | 'COUNTER' | 'WAITER'>('WAITER');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'CARD' | 'UPI' | null>(null);
  const [upiApp, setUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [trackingOrder, setTrackingOrder] = useState<any>(null);

  // Theme CSS vars
  const t = {
    bg: isDark ? 'bg-[#121212]' : 'bg-[#FFF8F0]',
    card: isDark ? 'bg-[#1e1e1e]' : 'bg-[#F5EDE4]',
    cardBorder: isDark ? 'border-[#2a2a2a]' : 'border-[#D97757]/20',
    text: isDark ? 'text-white' : 'text-[#2C2C2C]',
    subtext: isDark ? 'text-[#9ca3af]' : 'text-[#5C4033]',
    input: isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder-[#555]' : 'bg-[#FAF3EB] border-[#D97757]/20 text-[#2C2C2C] placeholder-[#5C4033]/50',
    chip: isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#9ca3af]' : 'bg-[#FAF3EB] border-[#D97757]/20 text-[#2C2C2C]/80',
    chipActive: 'bg-[#D97757] border-[#D97757] text-white',
    header: isDark ? 'bg-[#1e1e1e]' : 'bg-[#FFF8F0]',
    divider: isDark ? 'border-[#2a2a2a]' : 'border-[#D97757]/10',
    imgBg: isDark ? 'bg-[#2a2a2a]' : 'bg-[#FAF3EB]',
    sheetBg: isDark ? 'bg-[#1e1e1e]' : 'bg-[#FAF3EB]',
    qtyBg: isDark ? 'bg-[#2a2a2a]' : 'bg-[#FAF3EB]',
  };

  const handleRequestAssistance = async (type: 'WAITER' | 'BILL') => {
    setSendingAssistance(true);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/tables/${tableNumber}/assistance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assistance request failed');
      toast.success(data.message);
      setIsAssistanceOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send assistance request');
    } finally {
      setSendingAssistance(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/public/${slug}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Restaurant not found'); return; }
        setRestaurant(data.restaurant);
        setSettings(data.settings);
        setCategories(data.categories);
        setMenuItems(data.menuItems);

        // Check for active order cookie
        const savedOrderCookie = getCookie(`ordio_active_order_${slug}`);
        if (savedOrderCookie) {
          try {
            const parsedOrder = JSON.parse(savedOrderCookie);
            if (parsedOrder && parsedOrder.id) {
              const statusRes = await fetch(`${BASE_URL}/public/${slug}/orders/${parsedOrder.id}/status`);
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                const currentStatus = statusData.order?.status;
                const isOrderPaid = statusData.order?.paymentStatus === 'SUCCESS';
                if (currentStatus && !isOrderPaid && currentStatus !== 'CANCELLED') {
                  setPlacedOrder(parsedOrder);
                  setTrackingOrder(statusData.order);
                  setActiveCookieOrder(parsedOrder);
                } else {
                  deleteCookie(`ordio_active_order_${slug}`);
                }
              } else {
                deleteCookie(`ordio_active_order_${slug}`);
              }
            }
          } catch (e) {
            console.error('Failed to parse active order cookie', e);
          }
        }
      } catch { setError('Failed to load menu. Please try again.'); }
      finally { setLoading(false); }
    };
    fetchMenu();
  }, [slug]);

  const addToCart = useCallback((item: Pick<MenuItem, 'id' | 'name' | 'price' | 'imageUrl'>) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) return prev.map((c) => c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  }, []);

  const deleteFromCart = useCallback((menuItemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));
  }, []);

  const getQty = (menuItemId: string) => cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0;

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const taxAmount = parseFloat(((subtotal * settings.taxPercentage) / 100).toFixed(2));
  const totalAmount = subtotal + taxAmount;
  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  // Veg classification field check
  const isItemVeg = (item: MenuItem) => {
    return item.foodType === 'veg';
  };

  const filteredItems = menuItems
    .filter((item) => {
      const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
      const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !filterVeg || isItemVeg(item);
      return matchesCat && matchesSearch && matchesVeg;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // default (server/original ordering)
    });

  const featuredItems = menuItems
    .filter((i) => i.isFeatured && (!filterVeg || isItemVeg(i)))
    .slice(0, 8);

  const recommendedItems = menuItems
    .filter((item) => item.isCompleteYourMeal !== false && !cart.some((c) => c.menuItemId === item.id))
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    .slice(0, 10);


  // Auto-slide effect for Carousel
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    if (activeSlideIndex >= featuredItems.length) {
      setActiveSlideIndex(0);
    }
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % featuredItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredItems.length, activeSlideIndex]);

  useEffect(() => {
    if (!placedOrder || !slug) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/${slug}/orders/${placedOrder.id}/status`);
        if (res.ok) {
          const data = await res.json();
          setTrackingOrder(data.order);
          const currentStatus = data.order?.status;
          const isOrderPaid = data.order?.paymentStatus === 'SUCCESS';
          if (isOrderPaid || currentStatus === 'CANCELLED') {
            deleteCookie(`ordio_active_order_${slug}`);
            setActiveCookieOrder(null);
          }
        }
      } catch { /* silent */ }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [placedOrder, slug]);

  // Poll status for active cookie order when not actively tracking on screen
  useEffect(() => {
    if (placedOrder || !activeCookieOrder || !slug) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/${slug}/orders/${activeCookieOrder.id}/status`);
        if (res.ok) {
          const data = await res.json();
          const currentStatus = data.order?.status;
          const isOrderPaid = data.order?.paymentStatus === 'SUCCESS';
          if (isOrderPaid || currentStatus === 'CANCELLED') {
            deleteCookie(`ordio_active_order_${slug}`);
            setActiveCookieOrder(null);
          } else {
            setActiveCookieOrder(data.order);
          }
        } else {
          deleteCookie(`ordio_active_order_${slug}`);
          setActiveCookieOrder(null);
        }
      } catch { /* silent */ }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [placedOrder, activeCookieOrder, slug]);

  const handlePlaceOrder = async () => {
    if (!slug || !tableNumber || cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: decodeURIComponent(tableNumber),
          items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          existingOrderId: activeCookieOrder?.id || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      setPlacedOrder(data.order);
      setActiveCookieOrder(data.order);
      setCookie(`ordio_active_order_${slug}`, JSON.stringify(data.order), 24);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setIsCartOpen(false);
      setIsCheckoutConfirming(false);
      setIsSettleBillRequested(false);
      localStorage.setItem(`ordio_payment_method_${data.order.id}`, paymentMethod);
      
      // Fetch updated status immediately so items and totals update instantly
      const statusRes = await fetch(`${BASE_URL}/public/${slug}/orders/${data.order.id}/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTrackingOrder(statusData.order);
      }

      toast.success(activeCookieOrder ? 'Items added to order!' : 'Order placed successfully!', { duration: 3000 });
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally { setIsPlacingOrder(false); }
  };

  const handleMockPaymentSubmit = async (method: 'UPI' | 'CARD') => {
    if (!placedOrder || !slug) return;
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const res = await fetch(`${BASE_URL}/public/${slug}/orders/${placedOrder.id}/pay-mock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      setPaymentSuccess(true);
      setIsSettleBillRequested(false);
      toast.success('Payment Received! Chef is starting your order.', { duration: 3000 });
      setTrackingOrder((prev: any) => prev ? { ...prev, paymentStatus: 'SUCCESS', paymentMethod: method } : null);
      setTimeout(() => {
        setIsPaymentModalOpen(false); setPaymentSuccess(false); setPaymentProcessing(false);
        setPaymentOption(null); setUpiApp(null); setUpiId(''); setCardNumber(''); setCardExpiry(''); setCardCvv('');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed.');
      setPaymentProcessing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const element = document.getElementById('print-modal-container');
    if (!element) {
      toast.error('Invoice content not found');
      return;
    }
    setIsDownloadingInvoice(true);
    const toastId = toast.loading('Generating PDF invoice...');
    try {
      // Temporarily set styling for best quality canvas capture
      const originalStyle = element.style.cssText;
      
      // Ensure the background is white and text is dark during PDF capture (in case customer is on Dark Mode)
      element.style.background = '#ffffff';
      element.style.color = '#111827';
      element.style.padding = '24px';
      
      // Select all text elements inside and enforce dark colors for high contrast print/pdf
      const textElements = element.querySelectorAll('span, p, h2, td, th');
      const originalColors: string[] = [];
      textElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalColors[index] = htmlEl.style.color;
        // Don't change orange colored highlight totals and text inside elements with keep-color class
        if (!htmlEl.className.includes('text-[#D97757]') && !htmlEl.closest('.keep-color')) {
          htmlEl.style.setProperty('color', '#1f2937', 'important');
        }
      });

      const canvas = await html2canvas(element, {
        scale: 2, // higher scale for crisp high-res text
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Restore original styling
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

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center vertical position if it fits on one page, otherwise page breaking logic
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

      pdf.save(`invoice-${(placedOrder?.orderNumber ?? 'order').replace('ORD-', 'INV-')}.pdf`);
      toast.success('Invoice downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Failed to generate invoice PDF', err);
      toast.error('Failed to download invoice. Please try again.', { id: toastId });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#121212]' : 'bg-[#FFF8F0]'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D97757] flex items-center justify-center animate-pulse">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#D97757]'}`}>Loading menu...</p>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-[#D97757] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#121212]' : 'bg-[#FFF8F0]'} flex items-center justify-center p-6`}>
        <div className="text-center">
          <QrCode className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-[#374151]' : 'text-[#d1d5db]'}`} />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#D97757]'}`}>Restaurant Not Found</h2>
          <p className={isDark ? 'text-[#9ca3af]' : 'text-[#5C4033]'}>{error || 'This QR code may be invalid or the restaurant is unavailable.'}</p>
        </div>
      </div>
    );
  }

  // ─── Order Tracking Screen ─────────────────────────────────────────────────
  if (placedOrder) {
    const currentStatus = trackingOrder?.status ?? placedOrder.status;
    const isPaid = (trackingOrder?.paymentStatus ?? 'PENDING') === 'SUCCESS';
    const paymentPref = localStorage.getItem(`ordio_payment_method_${placedOrder.id}`) || 'WAITER';
    const getStep = (s: string) => ({ 'NEW': 0, 'PREPARING': 1, 'READY': 2, 'SERVED': 3 }[s] ?? 0);
    const stepIndex = getStep(currentStatus);
    const steps = [
      { label: 'Order Placed', icon: '🧾', desc: 'Restaurant confirmed your order' },
      { label: 'Cooking', icon: '👨‍🍳', desc: 'Chef is preparing your food' },
      { label: 'Ready', icon: '🍽️', desc: 'Your food is ready to serve' },
      { label: 'Served', icon: '🎉', desc: 'Enjoy your meal!' },
    ];

    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#121212]' : 'bg-[#FFF8F0]'} pb-8`}>
        {/* Top Bar */}
        <div className={`${t.header} sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b ${t.divider}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D97757] rounded-xl flex items-center justify-center font-black text-white text-sm">
              {restaurant.name.charAt(0)}
            </div>
            <div>
              <p className={`text-xs font-bold ${t.text}`}>{restaurant.name}</p>
              <p className={`text-[10px] ${t.subtext} flex items-center gap-1`}>
                <MapPin className="w-2.5 h-2.5" /> Table {placedOrder.tableNumber}
              </p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${t.chip}`}>
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6b7280]" />}
          </button>
        </div>

        <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
          {/* Status Hero */}
          <div className={`${t.card} rounded-3xl overflow-hidden border ${t.cardBorder} shadow-sm`}>
            <div className={`${currentStatus === 'SERVED' ? 'bg-[#2E7D32]' : currentStatus === 'READY' ? 'bg-blue-500' : currentStatus === 'PREPARING' ? 'bg-[#2E7D32]/70' : 'bg-[#D97757]'} p-6 text-white text-center`}>
              <div className="text-4xl mb-2">
                {currentStatus === 'NEW' && '🧾'}
                {currentStatus === 'PREPARING' && '🍳'}
                {currentStatus === 'READY' && '🍽️'}
                {currentStatus === 'SERVED' && '🎉'}
                {currentStatus === 'CANCELLED' && '❌'}
              </div>
              <h2 className="text-xl font-black">
                {currentStatus === 'NEW' && 'Order Confirmed!'}
                {currentStatus === 'PREPARING' && 'Cooking in Progress...'}
                {currentStatus === 'READY' && 'Ready to Serve!'}
                {currentStatus === 'SERVED' && 'Enjoy Your Meal!'}
                {currentStatus === 'CANCELLED' && 'Order Cancelled'}
              </h2>
              <p className="text-white/80 text-sm mt-1">Order #{placedOrder.orderNumber}</p>
              {currentStatus === 'PREPARING' && (
                <div className="flex items-center justify-center gap-2 mt-3 bg-white/20 rounded-full px-4 py-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span className="text-xs font-semibold">Live tracking active</span>
                </div>
              )}
            </div>

            {/* Stepper */}
            {currentStatus !== 'CANCELLED' && (
              <div className="p-5">
                <div className="relative">
                  {/* Progress line */}
                  <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#f0f0f0]'}`} />
                  <div
                    className="absolute left-4 top-4 w-0.5 bg-[#D97757] transition-all duration-700"
                    style={{ height: `${(stepIndex / (steps.length - 1)) * 100}%` }}
                  />
                  <div className="space-y-6 relative">
                    {steps.map((step, idx) => {
                      const isActive = idx === stepIndex;
                      const isDone = idx < stepIndex;
                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all text-sm z-10 ${
                            isActive ? 'bg-[#D97757] border-[#D97757] scale-110 shadow-lg shadow-[#D97757]/30'
                            : isDone ? 'bg-emerald-500 border-emerald-500'
                            : `${isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-[#FFF8F0] border-[#D97757]/35'}`
                          }`}>
                            {isDone ? <Check className="w-4 h-4 text-white" /> : <span>{step.icon}</span>}
                          </div>
                          <div className="pt-1">
                            <p className={`text-sm font-bold ${isActive ? 'text-[#D97757]' : isDone ? 'text-emerald-500' : t.subtext}`}>{step.label}</p>
                            <p className={`text-xs mt-0.5 ${t.subtext}`}>{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentStatus === 'CANCELLED' && (
              <div className="p-5">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-center text-red-600">
                  <ShieldAlert className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Order Cancelled by Restaurant</p>
                    <p className="text-xs mt-0.5 text-red-400">Please check with the service staff.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary Card */}
          <div className={`${t.card} rounded-3xl border ${t.cardBorder} p-5 shadow-sm`}>
            <h4 className={`font-bold text-sm mb-3 ${t.text}`}>Bill Summary</h4>
            <div className="space-y-2 mb-3">
              {trackingOrder?.items?.map((item: any) => (
                <div key={item.id} className={`flex justify-between text-xs ${t.subtext}`}>
                  <span>{item.name} <strong className={t.text}>× {item.quantity}</strong></span>
                  <span className={t.text}>{fmt(item.totalPrice, settings.currency)}</span>
                </div>
              )) ?? (
                <div className={`flex justify-between text-xs ${t.subtext}`}>
                  <span>{placedOrder.itemCount} items</span>
                  <span className={t.text}>{fmt(placedOrder.totalAmount, settings.currency)}</span>
                </div>
              )}
            </div>
            <div className={`border-t ${t.divider} pt-3 flex justify-between items-center`}>
              <span className={`font-bold text-sm ${t.text}`}>Total</span>
              <span className="font-black text-[#D97757] text-lg">{fmt(placedOrder.totalAmount, settings.currency)}</span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className={`text-xs ${t.subtext}`}>Payment Preference</span>
              <span className="text-xs font-bold text-[#2C2C2C] dark:text-[#9ca3af]">
                {paymentPref === 'ONLINE' ? '💳 Pay Online' : paymentPref === 'COUNTER' ? '🏦 Pay at Counter' : '🙋 Pay via Waiter'}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-2 pt-3 border-t border-dashed border-[#D97757]/20">
              {isPaid ? (
                <span className="text-xs font-bold text-[#2E7D32] bg-[#2E7D32]/10 border border-[#2E7D32]/30 px-3 py-2 rounded-full text-center">
                  ✅ Bill Paid Successfully
                </span>
              ) : currentStatus === 'SERVED' ? (
                !isSettleBillRequested ? (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        handleRequestAssistance('BILL');
                        setIsSettleBillRequested(true);
                      }} 
                      disabled={sendingAssistance}
                      className="w-full py-3 bg-[#2E7D32] hover:bg-[#235F26] text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 disabled:opacity-50"
                    >
                      {sendingAssistance ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                      Request Bill Settlement
                    </button>
                    <span className={`text-[10px] ${t.subtext} italic text-center block`}>
                      Click to notify the waiter/counter to bring your bill.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex gap-2 items-center text-emerald-600">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold">Bill settlement request sent to waiter.</span>
                    </div>
                    <button 
                      onClick={() => handleRequestAssistance('BILL')}
                      disabled={sendingAssistance}
                      className={`w-full py-2.5 ${t.qtyBg} border ${t.cardBorder} ${t.text} font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50`}
                    >
                      {sendingAssistance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                      Send Reminder
                    </button>
                    <button 
                      onClick={() => setIsSettleBillRequested(false)} 
                      className={`w-full py-2 bg-transparent text-xs ${t.subtext} font-bold hover:underline`}
                    >
                      ← Back (Keep ordering)
                    </button>
                  </div>
                )
              ) : (
                <span className={`text-xs font-semibold ${t.subtext} italic text-center block py-1.5`}>
                  ⏳ You can pay your bill once the food is served!
                </span>
              )}
            </div>
          </div>

          {/* Invoice Summary Card */}
          {currentStatus === 'SERVED' && isPaid && (
            <div className={`${t.card} rounded-3xl border border-emerald-500/30 p-5 shadow-sm space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${t.text}`}>Invoice Available</h4>
                  <p className={`text-xs ${t.subtext}`}>Your order has been served. View and download your invoice.</p>
                </div>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="w-full py-3 bg-[#2E7D32] hover:bg-[#235F26] text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#2E7D32]/15"
              >
                <Receipt className="w-4 h-4" />
                View & Download Invoice
              </button>
            </div>
          )}

          {/* Add More */}
          <button
            onClick={() => { setPlacedOrder(null); setIsSettleBillRequested(false); }}
            className={`w-full py-4 ${t.card} border ${t.cardBorder} ${t.text} font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm`}
          >
            <Utensils className="w-4 h-4 text-[#D97757]" />
            Browse Menu / Add More Items
          </button>
        </div>

        {/* Invoice Modal */}
        {isInvoiceModalOpen && isPaid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm no-print" onClick={() => setIsInvoiceModalOpen(false)} />
            <div className={`relative w-full max-w-md ${t.header} rounded-3xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left border ${t.cardBorder} flex flex-col max-h-[90vh]`}>
              {/* Header */}
              <div className={`bg-[#FAF3EB] dark:bg-[#2a2a2a] px-6 py-4 flex items-center justify-between border-b ${t.divider} no-print`}>
                <span className={`font-black text-sm ${t.text} flex items-center gap-2`}>
                  <Receipt className="w-4 h-4 text-[#D97757]" />
                  Tax Invoice
                </span>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className={`p-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] dark:bg-[#121212] dark:hover:bg-[#2a2a2a] rounded-xl ${t.subtext} transition-all`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Area */}
              <div id="print-modal-container" className={`flex-1 overflow-y-auto p-4 sm:p-6 ${t.header} ${t.text} space-y-6`}>
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #print-modal-container, #print-modal-container * {
                      visibility: visible !important;
                    }
                    #print-modal-container {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 20px !important;
                      box-shadow: none !important;
                      border: none !important;
                      background: white !important;
                      color: black !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Premium Invoice Header */}
                <div className="keep-color bg-slate-800 text-white p-4 sm:p-5 rounded-t-2xl flex justify-between items-center -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4 sm:mb-6 shadow-sm">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">{restaurant.name}</h2>
                    <p className="text-[10px] text-slate-300 mt-0.5">Tax Invoice / Bill Statement</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{restaurant.slug}.ordio.in</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-black tracking-wider text-slate-100">INVOICE</h1>
                    <p className="text-[10px] text-slate-300 mt-0.5">Date: {new Date(trackingOrder?.createdAt ?? placedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* Structured Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-5">
                  <div>
                    <span className="block font-extrabold uppercase tracking-wider text-[9px] text-slate-400 mb-1">INVOICE TO:</span>
                    {trackingOrder?.customerName ? (
                      <>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{trackingOrder.customerName}</p>
                        {trackingOrder.customerPhone && <p className="text-slate-500 mt-0.5">{trackingOrder.customerPhone}</p>}
                      </>
                    ) : placedOrder.customerName ? (
                      <>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{placedOrder.customerName}</p>
                        {placedOrder.customerPhone && <p className="text-slate-500 mt-0.5">{placedOrder.customerPhone}</p>}
                      </>
                    ) : (
                      <p className="italic text-slate-500 text-sm">Walk-in Guest</p>
                    )}
                    <p className="text-slate-500 mt-2 text-[11px]">Table No: <strong className="text-slate-700 dark:text-slate-200">{trackingOrder?.tableNumber ?? placedOrder.tableNumber}</strong></p>
                  </div>
                  <div className="text-left sm:text-right flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                    <span className="block font-extrabold uppercase tracking-wider text-[9px] text-slate-400 mb-1 w-full text-left sm:text-right">DETAILS:</span>
                    <p className="font-black text-slate-800 dark:text-white text-sm">
                      Invoice No: <span className="text-[#D97757]">{(trackingOrder?.orderNumber ?? placedOrder.orderNumber ?? '').replace('ORD-', 'INV-')}</span>
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Invoice Date: {new Date(trackingOrder?.createdAt ?? placedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p className="text-slate-500 mt-1.5 text-[11px]">Order No: #{trackingOrder?.orderNumber ?? placedOrder.orderNumber}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2 pt-1">
                  <span className="block font-extrabold uppercase tracking-wider text-[9px] text-slate-400">PRODUCT DESCRIPTION</span>
                  <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="keep-color bg-slate-800 dark:bg-slate-900 text-white font-bold">
                          <th className="py-2 px-2.5 sm:py-2.5 sm:px-3">Item</th>
                          <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-center w-12">Qty</th>
                          <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-right w-20">Rate</th>
                          <th className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-right w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                        {trackingOrder?.items?.map((item: any, idx: number) => (
                          <tr key={item.id} className={`align-middle ${idx % 2 === 1 ? 'bg-slate-50 dark:bg-slate-800/10' : ''}`}>
                            <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 font-bold text-slate-800 dark:text-white">{item.name}</td>
                            <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                            <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-right text-slate-600 dark:text-slate-400">{fmt(item.unitPrice, settings.currency)}</td>
                            <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-right font-bold text-slate-800 dark:text-white">{fmt(item.totalPrice, settings.currency)}</td>
                          </tr>
                        )) ?? (
                          <tr>
                            <td className="py-2 px-2.5 sm:py-2.5 sm:px-3 text-slate-400 italic text-center" colSpan={4}>Loading item details...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end pt-2">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 px-1">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{fmt(trackingOrder?.subtotal ?? placedOrder.subtotal, settings.currency)}</span>
                    </div>
                    {settings.taxPercentage > 0 && (
                      <div className="space-y-1.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>CGST ({(settings.taxPercentage / 2).toFixed(2)}%)</span>
                          <span>{fmt((trackingOrder?.taxAmount ?? placedOrder.taxAmount) / 2, settings.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>SGST ({(settings.taxPercentage / 2).toFixed(2)}%)</span>
                          <span>{fmt((trackingOrder?.taxAmount ?? placedOrder.taxAmount) / 2, settings.currency)}</span>
                        </div>
                      </div>
                    )}
                    {/* Gold Highlighted Grand Total Box */}
                    <div className="keep-color bg-[#FFFAF0] dark:bg-[#2A1F1A] border border-[#F3E1D3] dark:border-[#523A28] rounded-xl p-3 flex justify-between items-center text-sm font-black text-[#D97757] shadow-sm">
                      <span className="uppercase tracking-wider text-[10px]">Grand Total</span>
                      <span className="text-base">{fmt(trackingOrder?.totalAmount ?? placedOrder.totalAmount, settings.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Footer */}
                <div className="border-t border-dashed border-[#D97757]/30 pt-4 text-center space-y-4">
                  <div className="inline-block bg-[#FAF3EB] dark:bg-[#2a2a2a] border border-[#D97757]/20 dark:border-[#2a2a2a] rounded-xl px-4 py-2">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Payment Status</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5 mt-0.5">
                      {isPaid ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                          Paid Online ({trackingOrder?.paymentMethod ?? 'MOCK'})
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F4A261] animate-pulse" />
                          Call Waiter to Collect Cash
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Thank you for dining with us!</p>
                    <p className="text-[10px] text-slate-400">Please visit again. Powered by Ordio.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`bg-[#FAF3EB] dark:bg-[#1e1e1e] px-6 py-4 flex gap-3 border-t ${t.divider} no-print`}>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  disabled={isDownloadingInvoice}
                  className={`flex-1 py-3 bg-[#F5EDE4] hover:bg-[#E5DDD4] dark:bg-[#2a2a2a] dark:hover:bg-[#374151] ${t.text} font-bold rounded-2xl transition-all text-xs text-center disabled:opacity-50`}
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloadingInvoice}
                  className="flex-1 py-3 bg-[#D97757] hover:bg-[#c87024] text-white font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D97757]/20 disabled:opacity-70"
                >
                  {isDownloadingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Download Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !paymentProcessing && setIsPaymentModalOpen(false)} />
            <div className="relative w-full max-w-sm bg-[#0f172a] rounded-[24px] border border-[#334155]/60 overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-left">
              <div className="bg-[#1e293b] p-4 flex items-center justify-between border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#3399FF] rounded flex items-center justify-center font-bold text-white text-xs">R</div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">Razorpay Secure</h5>
                    <p className="text-[10px] text-gray-400">Ordio · Order ID: {placedOrder.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="text-sm font-black text-[#3399FF]">{fmt(placedOrder.totalAmount, settings.currency)}</p>
                </div>
              </div>

              {paymentProcessing ? (
                <div className="p-8 flex flex-col items-center text-center space-y-4">
                  {paymentSuccess ? (
                    <>
                      <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                        <Check className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                      <p className="text-xs text-gray-400">Your order is being prepared.</p>
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
                <div className="p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider text-center border-b border-[#334155] pb-2">Select Payment Method</h4>
                  {paymentOption === null ? (
                    <div className="space-y-3">
                      <button onClick={() => setPaymentOption('UPI')} className="w-full p-4 bg-[#1e293b] hover:bg-[#334155]/60 border border-[#334155] rounded-xl flex items-center justify-between text-left transition-all">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-[#3399FF]" />
                          <div>
                            <p className="font-bold text-sm text-white">Pay via UPI / QR</p>
                            <p className="text-xs text-gray-400">GPay, PhonePe, Paytm, BHIM</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => setPaymentOption('CARD')} className="w-full p-4 bg-[#1e293b] hover:bg-[#334155]/60 border border-[#334155] rounded-xl flex items-center justify-between text-left transition-all">
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
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                          <button key={app} onClick={() => setUpiApp(app)} className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${upiApp === app ? 'bg-[#3399FF]/15 border-[#3399FF] text-white' : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:bg-[#334155]/60'}`}>{app}</button>
                        ))}
                      </div>
                      <input type="text" placeholder="username@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]" />
                      <button onClick={() => handleMockPaymentSubmit('UPI')} disabled={!upiApp && !upiId} className="w-full py-3 bg-[#3399FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm">
                        Pay {fmt(placedOrder.totalAmount, settings.currency)}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={() => setPaymentOption(null)} className="text-[#3399FF] text-xs hover:underline flex items-center gap-1 font-semibold">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <input type="text" placeholder="4111 2222 3333 4444" maxLength={19} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM/YY" maxLength={5} value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]" />
                        <input type="password" placeholder="CVV" maxLength={3} value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3399FF]" />
                      </div>
                      <button onClick={() => handleMockPaymentSubmit('CARD')} disabled={cardNumber.length < 15} className="w-full py-3 bg-[#3399FF] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm">
                        Pay {fmt(placedOrder.totalAmount, settings.currency)}
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
    <div className={`min-h-screen ${t.bg} pb-32`}>

      {/* Sticky Header — Swiggy style */}
      <div className={`${t.header} sticky top-0 z-30 border-b ${t.divider} shadow-sm`}>
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Restaurant/Table indicator */}
          <div className="flex items-center gap-2 min-w-0">
            {restaurant.logoUrl ? (
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name} 
                className="w-7 h-7 rounded-full object-cover border border-[#D97757]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 bg-[#D97757] rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className={`font-black text-xs leading-none truncate ${t.text}`}>{restaurant.name}</h1>
              <p className={`text-[10px] leading-tight ${t.subtext} mt-0.5 flex items-center gap-0.5`}>
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                Table {decodeURIComponent(tableNumber ?? '')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={toggleTheme} className={`p-1.5 rounded-lg border ${t.chip} transition-all`}>
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#6b7280]" />}
            </button>
            <button
              onClick={() => setIsAssistanceOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#D97757] hover:bg-[#c87024] text-white rounded-lg text-[10px] font-black transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Waiter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">

        {/* 1. Restaurant Brand Card */}
        <div className={`relative overflow-hidden border ${t.cardBorder} rounded-3xl py-3 px-2 sm:p-6 shadow-sm flex flex-col items-center text-center gap-1.5 sm:gap-3 mt-1 min-h-[120px] sm:min-h-[160px] justify-center bg-[#FFF8F0] dark:bg-black`}>
          {/* Banner Background */}
          <img 
            src={isDark ? bannerDark : bannerLight} 
            alt="Restaurant Banner" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0" 
          />
          
          {/* Subtle overlay for contrast */}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/20 z-0" />

          {/* Logo / Content (relative and z-10 to be on top of the banner) */}
          <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-3 w-full">
            {restaurant.logoUrl ? (
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name} 
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#D97757] shadow-md bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
              />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-tr from-[#D97757] to-[#F4A261] rounded-full flex items-center justify-center font-black text-white text-xl sm:text-3xl shadow-lg shadow-[#D97757]/20">
                {restaurant.name.charAt(0)}
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <h1 className={`font-black text-lg sm:text-2xl tracking-tight ${isDark ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-[#2C2C2C] drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'}`}>
                {restaurant.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
                <span className="text-[9px] sm:text-xs bg-[#F4A261]/25 dark:bg-[#D97757]/30 text-[#5C4033] dark:text-white border border-[#F4A261]/45 dark:border-[#D97757]/10 font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-sm">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Table {decodeURIComponent(tableNumber ?? '')}
                </span>
                <span className="text-[9px] sm:text-xs bg-[#2E7D32]/15 dark:bg-[#2E7D32]/20 text-[#2E7D32] dark:text-[#2E7D32] border border-[#2E7D32]/30 dark:border-[#2E7D32]/10 font-bold px-2.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-sm backdrop-blur-sm">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Contactless Ordering
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Featured Items Carousel */}
        {featuredItems.length > 0 && !searchQuery && (
          <section className="relative overflow-hidden rounded-3xl border border-dashed border-[#D97757]/30 p-2">
            <div className="flex items-center justify-between mb-3 px-2 pt-2">
              <h2 className={`font-black text-base flex items-center gap-2 ${t.text}`}>
                <Flame className="w-4 h-4 text-[#D97757]" />
                Chef's Picks
              </h2>
              <span className="text-[10px] font-bold bg-[#D97757]/15 text-[#D97757] px-2 py-0.5 rounded-full">
                Featured
              </span>
            </div>

            {/* Carousel Slider */}
            <div className={`relative w-full overflow-hidden rounded-2xl h-48 bg-[#F5EDE4] dark:bg-[#1e1e1e]`}>
              <div 
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
              >
                {featuredItems.map((item) => (
                  <div key={item.id} className="w-full h-full shrink-0 flex relative">
                    {/* Food Image Background / Left side */}
                    <div className={`w-[45%] h-full relative overflow-hidden ${t.imgBg} dark:bg-gray-800 shrink-0`}>
                      {item.imageUrl && !failedImages[item.id] ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          onError={() => setFailedImages((p) => ({ ...p, [item.id]: true }))} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className={`w-8 h-8 ${t.subtext} opacity-30`} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-[#D97757] text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-md">
                        <Star className="w-2.5 h-2.5 fill-white" /> POPULAR
                      </div>
                    </div>

                    {/* Content / Right side */}
                    <div className={`flex-1 p-4 flex flex-col justify-between ${t.card} border-l ${t.divider} min-w-0`}>
                      <div>
                        <div className="mb-1">
                          {item.foodType === 'veg' ? (
                            <VegIcon className="w-[13px] h-[13px]" />
                          ) : (
                            <NonVegIcon className="w-[13px] h-[13px]" />
                          )}
                        </div>
                        <h3 className={`font-black text-base leading-tight line-clamp-1 ${t.text}`}>{item.name}</h3>
                        <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${t.subtext}`}>
                          {item.description || "Delectable Chef's special prepared with fresh ingredients."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className={`font-black text-lg ${isDark ? 'text-white' : 'text-[#2C2C2C]'}`}>{fmt(item.price, settings.currency)}</p>
                        </div>

                        <div className="w-24 shrink-0">
                          {getQty(item.id) === 0 ? (
                            <button
                              onClick={() => { addToCart(item); toast.success(`${item.name} added!`, { duration: 1000 }); }}
                              className="w-full py-1.5 bg-[#D97757] hover:bg-[#c87024] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-[#D97757]/25"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          ) : (
                            <div className={`flex items-center justify-between ${t.qtyBg} rounded-xl px-1 py-0.5 border border-[#D97757]/20`}>
                              <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-[#D97757] rounded-lg text-white">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className={`font-black text-xs ${t.text}`}>{getQty(item.id)}</span>
                              <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-[#D97757] rounded-lg text-white">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              {featuredItems.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveSlideIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF3EB]/80 dark:bg-black/60 backdrop-blur-sm shadow-md border ${t.cardBorder} flex items-center justify-center ${t.text} hover:bg-[#FAF3EB] dark:hover:bg-black transition-all`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveSlideIndex((prev) => (prev + 1) % featuredItems.length)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FAF3EB]/80 dark:bg-black/60 backdrop-blur-sm shadow-md border ${t.cardBorder} flex items-center justify-center ${t.text} hover:bg-[#FAF3EB] dark:hover:bg-black transition-all`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Indicators/Dots */}
            {featuredItems.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {featuredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlideIndex ? 'w-5 bg-[#D97757]' : `w-1.5 ${isDark ? 'bg-gray-700' : 'bg-[#D97757]/30'}`
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Search & Sort/Filter Row */}
        <div className="flex items-center gap-2 mt-4">
          {/* Sort Button */}
          <button 
            onClick={() => setIsSortOpen(true)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              sortBy !== 'default' 
                ? 'bg-[#D97757]/15 border-[#D97757] text-[#D97757] font-black' 
                : `${t.chip} hover:bg-[#F5EDE4] dark:hover:bg-gray-800`
            }`}
            title="Sort items"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Sort</span>
            {sortBy !== 'default' && <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]" />}
          </button>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${t.input} border rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97757]/30 transition-all`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[#F5EDE4] dark:hover:bg-gray-800 rounded-full ${t.subtext}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              filterVeg 
                ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32] font-black dark:bg-emerald-950/20 dark:border-emerald-700 dark:text-emerald-400' 
                : `${t.chip} hover:bg-[#F5EDE4] dark:hover:bg-gray-800`
            }`}
            title="Filter items"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">Filter</span>
            {filterVeg && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* 4. All Menu Items */}
        <section>
          {/* Menu list header */}
          <div className="flex items-center justify-between mb-3 mt-1">
            <h2 className={`font-black text-base ${t.text}`}>
              {searchQuery 
                ? 'Search Results' 
                : activeCategory !== 'all' 
                  ? categories.find(c => c.id === activeCategory)?.name 
                  : 'Full Menu'
              }
            </h2>
            <span className={`text-xs font-semibold ${t.subtext}`}>
              {filteredItems.length} dish{filteredItems.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className={`${t.card} border ${t.cardBorder} rounded-3xl py-16 text-center shadow-sm`}>
              <Utensils className={`w-10 h-10 mx-auto mb-3 ${t.subtext}`} />
              <p className={`font-semibold ${t.text}`}>No items found</p>
              <p className={`text-sm mt-1 ${t.subtext}`}>Try a different category or search term</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className={`${t.card} border ${t.cardBorder} rounded-2xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-all`}>
                    {/* Food Image */}
                    <div className={`w-[100px] h-[90px] rounded-xl ${t.imgBg} overflow-hidden shrink-0 relative`}>
                      {item.imageUrl && !failedImages[item.id] ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={() => setFailedImages((p) => ({ ...p, [item.id]: true }))} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className={`w-8 h-8 ${t.subtext} opacity-40`} />
                        </div>
                      )}
                      {item.isFeatured && (
                        <div className="absolute top-1.5 left-1.5 bg-[#2E7D32] text-white text-[8px] font-black px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-2 h-2 fill-white" /> BEST
                        </div>
                      )}
                    </div>

                    {/* Info & Action Column Layout */}
                    <div className="flex-1 min-w-0 flex justify-between gap-3 items-stretch">
                      {/* Name & Description */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="mb-1">
                          {item.foodType === 'veg' ? (
                            <VegIcon className="w-[13px] h-[13px]" />
                          ) : (
                            <NonVegIcon className="w-[13px] h-[13px]" />
                          )}
                        </div>
                        <h3 className={`font-bold text-sm leading-tight ${t.text}`}>{item.name}</h3>
                        {item.description && (
                          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${t.subtext}`}>{item.description}</p>
                        )}
                      </div>

                      {/* Price & Add Column */}
                      <div className="flex flex-col items-end justify-between shrink-0 min-w-[80px]">
                        {/* Price - Bigger font, responsive light/dark color */}
                        <p className={`font-black text-base ${isDark ? 'text-white' : 'text-[#2C2C2C]'} leading-none mt-1`}>
                          {fmt(item.price, settings.currency)}
                        </p>
                        
                        {/* Add / Qty */}
                        <div className="w-full flex justify-end">
                          {qty === 0 ? (
                            <button
                              onClick={() => { addToCart(item); toast.success(`${item.name} added!`, { duration: 1000 }); }}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 border-2 border-[#D97757] text-[#D97757] hover:bg-[#D97757] hover:text-white rounded-xl text-xs font-bold transition-all min-w-[70px]"
                            >
                              <Plus className="w-3.5 h-3.5" /> ADD
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-[#D97757] rounded-xl px-1.5 py-0.5">
                              <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-black text-white text-xs w-4 text-center">{qty}</span>
                              <button onClick={() => addToCart(item)} className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Category Menu Button */}
      {!placedOrder && categories.length > 0 && (
        <div className={`fixed ${cart.length > 0 ? 'bottom-24' : 'bottom-5'} right-5 z-40`}>
          <button
            onClick={() => setIsCategoryMenuOpen(true)}
            className="bg-[#D97757] hover:bg-[#c87024] text-white pl-2 pr-4 py-2 rounded-full flex items-center gap-2 shadow-2xl shadow-[#D97757]/40 transition-all transform hover:scale-105 active:scale-95 font-bold text-xs uppercase tracking-wider"
          >
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-md">
              <img src={menuIcon} alt="Menu Icon" className="w-full h-full object-contain rounded-full" />
            </div>
            <span>Menu</span>
            {activeCategory !== 'all' && (
              <span className={`bg-[#FFF8F0] text-[#D97757] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black`}>
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Sort Bottom Sheet */}
      {isSortOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div onClick={() => setIsSortOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${t.sheetBg} rounded-t-[28px] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t ${t.divider} max-w-md mx-auto w-full`}>
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 ${isDark ? 'bg-[#374151]' : 'bg-[#D97757]/20'} rounded-full`} />
            </div>
            <div className={`flex items-center justify-between px-5 py-3 border-b ${t.divider}`}>
              <h2 className={`text-base font-black flex items-center gap-2 ${t.text}`}>
                <ArrowUpDown className="w-5 h-5 text-[#D97757]" />
                Sort Menu By
              </h2>
              <button onClick={() => setIsSortOpen(false)} className={`p-1.5 ${t.qtyBg} rounded-xl ${t.subtext}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                { id: 'default', label: 'Default Ordering' },
                { id: 'price-asc', label: 'Price: Low to High' },
                { id: 'price-desc', label: 'Price: High to Low' },
                { id: 'name-asc', label: 'Name: A to Z' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => { setSortBy(option.id); setIsSortOpen(false); }}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    sortBy === option.id 
                      ? 'bg-[#D97757]/10 border-[#D97757] text-[#D97757] font-black' 
                      : `${t.chip} hover:bg-[#F5EDE4] dark:hover:bg-gray-800`
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                  {sortBy === option.id && <Check className="w-4 h-4 text-[#D97757]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div onClick={() => setIsFilterOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${t.sheetBg} rounded-t-[28px] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t ${t.divider} max-w-md mx-auto w-full`}>
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 ${isDark ? 'bg-[#374151]' : 'bg-[#D97757]/20'} rounded-full`} />
            </div>
            <div className={`flex items-center justify-between px-5 py-3 border-b ${t.divider}`}>
              <h2 className={`text-base font-black flex items-center gap-2 ${t.text}`}>
                <SlidersHorizontal className="w-5 h-5 text-[#D97757]" />
                Filter Items
              </h2>
              <button onClick={() => setIsFilterOpen(false)} className={`p-1.5 ${t.qtyBg} rounded-xl ${t.subtext}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <p className={`text-xs font-black uppercase tracking-wider ${t.subtext}`}>Food Preference</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFilterVeg(false)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      !filterVeg 
                        ? 'bg-[#D97757]/15 border-[#D97757] text-[#D97757] font-black' 
                        : `${t.chip} hover:bg-[#F5EDE4] dark:hover:bg-gray-800`
                    }`}
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => setFilterVeg(true)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      filterVeg 
                        ? 'bg-[#2E7D32]/10 border-[#2E7D32] text-[#2E7D32] font-black dark:bg-emerald-950/20 dark:border-emerald-700 dark:text-emerald-400' 
                        : `${t.chip} hover:bg-[#F5EDE4] dark:hover:bg-gray-800`
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    Veg Only
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { setFilterVeg(false); setIsFilterOpen(false); }}
                  className={`flex-1 py-3.5 bg-[#F5EDE4] dark:bg-gray-800 ${t.text} text-xs font-bold rounded-2xl border ${t.cardBorder}`}
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3.5 bg-[#D97757] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#D97757]/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Menu Bottom Sheet */}
      {isCategoryMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div onClick={() => setIsCategoryMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${isDark ? t.sheetBg : 'bg-[#FFF8F0]'} rounded-t-[28px] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t ${t.divider} max-w-md mx-auto w-full`}>
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 ${isDark ? 'bg-[#374151]' : 'bg-[#D97757]/20'} rounded-full`} />
            </div>
            <div className={`flex items-center justify-between px-5 py-3 border-b ${t.divider}`}>
              <h2 className={`text-base font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2C2C2C]'}`}>
                <Utensils className="w-5 h-5 text-[#D97757]" />
                Categories
              </h2>
              <button
                onClick={() => setIsCategoryMenuOpen(false)}
                className={`p-1.5 ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F5EDE4]'} rounded-xl ${isDark ? 'text-white' : 'text-[#5C4033]'} transition-all`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-5 space-y-3">
              {/* All category button */}
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setIsCategoryMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  activeCategory === 'all' 
                    ? 'bg-[#FFF8F0] dark:bg-[#2a2a2a] border-2 border-[#D97757] text-[#D97757] font-black shadow-md shadow-[#D97757]/15' 
                    : 'bg-[#F5EDE4] dark:bg-[#1e1e1e] border border-[#D97757]/15 text-[#2C2C2C] shadow-sm hover:bg-[#FAF3EB] dark:hover:bg-gray-800'
                }`}
              >
                <span className={`text-sm font-bold ${activeCategory === 'all' ? 'text-[#D97757]' : 'text-[#2C2C2C] dark:text-[#9ca3af]'}`}>All Items</span>
                <span className={`text-xs font-semibold ${activeCategory === 'all' ? 'text-[#D97757]/80' : 'text-[#5C4033] dark:text-[#9ca3af]/70'}`}>{menuItems.length} items</span>
              </button>
              
              {categories.map((cat) => {
                const count = menuItems.filter(item => item.categoryId === cat.id).length;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsCategoryMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected 
                        ? 'bg-[#FFF8F0] dark:bg-[#2a2a2a] border-2 border-[#D97757] text-[#D97757] font-black shadow-md shadow-[#D97757]/15' 
                        : 'bg-[#F5EDE4] dark:bg-[#1e1e1e] border border-[#D97757]/15 text-[#2C2C2C] shadow-sm hover:bg-[#FAF3EB] dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-[#D97757]' : 'text-[#2C2C2C] dark:text-[#9ca3af]'}`}>{cat.name}</span>
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#D97757]/80' : 'text-[#5C4033] dark:text-[#9ca3af]/70'}`}>{count} items</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Bar — Swiggy style */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-sm bg-[#D97757] hover:bg-[#c87024] text-white rounded-2xl flex items-center justify-between px-5 py-4 shadow-2xl shadow-[#D97757]/40 transition-all transform hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-sm font-extrabold">{totalItems}</span>
              </div>
              <span className="font-bold text-sm">{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold">{fmt(totalAmount, settings.currency)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer — Bottom Sheet */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div onClick={() => { setIsCartOpen(false); setIsCheckoutConfirming(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${t.sheetBg} rounded-t-[28px] max-h-[88vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300 border-t ${t.divider}`}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 ${isDark ? 'bg-[#374151]' : 'bg-[#D97757]/20'} rounded-full`} />
            </div>

            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${t.divider}`}>
              <h2 className={`text-base font-black flex flex-col ${t.text}`}>
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#D97757]" />
                  {activeCookieOrder ? 'Add to Your Order' : 'Your Cart'}
                  <span className={`text-sm font-normal ${t.subtext}`}>({totalItems})</span>
                </span>
                {activeCookieOrder && (
                  <span className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                    Adding to Order #{activeCookieOrder.orderNumber}
                  </span>
                )}
              </h2>
              <button onClick={() => { setIsCartOpen(false); setIsCheckoutConfirming(false); }} className={`p-1.5 ${t.qtyBg} rounded-xl ${t.subtext}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.menuItemId} className={`flex items-center gap-3 ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F5EDE4]'} rounded-2xl p-3`}>
                    <div className={`w-12 h-12 rounded-xl ${t.imgBg} overflow-hidden shrink-0`}>
                      {item.imageUrl && !failedImages[item.menuItemId] ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" onError={() => setFailedImages((p) => ({ ...p, [item.menuItemId]: true }))} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className={`w-5 h-5 ${t.subtext}`} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${t.text}`}>{item.name}</p>
                      <p className="text-[#D97757] font-bold text-xs mt-0.5">{fmt(item.price * item.quantity, settings.currency)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#D97757] rounded-xl px-1.5 py-1">
                        <button onClick={() => removeFromCart(item.menuItemId)} className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-black text-sm w-5 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, imageUrl: item.imageUrl })} className="w-5 h-5 flex items-center justify-center text-white hover:bg-white/20 rounded-lg">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => deleteFromCart(item.menuItemId)} className="p-1.5 text-red-400 hover:text-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Your Meal */}
              {recommendedItems.length > 0 && (
                <div className="pt-2.5 border-t border-dashed border-[#D97757]/15">
                  <h3 className={`text-xs font-black tracking-wider uppercase mb-3 ${t.subtext}`}>
                    Complete Your Meal
                  </h3>
                  <div className="flex gap-3.5 overflow-x-auto pb-2.5 scrollbar-hide">
                    {recommendedItems.map((item) => (
                      <div key={item.id} className="w-[105px] shrink-0 flex flex-col group">
                        {/* Image Container */}
                        <div className={`relative w-[105px] h-[85px] rounded-2xl ${t.imgBg} overflow-hidden shrink-0 border ${t.cardBorder}`}>
                          {item.imageUrl && !failedImages[item.id] ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={() => setFailedImages((p) => ({ ...p, [item.id]: true }))}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Utensils className={`w-5 h-5 ${t.subtext} opacity-40`} />
                            </div>
                          )}
                          
                          {/* Plus Add Button on Image */}
                          <button
                            onClick={() => {
                              addToCart(item);
                              toast.success(`${item.name} added to cart!`, { duration: 1000 });
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white dark:bg-[#111827] border border-emerald-500/40 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 hover:bg-emerald-500/10 transition-all text-emerald-600 dark:text-emerald-400"
                            title="Add to cart"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>

                        {/* Name and Price */}
                        <div className="mt-1.5 text-left min-w-0">
                          <div className="flex items-start gap-1 min-w-0">
                            <span className="shrink-0 mt-0.5">
                              {item.foodType === 'veg' ? (
                                <VegIcon className="w-[10px] h-[10px]" />
                              ) : (
                                <NonVegIcon className="w-[10px] h-[10px]" />
                              )}
                            </span>
                            <span className={`text-[11px] font-bold truncate flex-1 block leading-tight ${t.text}`} title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-black text-[#D97757] block mt-0.5">
                            {fmt(item.price, settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bill + Checkout */}
            <div className={`px-4 pb-4 pt-3 border-t ${t.divider}`}>
              {/* Bill summary */}
              <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F5EDE4]'} rounded-2xl p-3 mb-3 space-y-1.5`}>
                <div className={`flex justify-between text-xs ${t.subtext}`}>
                  <span>Subtotal</span><span className={t.text}>{fmt(subtotal, settings.currency)}</span>
                </div>
                {settings.taxPercentage > 0 && (
                  <div className={`flex justify-between text-xs ${t.subtext}`}>
                    <span>Tax ({settings.taxPercentage}%)</span><span className={t.text}>{fmt(taxAmount, settings.currency)}</span>
                  </div>
                )}
                <div className={`border-t ${t.divider} pt-1.5 flex justify-between`}>
                  <span className={`font-bold text-sm ${t.text}`}>Total</span>
                  <span className="font-extrabold text-[#D97757] text-base">{fmt(totalAmount, settings.currency)}</span>
                </div>
              </div>

              {isCheckoutConfirming ? (
                <div className="space-y-3">
                  {/* Contact Details (Optional) */}
                  <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F5EDE4]'} rounded-xl p-3 space-y-2`}>
                    <p className={`text-xs font-bold ${t.subtext}`}>Contact Details (Optional)</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        maxLength={100}
                        className={`w-full ${t.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97757] transition-all`}
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number (Optional)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        maxLength={15}
                        className={`w-full ${t.input} border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#D97757] transition-all`}
                      />
                    </div>
                  </div>

                  {/* Payment method */}
                  {!activeCookieOrder && (
                    <div className={`${isDark ? 'bg-[#2a2a2a]' : 'bg-[#F5EDE4]'} rounded-xl p-3 text-center`}>
                      <p className={`text-xs font-bold ${t.subtext} flex items-center justify-center gap-1.5`}>
                        <Utensils className="w-3.5 h-3.5 text-[#D97757]" /> Payment Mode: Pay via Waiter 🙋
                      </p>
                    </div>
                  )}

                  <p className={`text-center text-xs ${t.subtext}`}>
                    {activeCookieOrder ? (
                      <span>Adding to <strong className={t.text}>Order #{activeCookieOrder.orderNumber}</strong> at Table {decodeURIComponent(tableNumber ?? '')}</span>
                    ) : (
                      <span>Ordering for <strong className={t.text}>Table {decodeURIComponent(tableNumber ?? '')}</strong></span>
                    )}
                  </p>

                  <div className="flex gap-3">
                    <button onClick={() => setIsCheckoutConfirming(false)} className={`flex-1 py-3 ${t.qtyBg} ${t.text} font-semibold rounded-2xl transition-all text-sm border ${t.cardBorder}`}>
                      Back
                    </button>
                    <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="flex-1 py-3 bg-[#2E7D32] hover:bg-[#235F26] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                      {isPlacingOrder ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Placing...</>
                      ) : activeCookieOrder ? (
                        <><CheckCircle className="w-4 h-4" /> Add to Order!</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Place Order!</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsCheckoutConfirming(true)} className="w-full py-4 bg-[#D97757] hover:bg-[#c87024] text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#D97757]/20 text-sm">
                  <ShoppingCart className="w-4 h-4" />
                  Proceed to Checkout · {fmt(totalAmount, settings.currency)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assistance Modal */}
      {isAssistanceOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div onClick={() => setIsAssistanceOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative ${t.sheetBg} rounded-3xl max-w-sm w-full p-6 text-center z-10 shadow-2xl animate-in zoom-in-95 duration-200 border ${t.cardBorder}`}>
            <button onClick={() => setIsAssistanceOpen(false)} className={`absolute top-4 right-4 p-1.5 ${t.qtyBg} rounded-xl ${t.subtext}`}>
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-[#D97757]/10 border border-[#D97757]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-[#D97757]" />
            </div>
            <h3 className={`text-lg font-black mb-1 ${t.text}`}>Request Service</h3>
            <p className={`text-xs mb-5 ${t.subtext}`}>Table <strong className={t.text}>{decodeURIComponent(tableNumber ?? '')}</strong></p>

            <div className="space-y-2.5">
              <button onClick={() => handleRequestAssistance('WAITER')} disabled={sendingAssistance} className="w-full py-3.5 bg-[#D97757] hover:bg-[#c87024] disabled:opacity-60 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#D97757]/20">
                {sendingAssistance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Utensils className="w-4 h-4" />}
                Call a Waiter 🙋
              </button>
              <button onClick={() => handleRequestAssistance('BILL')} disabled={sendingAssistance} className={`w-full py-3.5 ${t.qtyBg} border ${t.cardBorder} disabled:opacity-60 ${t.text} font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm`}>
                {sendingAssistance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                Request Final Bill 🧾
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Active Order Tracker Banner */}
      {!placedOrder && activeCookieOrder && (
        <div className={`fixed ${cart.length > 0 ? 'bottom-24' : 'bottom-5'} left-0 right-0 z-40 flex justify-center px-4 transition-all duration-300`}>
          <button
            onClick={() => {
              setPlacedOrder(activeCookieOrder);
              setTrackingOrder(activeCookieOrder);
            }}
            className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-between px-5 py-4 shadow-2xl shadow-emerald-500/20 transition-all transform hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center relative">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75 animate-ping" />
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="font-bold text-sm block">Active Order in Progress</span>
                <span className="text-[10px] text-white/80">Order #{activeCookieOrder.orderNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-extrabold text-xs bg-white/10 px-3 py-1.5 rounded-xl">
              <span>Track</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;

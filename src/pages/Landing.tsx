import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  ShoppingBag, 
  ArrowRight, 
  Menu, 
  X, 
  Smartphone,
  Check,
  Laptop,
  Clock,
  Database,
  Layers,
  CreditCard,
  Users,
  Building,
  Coffee,
  Flame,
  Landmark,
  UtensilsCrossed
} from 'lucide-react';

export const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom mock interactive states
  const [demoCartCount, setDemoCartCount] = useState(1);
  const [demoWaiters, setDemoWaiters] = useState([
    { name: 'Rahul S.', role: 'Senior Waiter', status: 'Active', tables: 'Tables 1-4' },
    { name: 'Priya K.', role: 'Waiter', status: 'On Break', tables: 'Tables 5-8' }
  ]);
  const [demoOrders] = useState([
    { id: '104', table: 'Table 4', item: 'Truffle Mushroom Pizza', qty: 1, status: 'Cooking', time: '2 min ago' },
    { id: '103', table: 'Table 2', item: 'Spicy Chicken Burger + Fries', qty: 1, status: 'Ready', time: '5 min ago' },
    { id: '102', table: 'Table 7', item: 'Request: Call Waiter (Water)', qty: 0, status: 'Pending', time: 'Just now' }
  ]);
  const [newWaiterName, setNewWaiterName] = useState('');

  const handleAddDemoWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;
    setDemoWaiters([
      ...demoWaiters,
      { name: newWaiterName, role: 'Waiter', status: 'Active', tables: 'Assigned on login' }
    ]);
    setNewWaiterName('');
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
      {/* Stripe-style Background Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_36px] pointer-events-none z-0"></div>

      {/* Navbar (Sticky and Mobile Friendly) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/logo-black.png" 
                  alt="QRUNTO" 
                  className="h-8 w-auto object-contain transform hover:scale-[1.02] transition-transform"
                />
              </Link>
            </div>

            {/* Navigation links (hidden on mobile) */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#problem-solution" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                Problems
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                How It Works
              </a>
              <a href="#product-customer" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                Customer App
              </a>
              <a href="#product-restaurant" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                Dashboard
              </a>
              <a href="#waiter-ops" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                Waiters
              </a>
              <a href="#benefits" className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] transition-colors duration-200">
                Benefits
              </a>
            </nav>

            {/* CTAs */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-sm font-medium text-[#4B5563] hover:text-[#FF6B35] px-3 py-1.5 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-semibold text-white bg-[#FF6B35] hover:bg-[#E55A24] px-4.5 py-2 rounded-xl hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile hamburger menu button (48px Touch Area) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-3 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-stone-150 focus:outline-none transition-colors min-h-[48px] min-w-[48px]"
              >
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer panel (Touch targets optimized for 48px height) */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100 border-b border-stone-200' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="px-3 pt-2 pb-4 space-y-1 bg-white shadow-inner">
            <a 
              href="#problem-solution" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              Problems
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              How It Works
            </a>
            <a 
              href="#product-customer" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              Customer App
            </a>
            <a 
              href="#product-restaurant" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              Dashboard
            </a>
            <a 
              href="#waiter-ops" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              Waiters
            </a>
            <a 
              href="#benefits" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#4B5563] hover:text-[#FF6B35] hover:bg-stone-50 transition-all min-h-[48px]"
            >
              Benefits
            </a>
            
            <div className="pt-4 pb-2 border-t border-stone-200/50 flex flex-col gap-2 px-3">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3.5 border border-stone-200 text-sm font-semibold rounded-xl text-[#111827] bg-white hover:bg-stone-50 transition-all min-h-[48px] flex items-center justify-center"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-3.5 text-sm font-semibold rounded-xl text-white bg-[#FF6B35] hover:bg-[#E55A24] transition-all min-h-[48px] flex items-center justify-center"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-24 lg:pb-32 z-10">
        {/* Glow effect behind mockups */}
        <div className="absolute top-1/2 right-1/10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
            
            {/* Left Column: Text and CTAs */}
            <div className="col-span-7 lg:col-span-6 flex flex-col items-start text-left w-full">
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6B35]/8 text-[#FF6B35] text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-3 sm:mb-5">
                  Mobile-First Table Automation
                </span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-[#111827] tracking-tight leading-tight sm:leading-none mb-3 sm:mb-4">
                Scan.<br className="hidden sm:block" />
                Order.<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#FF6B35] via-orange-500 to-[#FF8C35] bg-clip-text text-transparent">Pay.</span>
              </h1>
              <h2 className="text-[11px] xs:text-xs sm:text-lg lg:text-xl font-bold text-[#111827] mb-2 sm:mb-3">
                Turn every table into a self-ordering experience.
              </h2>
              <p className="text-[10px] xs:text-[11px] sm:text-base text-[#4B5563] leading-normal sm:leading-relaxed mb-4 sm:mb-6 max-w-lg">
                Customers scan a QR code, browse the menu, place orders, and pay instantly without waiting for a waiter.
              </p>
              
              {/* Full-width touch CTA buttons on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto text-center font-bold text-white bg-[#FF6B35] hover:bg-[#E55A24] px-3 sm:px-8 py-2.5 sm:py-4.5 text-[10px] xs:text-xs sm:text-base rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all min-h-[44px] sm:min-h-[48px] flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-4.5 h-4.5 sm:w-4 sm:h-4" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="w-full sm:w-auto text-center font-semibold text-[#4B5563] hover:text-[#111827] bg-white border border-stone-200 hover:border-stone-300 px-3 sm:px-8 py-2.5 sm:py-4.5 text-[10px] xs:text-xs sm:text-base rounded-xl shadow-sm hover:shadow-md transition-all min-h-[44px] sm:min-h-[48px] flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  Book Demo
                </a>
              </div>
            </div>

            {/* Right Column: Mockups (Responsive wrapper with side-by-side positioning on mobile) */}
            <div className="col-span-5 lg:col-span-6 relative flex justify-end items-start h-[210px] xs:h-[230px] sm:h-[460px] w-full overflow-visible mt-0 lg:mt-0">
              
              {/* Back Mockup: Dashboard (hidden on mobile below 640px) */}
              <div className="absolute top-10 left-4 w-[380px] md:w-[420px] bg-white border border-stone-200/80 rounded-2xl shadow-2xl p-5 z-10 hidden sm:block transform -rotate-1 scale-95 hover:scale-100 transition-all origin-bottom-left">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] animate-pulse"></span>
                    <span className="text-xs font-black uppercase text-stone-900 tracking-wider">Live Kitchen Screen</span>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Total Sales</span>
                    <span className="text-base font-extrabold text-stone-950 mt-1 block">₹42,850.00</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Active Tables</span>
                    <span className="text-base font-extrabold text-stone-950 mt-1 block">14 / 20</span>
                  </div>
                </div>

                {/* Active KOTs queue */}
                <div className="space-y-2 max-h-44 overflow-hidden">
                  {demoOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-100 rounded-xl text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-stone-900">{order.table}</span>
                        </div>
                        <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">{order.item}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Front Mockup: Mobile Customer Ordering (Scaled down to fit on mobile) */}
              <div className="absolute right-0 top-0 origin-top-right scale-[0.52] xs:scale-[0.58] sm:scale-100 sm:absolute sm:bottom-0 sm:right-4 sm:top-auto sm:left-auto sm:origin-center w-[260px] sm:w-[280px] bg-white border-4 border-stone-950 rounded-[36px] sm:rounded-[40px] shadow-2xl overflow-hidden z-25 sm:transform sm:rotate-2 hover:rotate-0 transition-transform">
                {/* Speaker notch */}
                <div className="w-28 h-5.5 bg-stone-950 rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                  <div className="w-10 h-1 bg-stone-850 rounded-full"></div>
                </div>

                {/* Screen content */}
                <div className="pt-7 bg-stone-50 h-[380px] sm:h-[420px] flex flex-col justify-between select-none">
                  {/* Web App Top Navbar */}
                  <div className="bg-white border-b border-stone-150 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3 text-[#FF6B35]" />
                      <span className="text-[10px] font-black text-stone-900">THE SPICY GRILL</span>
                    </div>
                    <span className="bg-[#FF6B35]/8 text-[#FF6B35] font-bold text-[8px] px-1.5 py-0.5 rounded-full">Table 4</span>
                  </div>

                  {/* Food Scroll Menu */}
                  <div className="p-2.5 overflow-y-auto flex-1 space-y-2">
                    <div className="text-[9px] text-[#FF6B35] font-black uppercase tracking-wider">
                      Popular Items
                    </div>

                    {/* Food Item */}
                    <div className="bg-white border border-stone-150 rounded-xl p-2 flex justify-between gap-2 shadow-sm">
                      <div className="flex-1">
                        <h4 className="text-[10.5px] font-bold text-stone-900 leading-tight">Truffle Mushroom Pizza</h4>
                        <span className="text-[10px] font-extrabold text-[#FF6B35] block mt-1">₹499</span>
                      </div>
                      <div className="flex flex-col items-center justify-between shrink-0">
                        <button 
                          onClick={() => setDemoCartCount(demoCartCount + 1)}
                          className="bg-[#FF6B35] text-white text-[9px] font-black px-2.5 py-1 rounded-lg w-full"
                        >
                          + ADD
                        </button>
                      </div>
                    </div>

                    {/* Food Item 2 */}
                    <div className="bg-white border border-stone-150 rounded-xl p-2 flex justify-between gap-2 shadow-sm">
                      <div className="flex-1">
                        <h4 className="text-[10.5px] font-bold text-stone-900 leading-tight">Spicy Chicken Burger</h4>
                        <span className="text-[10px] font-extrabold text-[#FF6B35] block mt-1">₹249</span>
                      </div>
                      <div className="flex flex-col items-center justify-between shrink-0">
                        <button 
                          onClick={() => setDemoCartCount(demoCartCount + 1)}
                          className="bg-[#FF6B35] text-white text-[9px] font-black px-2.5 py-1 rounded-lg w-full"
                        >
                          + ADD
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Cart Drawer Summary (>=48px touch height) */}
                  <div className="bg-white border-t border-stone-150 p-2.5 shadow-inner">
                    <div className="flex items-center justify-between bg-[#FF6B35] text-white p-2.5 rounded-lg cursor-pointer h-10">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{demoCartCount} Item added</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5">
                        View Cart <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Problem vs Solution */}
      <section id="problem-solution" className="py-16 bg-stone-50 border-y border-stone-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-[#FF6B35] uppercase">
              Operations Audit
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mt-2 mb-3">
              Why Traditional Dining is Slowing You Down
            </h2>
            <p className="text-sm text-[#4B5563]">
              Comparing the friction of manual table service against the speed of QRUNTO digital automation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Box: Restaurant Problems */}
            <div className="bg-white border border-red-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-black text-red-600 flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                The Traditional Friction
              </h3>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Long Waiting Times</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Customers wait 10-15 minutes just to get the waiter's attention, receive physical menus, and place order details.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Order Mistakes</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Wrong orders written down during busy hours lead to kitchen waste, food delays, and dissatisfied diners.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Slow Billing & Checkout</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Asking for the bill, waiting for the card machine, or counting cash tables slows down table turnaround by 15 minutes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Staff Dependency</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Your revenue is limited by waiter availability. Staff shortages directly hurt customer service quality.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Box: QRUNTO Solutions */}
            <div className="bg-white border border-[#FF6B35]/25 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-base font-black text-[#FF6B35] flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse"></span>
                The QRUNTO Solution
              </h3>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Instant QR Ordering</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Scan code, browse visual menu, and place order directly to the kitchen. Zero wait times.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Flawless Accuracy</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Customers verify their cart selections and custom options themselves. No transcription errors.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Online Split-Bill Payments</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Customers pay directly from their phones using UPI, credit cards, or split bills. Tables clear immediately.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Smart Waiter Allocation</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Waiters receive focused call requests (e.g., "Water" or "Service") on their dedicated dashboards.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: How it Works (Swipeable Carousel on Mobile) */}
      <section id="how-it-works" className="py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-[#FF6B35] uppercase">
              The Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mt-2 mb-3">
              Seamless Dining in 5 Steps
            </h2>
            <p className="text-sm text-[#4B5563]">
              From seating to billing, trace how simple table ordering becomes with QRUNTO. Swipe left on mobile.
            </p>
          </div>

          {/* Carousel Layout for Mobile, Grid Layout for Desktop */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-5">
            
            {/* Step 1 */}
            <div className="snap-center shrink-0 w-[260px] sm:w-auto bg-stone-50 border border-stone-150 rounded-2xl p-5 hover:border-[#FF6B35]/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-black text-xs mb-4">
                1
              </div>
              <h3 className="font-bold text-[#111827] text-xs sm:text-sm mb-2">Scan QR</h3>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed mb-4">
                Customer scans the unique QR sticker placed on the table with their default mobile camera.
              </p>
              <div className="bg-white border border-stone-100 rounded-lg p-2.5 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-[#111827]" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="snap-center shrink-0 w-[260px] sm:w-auto bg-stone-50 border border-stone-150 rounded-2xl p-5 hover:border-[#FF6B35]/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-black text-xs mb-4">
                2
              </div>
              <h3 className="font-bold text-[#111827] text-xs sm:text-sm mb-2">Browse Menu</h3>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed mb-4">
                A beautiful, interactive visual menu loads instantly on their phone. No app install required.
              </p>
              <div className="bg-white border border-stone-100 rounded-lg p-2.5 flex items-center justify-center font-bold text-[9px] text-[#FF6B35] uppercase">
                🍕 View Pizzas
              </div>
            </div>

            {/* Step 3 */}
            <div className="snap-center shrink-0 w-[260px] sm:w-auto bg-stone-50 border border-stone-150 rounded-2xl p-5 hover:border-[#FF6B35]/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-black text-xs mb-4">
                3
              </div>
              <h3 className="font-bold text-[#111827] text-xs sm:text-sm mb-2">Place Order</h3>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed mb-4">
                Add customizations, choose table addons, and send the order directly to the kitchen dashboard.
              </p>
              <div className="bg-white border border-stone-100 rounded-lg p-2.5 text-center text-[9px] text-emerald-600 font-bold">
                ✓ Order Sent to KOT
              </div>
            </div>

            {/* Step 4 */}
            <div className="snap-center shrink-0 w-[260px] sm:w-auto bg-stone-50 border border-stone-150 rounded-2xl p-5 hover:border-[#FF6B35]/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-black text-xs mb-4">
                4
              </div>
              <h3 className="font-bold text-[#111827] text-xs sm:text-sm mb-2">Pay Online</h3>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed mb-4">
                Review bill breakdown, split with friends, and checkout instantly using cards or UPI options.
              </p>
              <div className="bg-white border border-stone-100 rounded-lg p-2.5 text-center font-mono text-[9px] text-stone-800 font-bold">
                💳 Pay (UPI/Card)
              </div>
            </div>

            {/* Step 5 */}
            <div className="snap-center shrink-0 w-[260px] sm:w-auto bg-stone-50 border border-stone-150 rounded-2xl p-5 hover:border-[#FF6B35]/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-black text-xs mb-4">
                5
              </div>
              <h3 className="font-bold text-[#111827] text-xs sm:text-sm mb-2">Enjoy Food</h3>
              <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed mb-4">
                Kitchen prepares and waiters serve the meals directly. Enjoy a friction-free dining experience.
              </p>
              <div className="bg-white border border-stone-100 rounded-lg p-2.5 text-center text-[9px] text-stone-600 font-bold">
                🍜 Food Served!
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 4: What Customers See (Customer Ordering Mobile Screen) */}
      <section id="product-customer" className="py-16 bg-stone-50 border-t border-stone-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-center">
            {/* Mockup Frame Left (Stacked first on mobile) */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {/* High-fidelity Mockup */}
              <div className="w-[280px] sm:w-[300px] max-w-full bg-white border-[6px] sm:border-[8px] border-stone-900 rounded-[40px] sm:rounded-[48px] shadow-2xl overflow-hidden relative">
                {/* Top Dynamic Notch */}
                <div className="w-24 sm:w-28 h-5 bg-stone-900 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-30"></div>
                
                {/* App Screen Content */}
                <div className="pt-8 h-[460px] sm:h-[520px] flex flex-col justify-between bg-stone-50">
                  {/* Webapp header */}
                  <div className="bg-white border-b border-stone-200 p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-black text-[#111827]">Table 4 Menu</h4>
                      <span className="text-[8.5px] text-[#6B7280] font-medium">Bistro Royale Cafe</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  {/* Active food item details */}
                  <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
                    <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 shadow-sm text-left">
                      <div className="w-full h-20 sm:h-24 bg-stone-150 rounded-xl flex items-center justify-center font-bold text-[#FF6B35] text-[10px] sm:text-xs uppercase tracking-wider mb-3">
                        [ Truffle Mushroom Pizza ]
                      </div>
                      <h3 className="text-[11px] sm:text-xs font-black text-stone-950">Truffle Mushroom Pizza</h3>
                      <p className="text-[8.5px] sm:text-[9.5px] text-[#6B7280] leading-relaxed mt-1">
                        Baked on hand-stretched sourdough, wild portobello mushrooms, fresh herbs, truffle drizzle.
                      </p>
                      
                      {/* Customizations */}
                      <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[8.5px] sm:text-[9px]">
                          <span className="font-bold text-stone-700">Extra Cheese (+₹50)</span>
                          <input type="checkbox" defaultChecked className="rounded text-[#FF6B35] focus:ring-[#FF6B35] w-2.5 h-2.5" />
                        </div>
                        <div className="flex items-center justify-between text-[8.5px] sm:text-[9px]">
                          <span className="font-bold text-stone-700">Gluten-Free Base (+₹80)</span>
                          <input type="checkbox" className="rounded text-[#FF6B35] focus:ring-[#FF6B35] w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to order cart button block (>=48px touch height) */}
                  <div className="bg-white border-t border-stone-250 p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2.5 text-xs">
                      <span className="font-bold text-stone-600">Total Price</span>
                      <span className="font-extrabold text-[#FF6B35]">₹549.00</span>
                    </div>
                    <button className="w-full h-11 bg-[#FF6B35] text-white font-bold text-[10px] sm:text-xs rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center">
                      Add Item to Order
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="lg:col-span-7 flex flex-col justify-center text-center sm:text-left">
              <span className="text-xs font-bold text-[#FF6B35] tracking-wider uppercase mb-3">
                Customer View
              </span>
              <h3 className="text-3xl font-black text-stone-900 tracking-tight leading-none mb-4">
                Interactive Menus built for Conversions
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed mb-6 max-w-xl mx-auto sm:mx-0">
                Qrunto's customer interface is a lightweight, blazing-fast web application. There are no apps to install or accounts to register. Diners scan, choose add-ons, add items, and pay instantly.
              </p>

              {/* Bento micro benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/8 text-[#FF6B35] flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Visual Menu Cards</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Beautiful layouts with high-quality descriptions, vegetarian indicators, and price tags.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/8 text-[#FF6B35] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Add-on Selections</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Drive up-sells with cheese toppings, custom base options, and beverage combos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/8 text-[#FF6B35] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Online Payments Drawer</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Integrated checkout flows supporting UPI apps, credit/debit cards, and Google Pay.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/8 text-[#FF6B35] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Live Order Status</h4>
                    <p className="text-[11px] sm:text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                      Customers track their kitchen order status (cooking, ready, served) directly in their web browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: What Restaurants See (Dashboard Layout) */}
      <section id="product-restaurant" className="py-16 bg-white border-t border-stone-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Side: High fidelity Dashboard Mockup (Shown on top of description on mobile) */}
            <div className="lg:col-span-7 flex justify-center w-full overflow-hidden">
              <div className="w-full max-w-2xl bg-white border border-stone-250 rounded-2xl shadow-xl overflow-hidden text-left">
                
                {/* Mockup Dashboard Bar */}
                <div className="bg-[#111827] text-white p-3.5 flex items-center justify-between border-b border-stone-850">
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span className="text-[10px] font-black tracking-wider uppercase">Qrunto Control Panel</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Connected
                  </span>
                </div>

                {/* Dashboard Inner Layout */}
                <div className="bg-stone-50 p-4 sm:p-6 flex flex-col md:grid md:grid-cols-3 gap-4">
                  {/* Live order queue */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Kitchen Orders</span>
                      <span className="text-[9px] bg-[#FF6B35]/10 text-[#FF6B35] px-1.5 py-0.5 rounded-full font-bold">3 Active</span>
                    </h4>

                    {/* Order cards */}
                    <div className="space-y-2">
                      {demoOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-stone-150 rounded-xl p-3 shadow-sm text-xs">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 mb-1.5">
                            <div>
                              <span className="font-extrabold text-stone-900">{order.table}</span>
                              <span className="text-stone-400 font-mono ml-1.5 text-[9px]">KOT#{order.id}</span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-850 rounded">
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[#4B5563] text-[10px]">
                            <span className="font-bold truncate max-w-[150px]">{order.item}</span>
                            <span className="text-stone-400">{order.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions / stats */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-stone-900 uppercase tracking-wider mb-2">Table Grid</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((t, i) => (
                          <div 
                            key={t} 
                            className={`p-1.5 rounded-lg text-center text-[9px] font-black border ${
                              i === 3 
                                ? 'bg-orange-50 text-[#FF6B35] border-[#FF6B35]/30'
                                : i === 1
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                  : 'bg-white text-stone-400 border-stone-200'
                            }`}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-stone-150 rounded-xl p-3 shadow-sm">
                      <span className="text-[9px] text-[#6B7280] font-bold uppercase tracking-wider block">Live Sales</span>
                      <span className="text-lg font-black text-stone-900 block mt-0.5">₹12,450</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-5 flex flex-col justify-center text-center sm:text-left">
              <span className="text-xs font-bold text-[#FF6B35] tracking-wider uppercase mb-3">
                Operator View
              </span>
              <h3 className="text-3xl font-black text-stone-900 tracking-tight leading-none mb-4">
                Centralized Operations Control
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed mb-6 max-w-xl mx-auto sm:mx-0">
                Manage your kitchen tickets, table statuses, staff assignments, and live sales performance from a single unified control panel.
              </p>

              <div className="space-y-3.5 text-left max-w-lg mx-auto sm:mx-0">
                <div className="flex gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    <strong className="text-stone-900 font-bold">Kitchen Display KOT Screen</strong>: WebSocket-backed real-time updates ensure zero delay in cooking orders.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    <strong className="text-stone-900 font-bold">Visual Table Maps</strong>: Tracks occupied tables, bill settle requests, and buzzer alerts at a glance.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-orange-100 text-[#FF6B35] flex items-center justify-center shrink-0 mt-0.5"><Check className="w-2.5 h-2.5" /></div>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    <strong className="text-stone-900 font-bold">Live Business Metrics</strong>: Consolidates table turnaround speeds, tax audits, and sales performance.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 6: Waiter Operations Panel */}
      <section id="waiter-ops" className="py-16 bg-stone-50 border-t border-stone-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Side: Mock Waiter list (Padded and touch optimized) */}
            <div className="lg:col-span-7 flex justify-center w-full overflow-hidden">
              <div className="w-full max-w-xl bg-white border border-stone-250 rounded-2xl shadow-xl p-4 sm:p-6 text-left">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-150 pb-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-stone-950 text-xs sm:text-sm uppercase tracking-wider">Waiter Crew Management</h3>
                    <p className="text-[10px] sm:text-xs text-[#6B7280] mt-0.5">Control waiter accounts and active alerts.</p>
                  </div>
                  <Users className="w-5 h-5 text-[#FF6B35]" />
                </div>

                {/* Alert Notifications */}
                <div className="mb-5 space-y-2">
                  <h4 className="text-[9px] font-black text-[#FF6B35] uppercase tracking-wider">Active Staff Alerts</h4>
                  
                  {/* Alert 1 (Height >= 48px) */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs min-h-[48px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-ping shrink-0"></span>
                      <span className="font-black text-stone-900">Table 4</span>
                      <span className="text-[#6B7280]">Requested Service</span>
                    </div>
                    <button className="h-9 px-3 bg-[#FF6B35] text-white font-bold text-[9px] rounded-lg shadow-sm w-full sm:w-auto flex items-center justify-center shrink-0">
                      Assign Waiter
                    </button>
                  </div>

                  {/* Alert 2 */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs min-h-[48px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                      <span className="font-black text-stone-900">Table 2</span>
                      <span className="text-[#6B7280]">Requested Bill Checkout</span>
                    </div>
                    <button className="h-9 px-3 bg-red-500 text-white font-bold text-[9px] rounded-lg shadow-sm w-full sm:w-auto flex items-center justify-center shrink-0">
                      Process Bill
                    </button>
                  </div>
                </div>

                {/* Waiter accounts list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span>Active Crew Logs</span>
                    <span className="text-stone-400 font-semibold">{demoWaiters.length} Online</span>
                  </div>

                  <div className="border border-stone-150 rounded-xl overflow-hidden divide-y divide-stone-150">
                    {demoWaiters.map((w, index) => (
                      <div key={index} className="p-3 flex items-center justify-between text-xs bg-stone-50/50">
                        <div>
                          <p className="font-bold text-stone-950">{w.name}</p>
                          <span className="text-[9px] text-[#6B7280]">{w.role} • {w.tables}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800">
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add Waiter form (48px Touch Height inputs & button) */}
                  <form onSubmit={handleAddDemoWaiter} className="flex flex-col sm:flex-row gap-2 mt-3 pt-2">
                    <input 
                      type="text" 
                      placeholder="Enter waiter name"
                      value={newWaiterName}
                      onChange={(e) => setNewWaiterName(e.target.value)}
                      className="flex-grow bg-stone-50 border border-stone-200 rounded-xl px-3 h-11 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B35] text-stone-900"
                    />
                    <button 
                      type="submit"
                      className="bg-[#FF6B35] text-white font-bold text-xs h-11 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center"
                    >
                      + Add Crew
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-5 flex flex-col justify-center text-center sm:text-left">
              <span className="text-xs font-bold text-[#FF6B35] tracking-wider uppercase mb-3">
                Waiter Dashboard
              </span>
              <h3 className="text-3xl font-black text-stone-900 tracking-tight leading-none mb-4">
                Restaurant Waiter Operations
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed mb-5 max-w-xl mx-auto sm:mx-0">
                Equip your waitstaff with the tools they need to manage tables efficiently. Waiters can log in from their own mobile dashboards to handle customer requests instantly.
              </p>

              <div className="space-y-2.5 text-left text-xs text-[#4B5563] max-w-lg mx-auto sm:mx-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0"></div>
                  <span>Create individual waiter accounts with designated table permissions.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0"></div>
                  <span>Receive instant buzzer requests (water, general help, bill checks).</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] shrink-0"></div>
                  <span>Waiters can manually append items to existing active tickets on behalf of diners.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Why Restaurants Love Bento Layout */}
      <section id="benefits" className="py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-[#FF6B35] uppercase">
              The Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mt-2 mb-3">
              Modern Restaurant Bento Architecture
            </h2>
            <p className="text-sm text-[#4B5563]">
              Discover why modern restaurants trust QRUNTO to automate KOTs and maximize daily table turnover.
            </p>
          </div>

          {/* Bento Grid (Stacks to cols-1 on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Box 1 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 md:col-span-2 flex flex-col justify-between hover:border-[#FF6B35]/30 transition-colors">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">No App Installations Required</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed max-w-lg">
                  Customers scan QR codes using default camera apps. They don't need to register, remember passwords, or download bulky applications. It is 100% web-based.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-white px-2.5 py-1 border border-stone-200 rounded-lg text-[9px] font-bold text-stone-600">⚡ WebApp Load Time: ~0.8s</span>
                <span className="bg-white px-2.5 py-1 border border-stone-200 rounded-lg text-[9px] font-bold text-stone-600">📲 No App Stores</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 hover:border-[#FF6B35]/30 transition-colors flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">5-Minute Express Setup</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed">
                  Import menu structures, configure tables, generate QR codes, and begin accepting guest orders in under 5 minutes.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-black text-[#FF6B35] flex items-center gap-1">Fast Onboarding <Clock className="w-3 h-3" /></span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 hover:border-[#FF6B35]/30 transition-colors flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">Unlimited Table Layouts</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed">
                  Support setup for 5 tables or 500. Generate customized KOT routing parameters for each location automatically.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[9px] font-mono font-bold text-stone-700 bg-white px-2 py-0.5 border border-stone-200 rounded">TABLE_SLUG_ROUTER</span>
              </div>
            </div>

            {/* Box 4 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 md:col-span-2 flex flex-col justify-between hover:border-[#FF6B35]/30 transition-colors">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">Real-Time Kitchen KOT Feeds</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed max-w-lg">
                  Order updates flow dynamically into kitchen terminals. Sounds alert chefs when new tickets arrive, reducing delayed notifications to zero.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-white px-2.5 py-1 border border-stone-200 rounded-lg text-[9px] font-bold text-[#FF6B35]">● Live Feed Connected</span>
                <span className="bg-white px-2.5 py-1 border border-stone-200 rounded-lg text-[9px] font-bold text-stone-500">⚡ Latency: &lt; 50ms</span>
              </div>
            </div>

            {/* Box 5 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 hover:border-[#FF6B35]/30 transition-colors flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">Instant UPI Payments</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed">
                  Accept split bills or complete order checkouts directly. Funds route securely to your bank merchant accounts.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Settlements Active</span>
              </div>
            </div>

            {/* Box 6 */}
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-5 sm:p-6 hover:border-[#FF6B35]/30 transition-colors flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-stone-950 text-sm sm:text-base mb-1.5">Multi-Restaurant Operations</h4>
                <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed">
                  Manage multiple franchise locations, separate menu configurations, and centralized billing dashboards.
                </p>
              </div>
              <div className="mt-6">
                <span className="text-[10px] font-bold text-stone-700">All Branches Consolidated</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 8: Restaurant Types Grid (Swipeable Horizontal Scroll on Mobile) */}
      <section className="py-16 bg-stone-50 border-y border-stone-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-[#FF6B35] uppercase">
              Niched Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mt-2 mb-3">
              Designed for Diverse Formats
            </h2>
            <p className="text-sm text-[#4B5563]">
              Custom layout parameters configured for specific dining categories. Swipe left on mobile.
            </p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
            {/* Cafe */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <Coffee className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Cafes</h4>
            </div>

            {/* Fast Food */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">QSR / Fast Food</h4>
            </div>

            {/* Fine Dining */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Fine Dining</h4>
            </div>

            {/* Cloud Kitchen */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Cloud Kitchens</h4>
            </div>

            {/* Food Court */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Food Courts</h4>
            </div>

            {/* Multi-Branch */}
            <div className="snap-center shrink-0 w-[140px] sm:w-auto bg-white border border-stone-150 rounded-2xl p-5 hover:shadow-lg transition-shadow text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center mx-auto mb-3">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Multi-Branch</h4>
            </div>

          </div>
        </div>
      </section>

      {/* Section 9: Social Proof Testimonials */}
      <section className="py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider text-[#FF6B35] uppercase">
              Social Proof
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight mt-2 mb-3">
              Loved by Restaurant Operators
            </h2>
            <p className="text-sm text-[#4B5563]">
              Read how Qrunto helps establishments automate menus, manage staff, and increase earnings.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-[#4B5563] italic leading-relaxed mb-6 font-medium">
                "QRUNTO completely redefined how our bistro functions during Sunday rush hours. Table clearance times dropped by 18 minutes because customers check out and pay directly from their phones. Waiter stress has reduced noticeably!"
              </p>
              <div className="flex items-center gap-3 pt-3.5 border-t border-stone-200">
                <div className="w-8 h-8 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center font-bold text-xs">
                  AN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Arjun Nair</h4>
                  <span className="text-[9.5px] text-[#6B7280]">Owner, The Spice Bistro</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-150 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-[#4B5563] italic leading-relaxed mb-6 font-medium">
                "Our previous system was a complex POS that crashed frequently. Setting up QRUNTO took less than 5 minutes. The digital KOT monitor sounds alerts in the kitchen when guests click submit. Perfect operations accuracy."
              </p>
              <div className="flex items-center gap-3 pt-3.5 border-t border-stone-200">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  KD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Kiran Deshmukh</h4>
                  <span className="text-[9.5px] text-[#6B7280]">Operations Manager, Food Court Plaza</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monochromatic Restaurant Brand Logos Layout */}
          <div className="mt-12 pt-10 border-t border-stone-200/60 text-center">
            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest block mb-6">
              Empowering active tables at top venues
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-center justify-center opacity-40 grayscale text-center">
              <div className="text-[10px] sm:text-xs font-black tracking-wider text-stone-705">BELLA ITALIA</div>
              <div className="text-[10px] sm:text-xs font-black tracking-wider text-stone-705">BISTRO ROYALE</div>
              <div className="text-[10px] sm:text-xs font-black tracking-wider text-stone-705">THE SPICY GRILL</div>
              <div className="text-[10px] sm:text-xs font-black tracking-wider text-stone-705">DRAGON EXPRESS</div>
              <div className="text-[10px] sm:text-xs font-black tracking-wider text-stone-705">TANDOORI HUB</div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 10: Final CTA - Large Dark Section */}
      <section className="py-16 bg-[#111827] text-white relative overflow-hidden z-10">
        {/* Glow effects inside dark CTA */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B35]/15 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-25">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none mb-4">
            Ready to Modernize Your Restaurant?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto">
            Join restaurants using QRUNTO to simplify ordering, automate KOTs, and improve customer dining experience.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            <Link 
              to="/register" 
              className="w-full sm:w-auto text-center font-bold text-[#111827] bg-[#FF6B35] hover:bg-[#E55A24] hover:text-white px-8 py-4.5 rounded-xl shadow-lg transition-all min-h-[48px] flex items-center justify-center"
            >
              Start Free Trial
            </Link>
            <a 
              href="mailto:demo@qrunto.com" 
              className="w-full sm:w-auto text-center font-semibold text-white bg-transparent border border-gray-700 hover:border-gray-500 px-8 py-4.5 rounded-xl transition-all min-h-[48px] flex items-center justify-center"
            >
              Book Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-stone-850 py-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
            <div className="md:col-span-2 space-y-3">
              <Link to="/">
                <img 
                  src="/logo-black.png" 
                  alt="QRUNTO Logo" 
                  className="h-8 w-auto object-contain mb-3"
                />
              </Link>
              <p className="text-[11px] sm:text-xs text-[#6B7280] max-w-sm leading-relaxed">
                Scan. Order. Pay. QR code table ordering platform designed to simplify restaurant menu management, automate waiter workflows, and fast-track checkout transactions.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-stone-900 tracking-wider uppercase mb-3">Legal</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Refund Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-stone-900 tracking-wider uppercase mb-3">Support</h4>
              <ul className="space-y-1.5">
                <li><a href="mailto:support@qrunto.com" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Help Center</a></li>
                <li><a href="#" className="text-[11px] text-[#6B7280] hover:text-[#FF6B35] transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-150 flex flex-col md:flex-row items-center justify-between gap-3 text-center">
            <p className="text-[9px] text-[#9CA3AF]">
              © {new Date().getFullYear()} QRUNTO. All rights reserved. Designed for modern hospitality operators worldwide.
            </p>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wide">
              Scan. Order. Pay.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

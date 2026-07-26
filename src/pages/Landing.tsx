import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Users,
  Boxes,
  TrendingUp,
  Clock,
  AlertTriangle,
  Receipt,
  UserCheck,
  PackageX,
  ChefHat,
  BellRing,
  CreditCard,
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  ArrowRight,
  Zap,
  Activity,
  ShoppingBag,
  Layers,
  Sliders,
  DollarSign
} from 'lucide-react';

export const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true });

  // Contact Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    restaurantName: '',
    city: ''
  });

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="font-sans bg-white text-[#0F172A] antialiased selection:bg-[#FF6B00]/10 selection:text-[#FF6B00]">
      
      {/* ==================================================
          SECTION 1 — NAVBAR (Dark #081522)
          ================================================== */}
      <header className="sticky top-0 z-50 bg-[#081522] border-b border-slate-800 h-20">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              ORD<span className="text-[#FF6B00]">IO</span>
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center space-x-9">
            <button
              onClick={() => scrollToSection('problems')}
              className="text-[15px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('what-you-get')}
              className="text-[15px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[15px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Resources
            </button>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-[15px] font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <button
              onClick={() => scrollToSection('demo-form')}
              className="bg-[#FF6B00] hover:bg-[#E85D00] text-white text-[15px] font-bold px-6 py-3 rounded-[12px] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#FF6B00]/20 cursor-pointer"
            >
              Book Demo
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:bg-slate-800 rounded-[12px] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#081522] px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('problems'); }}
                className="text-left text-[16px] font-medium text-slate-300 hover:text-white py-2"
              >
                Features
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('what-you-get'); }}
                className="text-left text-[16px] font-medium text-slate-300 hover:text-white py-2"
              >
                Pricing
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('faq'); }}
                className="text-left text-[16px] font-medium text-slate-300 hover:text-white py-2"
              >
                Resources
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-[15px] font-semibold text-white border border-slate-700 rounded-[12px] bg-slate-900"
              >
                Login
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('demo-form'); }}
                className="w-full text-center py-3 text-[15px] font-bold text-white bg-[#FF6B00] hover:bg-[#E85D00] rounded-[12px]"
              >
                Book Demo
              </button>
            </div>
          </div>
        )}
      </header>


      {/* ==================================================
          SECTION 2 — HERO (Dark #081522, Full Viewport Height, Pure Code Visual)
          ================================================== */}
      <section className="bg-[#081522] py-[80px] md:py-[120px] min-h-[calc(100vh-80px)] flex items-center text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6 w-full text-center">
          
          <div className="max-w-[920px] mx-auto space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
              <span className="text-[13px] font-bold text-slate-200 tracking-wider uppercase">
                Scan. Order. Pay.
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-black text-white leading-[1.05] tracking-tight">
              The Restaurant Operating System <br />
              <span className="text-[#FF6B00]">Built For Modern Restaurants</span>
            </h1>

            {/* Subheadline */}
            <p className="text-[18px] sm:text-[20px] text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
              Manage QR Ordering, Billing, CRM, Inventory, Waiter Management and Analytics from one platform.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection('demo-form')}
                className="w-full sm:w-auto bg-[#FF6B00] hover:bg-[#E85D00] text-white text-[16px] font-bold px-8 py-4 rounded-[12px] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#FF6B00]/25 text-center cursor-pointer"
              >
                Book Demo
              </button>
              <button
                onClick={() => scrollToSection('why-ordio')}
                className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 text-[16px] font-semibold px-8 py-4 rounded-[12px] transition-all text-center cursor-pointer"
              >
                Learn More
              </button>
            </div>

            {/* Feature Pill System */}
            <div className="pt-6 flex flex-wrap justify-center gap-2.5">
              {[
                { name: 'QR Ordering', icon: QrCode },
                { name: 'CRM', icon: Users },
                { name: 'Inventory', icon: Boxes },
                { name: 'Analytics', icon: TrendingUp },
                { name: 'Waiter Management', icon: ChefHat },
                { name: 'Online Payments', icon: CreditCard },
              ].map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-[13px] font-semibold text-slate-300"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{pill.name}</span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Geometric Pure SaaS Visual System (NO IMAGES, NO SCREENSHOTS, NO DEVICES) */}
          <div className="mt-16 max-w-[1140px] mx-auto bg-slate-900/90 border border-slate-800 rounded-[24px] p-6 sm:p-10 text-left shadow-2xl relative">
            
            {/* Diagram Title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]"></span>
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                  ORDIO Unified Workflow Engine
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Active Operational Flow
              </span>
            </div>

            {/* 4 Connected Node Cards Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              
              {/* Node 1: Customer Scan */}
              <div className="bg-slate-950 border border-slate-800 rounded-[16px] p-5 space-y-3 relative group hover:border-[#FF6B00]/60 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Step 01
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-white">Customer Scan</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Table 04 QR code scanned via camera.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Scan Latency</span>
                  <span className="font-bold text-emerald-400">0.8s</span>
                </div>
              </div>

              {/* Node 2: Order Creation */}
              <div className="bg-slate-950 border border-slate-800 rounded-[16px] p-5 space-y-3 relative group hover:border-[#FF6B00]/60 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Step 02
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-white">Order Creation</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Order #204 auto-created with item customizations.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cart Total</span>
                  <span className="font-bold text-white">₹647.00</span>
                </div>
              </div>

              {/* Node 3: Restaurant Operations */}
              <div className="bg-slate-950 border border-slate-800 rounded-[16px] p-5 space-y-3 relative group hover:border-[#FF6B00]/60 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Step 03
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-white">Restaurant Operations</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Live KOT ticket sent to kitchen & waiter desk.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Kitchen Chime</span>
                  <span className="font-bold text-[#FF6B00]">Triggered</span>
                </div>
              </div>

              {/* Node 4: Analytics & Revenue */}
              <div className="bg-slate-950 border border-slate-800 rounded-[16px] p-5 space-y-3 relative group hover:border-[#FF6B00]/60 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Step 04
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-white">Analytics & Growth</h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  Revenue ledger & stock balances updated live.
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Daily Revenue</span>
                  <span className="font-bold text-emerald-400">₹42,850</span>
                </div>
              </div>

            </div>

            {/* Metric Footer Bar */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-400">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> 100% Digital Workflow</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> Real-time KOT Chime Engine</span>
              </div>
              <span className="font-mono text-slate-400">SYSTEM STATUS: OPTIMAL</span>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 3 — PROBLEMS WE SOLVE (Surface #F8FAFC, 3x2 Grid)
          ================================================== */}
      <section id="problems" className="bg-[#F8FAFC] py-[80px] md:py-[120px] border-y border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6">
          
          <div className="text-center max-w-[760px] mx-auto mb-16 space-y-4">
            <span className="text-[13px] font-bold text-[#FF6B00] uppercase tracking-wider block">
              Operational Challenges
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#0F172A] leading-tight">
              Restaurant Operations Are Still Too Manual
            </h2>
            <p className="text-[18px] text-[#64748B] font-medium">
              Restaurants lose time and revenue because of disconnected workflows.
            </p>
          </div>

          {/* 3x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <Clock className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">Long Wait Times</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Guests wait 10-15 minutes just to receive physical menus, place orders, or get a waiter's attention.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">Order Errors</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Manual transcription mistakes between waitstaff and kitchen lead to food waste, delays, and dissatisfied diners.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <Receipt className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">Slow Billing</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Waiting for card terminals or counting cash stalls checkout during peak rush hours, slowing table turnaround velocity.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">Staff Dependency</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                High waiter turnover directly limits floor service capacity when staff members are unavailable.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <PackageX className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">Inventory Waste</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Unmonitored raw material stock levels and unlinked recipe checkouts cause food spoilage and profit leakage.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 space-y-4 hover:border-[#FF6B00]/40 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-[14px] bg-red-500/10 text-red-500 flex items-center justify-center">
                <Users className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[22px] font-bold text-[#0F172A]">No Customer Insights</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Restaurants remain blind to repeat diner preferences, leaving customer retention to chance.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 4 — WHY ORDIO (Dark #081522, Bento Grid Layout)
          ================================================== */}
      <section id="why-ordio" className="bg-[#081522] py-[80px] md:py-[120px] text-white border-b border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6">
          
          <div className="text-center max-w-[760px] mx-auto mb-16 space-y-4">
            <span className="text-[13px] font-bold text-[#FF6B00] uppercase tracking-wider block">
              The ORDIO Advantage
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-white leading-tight">
              Why Restaurants Choose ORDIO
            </h2>
            <p className="text-[18px] text-slate-300 font-medium">
              Everything your restaurant needs in one platform.
            </p>
          </div>

          {/* Premium Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            
            {/* Card 1: QR Ordering */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-6 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[26px] font-bold text-white">QR Ordering</h3>
                <p className="text-[16px] text-slate-300 mt-2 leading-relaxed">
                  Table-linked QR codes allow diners to browse visual digital menus, customize dishes, and send orders directly to the kitchen without app downloads.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {['Zero app install needed', 'Custom chef notes & modifiers', 'Instant KOT routing'].map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2 text-[14px] font-semibold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: CRM */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-6 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[26px] font-bold text-white">CRM & Loyalty</h3>
                <p className="text-[16px] text-slate-300 mt-2 leading-relaxed">
                  Automatically build guest phone directories, track visit frequency, and trigger automated loyalty rewards.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {['Automated guest phone directory', 'Lifetime spend (LTV) insights', 'Targeted celebration coupons'].map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2 text-[14px] font-semibold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Inventory */}
            <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-6 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[24px] font-bold text-white">Inventory Tracking</h3>
                <p className="text-[16px] text-slate-300 mt-2 leading-relaxed">
                  Monitor raw material stock levels, link dish recipe deductions, log food wastage, and manage supplier purchase orders.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {['Recipe-based auto stock deduction', 'Low stock alerts & purchase orders', 'Wastage logs & supplier profiles'].map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2 text-[14px] font-semibold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Analytics */}
            <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-6 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[24px] font-bold text-white">Real-Time Analytics</h3>
                <p className="text-[16px] text-slate-300 mt-2 leading-relaxed">
                  Track daily revenue trends, peak order hours, average ticket size, and top dish profitability in real time.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {['Sales revenue & AOV trends', 'Top selling dish rankings', 'Table turnover velocity stats'].map((bullet) => (
                  <div key={bullet} className="flex items-center gap-2 text-[14px] font-semibold text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Waiter Management */}
            <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-4 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-10 h-10 rounded-[12px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-[22px] font-bold text-white">Waiter Management</h3>
              <p className="text-[15px] text-slate-300 leading-relaxed">
                Mobile-first waiter portal protected by 4-digit passcodes for floor staff table allocations and service call alerts.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[12px] font-semibold text-[#FF6B00]">Passcode Authorization Security</span>
              </div>
            </div>

            {/* Card 6: Online Payments */}
            <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-[24px] p-8 space-y-4 hover:-translate-y-2 transition-all duration-300 hover:border-[#FF6B00]/60">
              <div className="w-10 h-10 rounded-[12px] bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-[22px] font-bold text-white">Online Payments</h3>
              <p className="text-[15px] text-slate-300 leading-relaxed">
                Integrated UPI deep links, credit card checkouts, and automatic bill splitting directly on guest smartphones.
              </p>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[12px] font-semibold text-[#FF6B00]">Instant Bank Settlements</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 5 — WHAT YOU GET WITH ORDIO (White #FFFFFF, 6 Cards)
          ================================================== */}
      <section id="what-you-get" className="bg-white py-[80px] md:py-[120px]">
        <div className="max-w-[1280px] mx-auto px-6">
          
          <div className="text-center max-w-[760px] mx-auto mb-16 space-y-4">
            <span className="text-[13px] font-bold text-[#FF6B00] uppercase tracking-wider block">
              Complete Capabilities
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#0F172A] leading-tight">
              One Platform. <br />
              Complete Restaurant Operations.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <QrCode className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">QR Ordering</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Customers scan QR codes and place orders directly from their phones.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <Users className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">CRM</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Track customer history and build stronger relationships.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <Boxes className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">Inventory</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Monitor stock and reduce wastage.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">Analytics</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Understand restaurant performance with real-time insights.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <ChefHat className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">Waiter Management</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Manage tables and customer assistance efficiently.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] p-8 space-y-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <Building2 className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-[24px] font-bold text-[#0F172A]">Multi-Restaurant SaaS</h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Operate multiple locations independently.
              </p>
            </div>
          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 6 — HOW IT WORKS (Modern Horizontal Timeline)
          ================================================== */}
      <section className="bg-[#F8FAFC] py-[80px] md:py-[120px] border-y border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6">
          
          <div className="text-center max-w-[760px] mx-auto mb-16 space-y-4">
            <span className="text-[13px] font-bold text-[#FF6B00] uppercase tracking-wider block">
              Frictionless Setup
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#0F172A] leading-tight">
              Get Started In Minutes
            </h2>
          </div>

          {/* Timeline Grid (Desktop Horizontal, Mobile Vertical) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left relative">
            {[
              { num: 'Step 1', title: 'Create Restaurant', desc: 'Configure outlet details and tax series.' },
              { num: 'Step 2', title: 'Upload Menu', desc: 'Add dishes, prices, veg/non-veg tags & images.' },
              { num: 'Step 3', title: 'Generate QR Codes', desc: 'Print table-mapped QR stickers directly.' },
              { num: 'Step 4', title: 'Start Taking Orders', desc: 'Receive live KOT tickets directly in kitchen.' },
              { num: 'Step 5', title: 'Track Performance', desc: 'Monitor daily sales and customer repeat rates.' },
            ].map((st, index) => (
              <div key={st.num} className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 space-y-3 relative flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-[12px] font-bold rounded-md uppercase inline-block mb-3">
                    {st.num}
                  </span>
                  <h3 className="text-[20px] font-bold text-[#0F172A]">{st.title}</h3>
                  <p className="text-[15px] text-[#64748B] mt-2 leading-relaxed">{st.desc}</p>
                </div>
                {index < 4 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#FF6B00] z-10">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 7 — CTA BANNER (Dark #081522)
          ================================================== */}
      <section className="bg-[#081522] py-[80px] md:py-[100px] text-white text-center border-b border-slate-800">
        <div className="max-w-[800px] mx-auto px-6 space-y-6">
          <h2 className="text-[32px] sm:text-[44px] md:text-[52px] font-black text-white leading-tight">
            Ready To Modernize Your Restaurant?
          </h2>
          <p className="text-[18px] sm:text-[20px] text-slate-300 font-medium">
            Scan. Order. Pay. Manage Everything.
          </p>
          <div className="pt-2">
            <button
              onClick={() => scrollToSection('demo-form')}
              className="bg-[#FF6B00] hover:bg-[#E85D00] text-white text-[16px] font-bold px-9 py-4 rounded-[12px] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#FF6B00]/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Book Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>


      {/* ==================================================
          SECTION 8 — FAQ (White #FFFFFF, Accordion Layout)
          ================================================== */}
      <section id="faq" className="bg-white py-[80px] md:py-[120px]">
        <div className="max-w-[840px] mx-auto px-6">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-[13px] font-bold text-[#FF6B00] uppercase tracking-wider block">
              Clear Answers
            </span>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#0F172A] leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 text-left">
            {[
              { q: 'How does QR Ordering work?', a: 'Every table gets a dedicated QR sticker. Diners scan it with their phone camera to open your responsive digital menu, select customizations, and place orders directly to your kitchen dashboard.' },
              { q: 'Do customers need an app?', a: 'No app download is needed. The menu opens instantly in Safari, Chrome, or any mobile browser.' },
              { q: 'Can waiters create orders?', a: 'Yes. Waiters can use the passcode-protected Waiter Dashboard to enter orders manually, manage tables, or print KOT receipts.' },
              { q: 'How does billing work?', a: 'Invoices are generated automatically with customizable series (e.g., INV-2026-001), CGST/SGST tax configurations, and instant thermal printer compatibility.' },
              { q: 'Can I manage multiple restaurants?', a: 'Yes. ORDIO includes multi-outlet management controls allowing you to configure menus, staff roles, and view sales analytics across all branches.' },
              { q: 'Do you support online payments?', a: 'Yes. Customers can pay via UPI deep links, credit cards, or split bills directly on their mobile phones.' },
              { q: 'How quickly can I get started?', a: 'Initial restaurant setup, menu upload, and table QR code generation take less than 30 minutes.' },
              { q: 'Can menus be customized?', a: 'Yes. You can edit dishes, prices, veg/non-veg tags, stock availability, and category sequences anytime.' },
            ].map((item, idx) => {
              const isOpen = !!faqOpen[idx];
              return (
                <div key={idx} className="border border-[#E2E8F0] rounded-[16px] overflow-hidden bg-white">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-[18px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#64748B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-[16px] text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* ==================================================
          SECTION 9 — DEMO FORM (Surface #F8FAFC background, Large Card)
          ================================================== */}
      <section id="demo-form" className="bg-[#F8FAFC] py-[80px] md:py-[120px] border-t border-[#E2E8F0]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left items-center">
              
              {/* Left Side Info */}
              <div className="lg:col-span-5 space-y-6">
                <span className="px-3 py-1 rounded-md text-[12px] font-bold uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00]">
                  Book A Demo
                </span>
                <h2 className="text-[32px] sm:text-[40px] font-bold text-[#0F172A] leading-tight">
                  We'd Love To Show You ORDIO
                </h2>
                <p className="text-[18px] text-[#64748B] leading-relaxed">
                  Book a personalized demo and see how ORDIO can simplify your restaurant operations.
                </p>

                <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-3 text-[15px] font-semibold text-[#0F172A]">
                    <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />
                    <span>Free 30-minute personalized walkthrough</span>
                  </div>
                  <div className="flex items-center gap-3 text-[15px] font-semibold text-[#0F172A]">
                    <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />
                    <span>Custom menu catalog migration assistance</span>
                  </div>
                </div>
              </div>

              {/* Right Side Form */}
              <div className="lg:col-span-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[20px] p-6 sm:p-8">
                {formSubmitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-[24px] font-bold text-[#0F172A]">Demo Request Received!</h3>
                    <p className="text-[16px] text-[#64748B]">Our team will get in touch with you shortly on your provided phone number.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[14px] font-bold text-[#0F172A] mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px] text-[15px] text-[#0F172A] focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-bold text-[#0F172A] mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px] text-[15px] text-[#0F172A] focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[14px] font-bold text-[#0F172A] mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="john@restaurant.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px] text-[15px] text-[#0F172A] focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[14px] font-bold text-[#0F172A] mb-1">Restaurant Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Spice Bistro"
                          value={formData.restaurantName}
                          onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px] text-[15px] text-[#0F172A] focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-[#0F172A] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-[12px] text-[15px] text-[#0F172A] focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#FF6B00] hover:bg-[#E85D00] text-white font-bold text-[16px] py-4 rounded-[12px] transition-all shadow-md mt-2 cursor-pointer"
                    >
                      Book Demo
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* ==================================================
          SECTION 10 — FOOTER (Dark #081522)
          ================================================== */}
      <footer className="bg-[#081522] text-white py-16 border-t border-slate-800">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            
            {/* Col 1: Product */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-[14px] text-slate-400">
                <li><button onClick={() => scrollToSection('why-ordio')} className="hover:text-white transition-colors cursor-pointer">QR Ordering</button></li>
                <li><button onClick={() => scrollToSection('why-ordio')} className="hover:text-white transition-colors cursor-pointer">CRM</button></li>
                <li><button onClick={() => scrollToSection('why-ordio')} className="hover:text-white transition-colors cursor-pointer">Inventory</button></li>
                <li><button onClick={() => scrollToSection('why-ordio')} className="hover:text-white transition-colors cursor-pointer">Analytics</button></li>
              </ul>
            </div>

            {/* Col 2: Company */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-[14px] text-slate-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-[14px] text-slate-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold text-white uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2 text-[14px] text-slate-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-slate-500">
            <span className="font-bold text-white">ORD<span className="text-[#FF6B00]">IO</span> — Scan. Order. Pay. Manage Everything.</span>
            <span>© 2026 ORDIO. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

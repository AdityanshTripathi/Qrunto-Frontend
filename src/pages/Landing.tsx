import React, { useState, useEffect, useCallback } from 'react';
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
  Building2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Flame,
  Zap,
  BarChart3,
  Utensils,
  Check,
  Globe
} from 'lucide-react';
import { ScrollHighlightText } from '../components/ScrollHighlightText';

const MODULE_TABS = [
  { id: 'qr', label: '1. QR Digital Menu', icon: Smartphone },
  { id: 'kds', label: '2. Kitchen KDS', icon: ChefHat },
  { id: 'waiter', label: '3. Floor & Waiters', icon: Users },
  { id: 'inventory', label: '4. Recipe Inventory', icon: Boxes },
  { id: 'analytics', label: '5. Executive Analytics', icon: BarChart3 },
] as const;

type ModuleId = typeof MODULE_TABS[number]['id'];

export const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({ 0: true, 1: false });
  const [activeTab, setActiveTab] = useState<ModuleId>('qr');

  const activeIndex = MODULE_TABS.findIndex((t) => t.id === activeTab);

  const nextModule = useCallback(() => {
    setActiveTab((prev) => {
      const idx = MODULE_TABS.findIndex((t) => t.id === prev);
      return MODULE_TABS[(idx + 1) % MODULE_TABS.length].id;
    });
  }, []);

  const prevModule = useCallback(() => {
    setActiveTab((prev) => {
      const idx = MODULE_TABS.findIndex((t) => t.id === prev);
      return MODULE_TABS[(idx - 1 + MODULE_TABS.length) % MODULE_TABS.length].id;
    });
  }, []);

  // Continuous auto-rotation every 5 seconds (1 -> 2 -> 3 -> 4 -> 5 -> 1)
  useEffect(() => {
    const timer = setInterval(() => {
      nextModule();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextModule, activeTab]);

  // Contact / Demo Form State
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
    <div className="min-h-screen bg-[#07090E] text-[#E2E8F0] font-sans antialiased selection:bg-[#FF6B00]/20 selection:text-[#FF6B00] overflow-x-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.12)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,107,0,0.08)_0%,transparent_70%)] blur-[90px]" />
      </div>

      {/* ==================================================
          SECTION 1 — TOP NAVIGATION BAR
          ================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090E]/80 backdrop-blur-2xl border-b border-white/[0.08] h-20 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF6B00]/25 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white font-inter-tight flex items-center gap-1.5">
                ORD<span className="text-[#FF6B00]">IO</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono -mt-1">
                Connected OS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('workflow')}
              className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Connected OS
            </button>
            <button
              onClick={() => scrollToSection('capabilities')}
              className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Modules
            </button>
            <button
              onClick={() => scrollToSection('why-ordio')}
              className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Advantages
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-[14px] font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/[0.05] transition-all"
            >
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection('demo-form')}
              className="relative group overflow-hidden bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-500 hover:to-[#FF6B00] text-white text-[14px] font-bold px-6 py-2.5 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#FF6B00]/25 cursor-pointer flex items-center gap-2 border-t border-l border-white/25"
            >
              <span>Book a Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/[0.08] bg-[#0A0D14]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('workflow'); }}
                className="text-left text-[15px] font-medium text-slate-300 hover:text-white py-2"
              >
                Connected OS
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('capabilities'); }}
                className="text-left text-[15px] font-medium text-slate-300 hover:text-white py-2"
              >
                Modules
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('why-ordio'); }}
                className="text-left text-[15px] font-medium text-slate-300 hover:text-white py-2"
              >
                Advantages
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('how-it-works'); }}
                className="text-left text-[15px] font-medium text-slate-300 hover:text-white py-2"
              >
                How It Works
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('faq'); }}
                className="text-left text-[15px] font-medium text-slate-300 hover:text-white py-2"
              >
                FAQ
              </button>
            </nav>

            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-[14px] font-semibold text-white border border-white/[0.12] rounded-xl bg-white/[0.03]"
              >
                Sign In
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('demo-form'); }}
                className="w-full text-center py-3 text-[14px] font-bold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-xl shadow-lg shadow-[#FF6B00]/25"
              >
                Book a Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 pt-20">

        {/* ==================================================
            SECTION 2 — CINEMATIC HERO SECTION
            ================================================== */}
        <section className="relative min-h-[92vh] flex flex-col justify-center items-center pt-24 pb-20 px-6 overflow-hidden">
          <div className="max-w-[1280px] mx-auto w-full text-center flex flex-col items-center">
            
            {/* Live System Signal Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md mb-8 hover:border-[#FF6B00]/40 transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              <span className="text-[12px] font-bold tracking-widest text-slate-300 uppercase font-mono">
                Unified Hospitality OS • Real-Time Engine
              </span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-[44px] sm:text-[64px] md:text-[80px] lg:text-[92px] font-black text-white leading-[1.05] tracking-tight font-inter-tight max-w-5xl">
              Every part of your restaurant. <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-orange-100 to-[#FF6B00] bg-clip-text text-transparent">
                Seamlessly Connected.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-[18px] sm:text-[21px] text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
              Ordio unifies QR contactless ordering, live kitchen KOT routing, floor waiter coordination, automated inventory deductions, and multi-outlet analytics into one cohesive operating system.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto">
              <button
                onClick={() => scrollToSection('demo-form')}
                className="w-full sm:w-auto bg-[#FF6B00] hover:bg-orange-600 text-white text-[16px] font-bold px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#FF6B00]/30 cursor-pointer flex items-center justify-center gap-2.5 border-t border-l border-white/30"
              >
                <span>Book a Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('workflow')}
                className="w-full sm:w-auto bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] text-[16px] font-semibold px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore the Ecosystem</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Highlights Pills */}
            <div className="pt-10 flex flex-wrap justify-center gap-2.5 max-w-4xl">
              {[
                { name: 'QR Ordering', icon: QrCode },
                { name: 'Kitchen KOT', icon: ChefHat },
                { name: 'Waiter Coordination', icon: Users },
                { name: 'Recipe Inventory', icon: Boxes },
                { name: 'CRM & Loyalty', icon: Sparkles },
                { name: 'Real-Time Analytics', icon: TrendingUp },
              ].map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.name}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111622]/90 border border-white/[0.08] text-[13px] font-semibold text-slate-300 hover:border-[#FF6B00]/40 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{pill.name}</span>
                  </div>
                );
              })}
            </div>

            {/* ==================================================
                HERO INTERACTIVE CONNECTED WORKFLOW CANVAS
                ================================================== */}
            <div className="mt-16 w-full max-w-5xl relative z-10 bg-[#0B0F17]/90 border border-white/[0.1] rounded-3xl p-6 sm:p-10 text-left shadow-2xl backdrop-blur-xl">
              
              {/* Window Titlebar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-300 font-mono tracking-wider ml-2">
                    ORDIO UNIFIED ENGINE • NODE NETWORK
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[12px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    ALL OUTLETS SYNCED
                  </span>
                </div>
              </div>

              {/* Central Active Node Card */}
              <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#FF6B00]/15 via-slate-900/80 to-blue-500/10 border border-[#FF6B00]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 shrink-0">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FF6B00] uppercase font-mono">Live Inbound Event</span>
                      <span className="text-xs text-slate-400">• Table 04</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-0.5">Order #402 Fired Automatically</h3>
                    <p className="text-sm text-slate-300 mt-1">
                      1x Truffle Burger (No Onions), 2x Carbonara • Total: ₹1,240.00
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-slate-400">Processing Time</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    0.42s
                  </span>
                </div>
              </div>

              {/* 4 Multi-Channel Sinks Triggered by Event */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Channel 1: Kitchen Display */}
                <div className="bg-[#070A10] border border-white/[0.08] rounded-2xl p-5 hover:border-[#FF6B00]/60 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      KDS #1
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">Kitchen Display</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    KOT ticket routed to Hot Line with audible alert chime.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-amber-400">Preparing (12m)</span>
                  </div>
                </div>

                {/* Channel 2: Floor Waiter */}
                <div className="bg-[#070A10] border border-white/[0.08] rounded-2xl p-5 hover:border-[#FF6B00]/60 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      STAFF #3
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">Waiter Coordination</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Assigned waiter mobile notified for table service.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
                    <span className="text-slate-400">Table Map</span>
                    <span className="font-bold text-blue-400">Active • Table 4</span>
                  </div>
                </div>

                {/* Channel 3: Inventory Deduction */}
                <div className="bg-[#070A10] border border-white/[0.08] rounded-2xl p-5 hover:border-[#FF6B00]/60 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      STOCK
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">Recipe Deduction</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Raw material ledger adjusted automatically per recipe.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
                    <span className="text-slate-400">Stock Impact</span>
                    <span className="font-bold text-purple-400">-1 Wagyu, -2 Pasta</span>
                  </div>
                </div>

                {/* Channel 4: CRM & Revenue */}
                <div className="bg-[#070A10] border border-white/[0.08] rounded-2xl p-5 hover:border-[#FF6B00]/60 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded">
                      GROWTH
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">CRM & Analytics</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Guest profile updated with spend & loyalty points.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs">
                    <span className="text-slate-400">Loyalty Tier</span>
                    <span className="font-bold text-emerald-400">+124 Pts (Gold)</span>
                  </div>
                </div>

              </div>

              {/* Status Bar */}
              <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> Real-time WebSocket Mesh</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF6B00]" /> Zero Third-Party Hardware Lock-in</span>
                </div>
                <span>REST API + SOCKET.IO SYNCED</span>
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            SCROLL STORYTELLING / TEXT HIGHLIGHT SECTION
            ================================================== */}
        <section className="relative py-28 md:py-36 px-6 bg-[#07090E] border-t border-white/[0.06] overflow-hidden flex items-center justify-center">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span className="text-[12px] font-bold uppercase tracking-widest text-slate-300 font-mono">
                The Connected Principle
              </span>
            </div>

            <ScrollHighlightText
              text="From the moment a customer scans the QR code to the moment the order reaches the kitchen, every part of your restaurant works together."
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-inter-tight leading-[1.25] sm:leading-[1.18] tracking-tight max-w-4xl mx-auto"
              dimColor="rgba(255, 255, 255, 0.18)"
              highlightColor="#FFFFFF"
              accentWordColor="#FF6B00"
              accentWords={["QR", "code", "kitchen,", "works", "together."]}
            />
          </div>
        </section>


        {/* ==================================================
            SECTION 3 — THE CONNECTED WORKFLOW (Horizontal Pipeline)
            ================================================== */}

        <section id="workflow" className="py-24 px-6 bg-[#090C13] border-y border-white/[0.08] relative">
          <div className="max-w-[1280px] mx-auto text-center">
            
            <div className="max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                The Operational Loop
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-inter-tight">
                How the Connected Operating System Works
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                A continuous, automated chain reaction from customer arrival to final revenue reporting.
              </p>
            </div>

            {/* 5-Step Connected Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {[
                {
                  step: '01',
                  title: 'Guest Scans QR',
                  desc: 'Diners scan table QR code. Digital menu opens instantly without app downloads.',
                  icon: QrCode,
                  tag: 'Zero Friction'
                },
                {
                  step: '02',
                  title: 'Order & Customise',
                  desc: 'Guests choose items, dietary tags, chef instructions, and send orders in 1-tap.',
                  icon: ShoppingBag,
                  tag: 'Instant Cart'
                },
                {
                  step: '03',
                  title: 'Kitchen Fired',
                  desc: 'KOT displays tickets categorized by prep line with audio notifications.',
                  icon: ChefHat,
                  tag: 'Live KDS'
                },
                {
                  step: '04',
                  title: 'Floor Coordination',
                  desc: 'Waiters track table statuses, food readiness, and customer assistance calls.',
                  icon: Users,
                  tag: 'Synced Floor'
                },
                {
                  step: '05',
                  title: 'Ledger & Inventory',
                  desc: 'Payment settlement automatically deducts raw stock and credits loyalty points.',
                  icon: TrendingUp,
                  tag: 'Auto-Reconcile'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative bg-[#0E121B] border border-white/[0.08] rounded-2xl p-6 text-left hover:border-[#FF6B00]/60 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] group-hover:bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold font-mono text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                      {item.tag}
                    </div>
                    {index < 4 && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* ==================================================
            SECTION 4 — INTERACTIVE MODULE EXPLORER (OTT-Style Carousel)
            ================================================== */}
        <section id="capabilities" className="py-28 px-6 bg-[#07090E]">
          <div className="max-w-[1280px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                Product Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-inter-tight">
                Deep Dive into Ordio's Core Modules
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                Explore every layer engineered for high-velocity restaurant operations.
              </p>
            </div>

            {/* Tab Navigation Pill Selector with OTT indicators */}
            <div className="flex flex-wrap justify-center items-center gap-2.5 mb-12">
              {MODULE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/30 border-t border-l border-white/30 scale-[1.02]'
                        : 'bg-[#111622] text-slate-400 hover:text-white hover:bg-[#161D2C] border border-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Carousel Showcase Card with Horizontal Sliding Track & Minimalist OTT Chevrons */}
            <div className="relative group/card">
              
              {/* Main Module Content Card Container */}
              <div className="bg-[#0B0F17] border border-white/[0.1] rounded-3xl shadow-2xl relative overflow-hidden min-h-[480px]">
                
                {/* Minimal OTT Chevron Left Arrow (Hidden by default, smooth fade in/out on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevModule();
                  }}
                  aria-label="Previous Feature"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-all duration-300 p-2 text-white/50 hover:text-white hover:scale-110 active:scale-95 cursor-pointer border-none bg-transparent outline-none select-none"
                >
                  <ChevronLeft className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition-all" />
                </button>

                {/* Minimal OTT Chevron Right Arrow (Hidden by default, smooth fade in/out on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextModule();
                  }}
                  aria-label="Next Feature"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover/card:opacity-100 transition-all duration-300 p-2 text-white/50 hover:text-white hover:scale-110 active:scale-95 cursor-pointer border-none bg-transparent outline-none select-none"
                >
                  <ChevronRight className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition-all" />
                </button>

                {/* Horizontal Sliding Track (600ms OTT Transition) */}
                <div
                  className="flex transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] w-full items-stretch"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  
                  {/* SLIDE 1: QR DIGITAL MENU */}
                  <div className="w-full shrink-0 p-8 sm:p-12 px-10 sm:px-16 lg:px-20 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
                      <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider font-mono">
                          Guest Experience Layer
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                          Frictionless Digital Menus with Instant Table Ordering
                        </h3>
                        <p className="text-slate-300 text-base leading-relaxed">
                          Transform every dining table into an interactive ordering station. Customers simply scan the QR code with their mobile camera to browse rich categorized menus, filter vegetarian/non-vegetarian dishes, add special instructions, and checkout effortlessly.
                        </p>
                        <div className="space-y-3 pt-2">
                          {[
                            'Zero app downloads or registrations required for diners',
                            'Real-time item availability toggles and price updates',
                            'Rich food imagery, chef badges, and calorie/ingredient notes',
                            'Integrated UPI deep linking & instant card checkout'
                          ].map((pt) => (
                            <div key={pt} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-6 flex justify-center">
                        <div className="w-full max-w-sm bg-[#111622] border border-white/[0.12] rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="text-xs font-bold text-white font-mono">TABLE 04 • LIVE MENU</span>
                            </div>
                            <span className="text-[11px] text-[#FF6B00] font-bold">12:30 PM</span>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-sm font-bold text-white">Truffle Veggie Pizza</span>
                                </div>
                                <span className="text-xs text-slate-400">Crispy thin crust, wild mushrooms</span>
                              </div>
                              <span className="text-sm font-bold font-mono text-[#FF6B00]">₹480</span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-500" />
                                  <span className="text-sm font-bold text-white">Smoked Chicken Burger</span>
                                </div>
                                <span className="text-xs text-slate-400">Brioche bun, cheddar melt</span>
                              </div>
                              <span className="text-sm font-bold font-mono text-[#FF6B00]">₹390</span>
                            </div>
                            <div className="p-4 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-between text-xs">
                              <span className="font-bold text-white">Cart Total (2 Items)</span>
                              <span className="font-bold font-mono text-[#FF6B00] text-sm">₹870.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 2: KITCHEN DISPLAY KDS */}
                  <div className="w-full shrink-0 p-8 sm:p-12 px-10 sm:px-16 lg:px-20 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
                      <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                          Kitchen Operations Layer
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                          Live Kitchen Order Tickets with Real-Time Audio Engine
                        </h3>
                        <p className="text-slate-300 text-base leading-relaxed">
                          Eliminate messy paper slips and missed customizations. Ordio's real-time KOT feed organizes incoming orders into Kanban columns: New, Preparing, and Ready. An automated Web Audio chime notifies head chefs the instant a ticket is placed.
                        </p>
                        <div className="space-y-3 pt-2">
                          {[
                            'Automatic Synthesized Web Audio API dual-tone order chime',
                            'Color-coded order elapsed time timers (amber/red alert zones)',
                            'Special chef instruction highlights (e.g. No Onions, Extra Spicy)',
                            '1-Tap status progression: Accept → Mark Ready → Serve'
                          ].map((pt) => (
                            <div key={pt} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-6">
                        <div className="bg-[#111622] border border-white/[0.12] rounded-3xl p-5 shadow-2xl space-y-3">
                          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                              <Flame className="w-4 h-4" /> KITCHEN ORDER TICKETS (LIVE)
                            </span>
                            <span className="text-xs font-mono text-slate-400">3 Tickets Active</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="font-bold text-white">#ORD-104</span>
                                <span className="text-amber-400 font-bold">2m ago</span>
                              </div>
                              <div className="text-xs text-slate-200 font-semibold">Table 02 • Dine-in</div>
                              <div className="text-xs text-slate-400 border-t border-white/[0.08] pt-2">
                                • 1x Margherita Pizza<br/>
                                • 1x Garlic Bread
                              </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="font-bold text-white">#ORD-105</span>
                                <span className="text-blue-400 font-bold">Just now</span>
                              </div>
                              <div className="text-xs text-slate-200 font-semibold">Table 08 • Dine-in</div>
                              <div className="text-xs text-slate-400 border-t border-white/[0.08] pt-2">
                                • 2x Cold Brew Latte<br/>
                                • 1x Tiramisu Cup
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 3: FLOOR & WAITERS */}
                  <div className="w-full shrink-0 p-8 sm:p-12 px-10 sm:px-16 lg:px-20 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
                      <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                          Floor Staff Coordination Layer
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                          Passcode-Protected Mobile Staff Portal & Live Floor Matrix
                        </h3>
                        <p className="text-slate-300 text-base leading-relaxed">
                          Equip floor staff with an ultra-fast mobile interface. Waiters can take manual walk-in POS orders, manage table occupancy, receive instant guest service requests, and settle bills with split payment controls.
                        </p>
                        <div className="space-y-3 pt-2">
                          {[
                            '4-Digit PIN passcode lock for secure waiter profile switching',
                            'Live visual floor map matrix (Idle, Ordering, Eating, Bill Requested)',
                            'Instant buzzer notifications when guests request water or the bill',
                            'Offline-resilient order entry and thermal printer invoice generation'
                          ].map((pt) => (
                            <div key={pt} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-6">
                        <div className="bg-[#111622] border border-white/[0.12] rounded-3xl p-6 shadow-2xl">
                          <div className="flex justify-between items-center border-b border-white/[0.08] pb-3 mb-4">
                            <span className="text-xs font-bold text-blue-400 font-mono">MAIN HALL FLOOR STATUS</span>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 font-bold">
                              Table 4 Calling Staff
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { t: 'T1', s: 'Available', c: 'text-slate-400 bg-white/[0.03] border-white/[0.08]' },
                              { t: 'T2', s: 'Dining', c: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                              { t: 'T3', s: 'Available', c: 'text-slate-400 bg-white/[0.03] border-white/[0.08]' },
                              { t: 'T4', s: 'Service Alert', c: 'text-red-400 bg-red-500/15 border-red-500/40 animate-pulse' },
                              { t: 'T5', s: 'Ordering', c: 'text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/30' },
                              { t: 'T6', s: 'Bill Paid', c: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
                            ].map((tbl) => (
                              <div key={tbl.t} className={`p-4 rounded-xl border text-center ${tbl.c}`}>
                                <div className="text-lg font-bold text-white">{tbl.t}</div>
                                <div className="text-[11px] font-medium mt-1">{tbl.s}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 4: RECIPE INVENTORY */}
                  <div className="w-full shrink-0 p-8 sm:p-12 px-10 sm:px-16 lg:px-20 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
                      <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                          Supply Chain & Recipe Layer
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                          Automated Recipe Deductions & Supplier Procurement
                        </h3>
                        <p className="text-slate-300 text-base leading-relaxed">
                          Connect your menu directly to your kitchen pantry. When an order is settled, Ordio's Deduction Queue Service calculates raw ingredient quantities and deducts them automatically, maintaining real-time food cost percentages and wastage logs.
                        </p>
                        <div className="space-y-3 pt-2">
                          {[
                            'Automatic background stock deduction upon order payment settlement',
                            'Live food cost percentage (COGS) & gross margin analytics',
                            'Low stock threshold alerts with 1-click supplier purchase orders',
                            'Inter-branch stock transfer approval workflows for restaurant groups'
                          ].map((pt) => (
                            <div key={pt} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-6">
                        <div className="bg-[#111622] border border-white/[0.12] rounded-3xl p-5 shadow-2xl space-y-3">
                          <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                            <span className="text-xs font-bold text-purple-400 font-mono">RAW MATERIAL STOCK WATCH</span>
                            <span className="text-xs text-emerald-400 font-mono">COGS: 28.4%</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { item: 'Wagyu Beef Patties', stock: '48 pcs', status: 'Optimal', color: 'text-emerald-400' },
                              { item: 'Mozzarella Cheese (Block)', stock: '3.2 kg', status: 'Low Stock', color: 'text-amber-400' },
                              { item: 'Arborio Risotto Rice', stock: '14.5 kg', status: 'Optimal', color: 'text-emerald-400' },
                              { item: 'Truffle Infused Olive Oil', stock: '0.8 L', status: 'Reorder Alert', color: 'text-red-400' },
                            ].map((stk) => (
                              <div key={stk.item} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
                                <span className="font-semibold text-white">{stk.item}</span>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-300">{stk.stock}</span>
                                  <span className={`font-bold ${stk.color}`}>{stk.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 5: EXECUTIVE ANALYTICS */}
                  <div className="w-full shrink-0 p-8 sm:p-12 px-10 sm:px-16 lg:px-20 flex items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
                      <div className="lg:col-span-6 space-y-6">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                          Business Intelligence Layer
                        </span>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                          Executive Financial Dashboards & Guest Lifetime Value (LTV)
                        </h3>
                        <p className="text-slate-300 text-base leading-relaxed">
                          Make informed growth decisions with comprehensive analytics. Track hourly order distributions, average order value (AOV), top-performing dishes, and multi-outlet sales reports from any web browser.
                        </p>
                        <div className="space-y-3 pt-2">
                          {[
                            '8 Specialized analytics tabs (Sales, Menu, Orders, Loyalty, Financial)',
                            'Customer RFM segmentation (Recency, Frequency, Monetary spend)',
                            'Automated birthday & anniversary WhatsApp celebration rewards',
                            'Passcode-protected privacy lock for sensitive financial numbers'
                          ].map((pt) => (
                            <div key={pt} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lg:col-span-6">
                        <div className="bg-[#111622] border border-white/[0.12] rounded-3xl p-6 shadow-2xl space-y-4">
                          <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                            <span className="text-xs font-bold text-emerald-400 font-mono">TODAY'S EXECUTIVE SUMMARY</span>
                            <span className="text-xs text-slate-400 font-mono">All 3 Outlets</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <div className="text-xs text-slate-400">Total Net Revenue</div>
                              <div className="text-2xl font-bold font-mono text-white mt-1">₹84,250</div>
                              <div className="text-[11px] text-emerald-400 mt-1 font-semibold">↑ +18.4% vs last week</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <div className="text-xs text-slate-400">Average Order Value</div>
                              <div className="text-2xl font-bold font-mono text-white mt-1">₹742</div>
                              <div className="text-[11px] text-emerald-400 mt-1 font-semibold">↑ +8.1% AOV</div>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium">Repeat Guest Rate</span>
                            <span className="font-bold text-emerald-400 font-mono">41.2% (128 Diners)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>


              {/* Bottom OTT Controls Strip (Mobile/Tablet Navigation & Dots Indicator) */}
              <div className="flex items-center justify-between mt-6 px-2">
                <button
                  onClick={prevModule}
                  aria-label="Previous Slide"
                  className="flex md:hidden items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111622] border border-white/[0.1] text-xs font-bold text-slate-300 hover:text-white hover:border-[#FF6B00] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                {/* OTT Progress Dots / Indicators */}
                <div className="flex items-center gap-2 mx-auto">
                  {MODULE_TABS.map((tab, idx) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          isActive
                            ? 'w-8 h-2 bg-[#FF6B00] shadow-md shadow-[#FF6B00]/40'
                            : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={nextModule}
                  aria-label="Next Slide"
                  className="flex md:hidden items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111622] border border-white/[0.1] text-xs font-bold text-slate-300 hover:text-white hover:border-[#FF6B00] transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </section>



        {/* ==================================================
            SECTION 5 — DISCONNECTED VS CONNECTED COMPARISON
            ================================================== */}
        <section className="py-24 px-6 bg-[#090C13] border-y border-white/[0.08]">
          <div className="max-w-[1280px] mx-auto">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono">
                The Disconnected Cost
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-inter-tight">
                Why Legacy Point-of-Sale Systems Fall Short
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                Traditional restaurants operate in isolated silos, causing revenue leakage and service delays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              
              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Long Table Wait Times</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Guests wait 10 to 15 minutes just to receive printed menus, place orders, or wave down busy waitstaff during peak rush hours.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Manual Order Transcription Errors</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Verbal order mistakes between waiters and kitchen staff cause food wastage, preparation delays, and dissatisfied diners.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Slow Checkout Bottlenecks</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Hunting for card machines or counting cash delays table turnovers, reducing the total seating capacity of your restaurant.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Heavy Staff Dependency</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  High staff turnover creates service bottlenecks on the floor whenever trained team members are unavailable.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <PackageX className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Unlinked Inventory Spoilage</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Menu sales unlinked to ingredient recipes cause unexpected stockouts during busy weekends and untracked food waste.
                </p>
              </div>

              <div className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-7 space-y-4 hover:border-red-500/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Zero Repeat Guest Insights</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Without an automated directory, restaurants stay blind to customer visit patterns, leaving repeat diner retention to chance.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            SECTION 6 — THE ORDIO ADVANTAGE (Bento Grid)
            ================================================== */}
        <section id="why-ordio" className="py-28 px-6 bg-[#07090E]">
          <div className="max-w-[1280px] mx-auto text-left">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                Engineered for Performance
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-inter-tight">
                Why Operators Choose Ordio
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                A unified architecture replacing 5 different disconnected software tools.
              </p>
            </div>

            {/* Bento Grid Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Bento Card 1: Multi-Outlet Brand SaaS */}
              <div className="md:col-span-7 bg-[#0E121B] border border-white/[0.08] rounded-3xl p-8 space-y-5 hover:border-[#FF6B00]/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-[#FF6B00] uppercase font-bold">Multi-Outlet Architecture</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Single Brand, Unlimited Outlets</h3>
                  <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                    Operate multiple restaurant branches from a centralized administrative control center. Synchronize master recipes, compare cross-outlet revenue performance, and manage staff roles with role-based permissions.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Check className="w-4 h-4 text-[#FF6B00]" /> Consolidated Brand CRM Directory
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Check className="w-4 h-4 text-[#FF6B00]" /> Inter-Branch Stock Transfers
                  </div>
                </div>
              </div>

              {/* Bento Card 2: Passcode Lock & Security */}
              <div className="md:col-span-5 bg-[#0E121B] border border-white/[0.08] rounded-3xl p-8 space-y-5 hover:border-[#FF6B00]/50 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-blue-400 uppercase font-bold">Security Engine</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Passcode Lock &amp; RBAC Gate</h3>
                  <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                    Protect sensitive revenue metrics, subscription billing, and backend configuration behind a restaurant passcode gate with automated reset request approvals.
                  </p>
                </div>
                <div className="pt-3 border-t border-white/[0.06] text-xs font-mono text-slate-400">
                  JWT TOKENS • STRICT ROLE GUARDS • PIN PROTECTED
                </div>
              </div>

              {/* Bento Card 3: Automated Invoicing */}
              <div className="md:col-span-4 bg-[#0E121B] border border-white/[0.08] rounded-3xl p-8 space-y-4 hover:border-[#FF6B00]/50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">GST &amp; Invoicing Engine</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Automatic invoice generation with customizable series (`INV-2026`), CGST/SGST splitting, and PDF export for accounting.
                </p>
              </div>

              {/* Bento Card 4: WhatsApp Integration */}
              <div className="md:col-span-4 bg-[#0E121B] border border-white/[0.08] rounded-3xl p-8 space-y-4 hover:border-[#FF6B00]/50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-green-500/15 text-green-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Meta WhatsApp Integration</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Direct WhatsApp Cloud API webhook connection for automated celebration coupons, order alerts, and targeted broadcast messaging.
                </p>
              </div>

              {/* Bento Card 5: Instant Setup */}
              <div className="md:col-span-4 bg-[#0E121B] border border-white/[0.08] rounded-3xl p-8 space-y-4 hover:border-[#FF6B00]/50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Zero Hardware Lock-in</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Works on any tablet, mobile phone, iPad, or desktop computer. No proprietary expensive point-of-sale terminals required.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            SECTION 7 — RAPID ONBOARDING TIMELINE
            ================================================== */}
        <section id="how-it-works" className="py-24 px-6 bg-[#090C13] border-y border-white/[0.08]">
          <div className="max-w-[1280px] mx-auto text-center">
            
            <div className="max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                Rapid Deployment
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-inter-tight">
                Launch in Less Than 30 Minutes
              </h2>
              <p className="text-base sm:text-lg text-slate-400">
                Getting started with Ordio requires zero complicated on-premise hardware installation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
              {[
                { step: '01', title: 'Register Outlet', desc: 'Create your restaurant profile and customize currency, tax rates, and brand slug.' },
                { step: '02', title: 'Import Menu', desc: 'Upload dishes, prices, veg/non-veg flags, chef modifiers, and food photography.' },
                { step: '03', title: 'Generate QRs', desc: 'Configure tables and download high-resolution QR stickers for table placement.' },
                { step: '04', title: 'Open Kitchen Live', desc: 'Launch KDS on any kitchen screen with active audio chime notifications.' },
                { step: '05', title: 'Track & Grow', desc: 'Review real-time sales metrics, customer profiles, and automated stock deductions.' },
              ].map((st, i) => (
                <div key={st.step} className="bg-[#0E121B] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF6B00]/50 transition-all">
                  <div>
                    <span className="px-2.5 py-1 bg-[#FF6B00]/15 text-[#FF6B00] text-xs font-bold font-mono rounded-md uppercase inline-block mb-4">
                      Step {st.step}
                    </span>
                    <h3 className="text-lg font-bold text-white">{st.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">{st.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
                    PHASE {i + 1}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ==================================================
            SECTION 8 — BOOK A DEMO LEAD CAPTURE SECTION
            ================================================== */}
        <section id="demo-form" className="py-28 px-6 bg-[#07090E]">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-[#0B0F17] border border-white/[0.12] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
              
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,107,0,0.15)_0%,transparent_70%)] pointer-events-none blur-[80px]" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left items-center relative z-10">
                
                {/* Left Information Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-xs font-bold text-[#FF6B00] uppercase font-mono">
                    Personalized Onboarding
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight leading-tight">
                    Experience Ordio Tailored for Your Restaurant
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed">
                    Schedule a 30-minute interactive walkthrough. Our hospitality solutions engineers will demonstrate live QR ordering, kitchen display workflows, and multi-outlet inventory management tailored to your menu.
                  </p>

                  <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0" />
                      <span>Free customized menu catalog migration</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0" />
                      <span>Live staff training and kitchen KDS configuration</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-white">
                      <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0" />
                      <span>Zero setup fees • 14-Day evaluation period</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Form Column */}
                <div className="lg:col-span-7 bg-[#111622] border border-white/[0.1] rounded-2xl p-6 sm:p-10 shadow-xl">
                  {formSubmitted ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Demo Request Received!</h3>
                      <p className="text-slate-300 text-sm max-w-md mx-auto">
                        Thank you, <span className="text-white font-semibold">{formData.name}</span>. Our hospitality team will connect with you at <span className="text-white font-semibold">{formData.phone}</span> within 2 business hours.
                      </p>
                      <button
                        onClick={() => setFormSubmitted(false)}
                        className="text-xs text-[#FF6B00] hover:underline font-bold mt-4 inline-block"
                      >
                        Submit another request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Aditya Sharma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[#080B11] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-[#080B11] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Work Email *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="owner@restaurant.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-[#080B11] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Restaurant / Brand Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="The Rustic Kitchen"
                            value={formData.restaurantName}
                            onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                            className="w-full px-4 py-3 bg-[#080B11] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          City / Outlets Location *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Mumbai, Bengaluru, Delhi NCR"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-[#080B11] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-500 hover:to-[#FF6B00] text-white font-bold text-base py-4 rounded-xl transition-all shadow-xl shadow-[#FF6B00]/25 cursor-pointer mt-2 border-t border-l border-white/25 flex items-center justify-center gap-2"
                      >
                        <span>Confirm Demo Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>


        {/* ==================================================
            SECTION 9 — FREQUENTLY ASKED QUESTIONS (Accordion)
            ================================================== */}
        <section id="faq" className="py-24 px-6 bg-[#090C13] border-t border-white/[0.08]">
          <div className="max-w-[840px] mx-auto">
            
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                Clarifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-inter-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Everything you need to know about adopting the Ordio restaurant operating system.
              </p>
            </div>

            <div className="space-y-4 text-left">
              {[
                {
                  q: 'How does QR Contactless Ordering work for diners?',
                  a: 'Each table has a dedicated QR code sticker. Guests scan it with their default mobile camera to open your responsive digital menu, customize items with chef instructions, and send orders directly to your kitchen dashboard—with zero app download required.'
                },
                {
                  q: 'Do customers need to download an app?',
                  a: 'No app download is needed. The digital menu runs in Safari, Google Chrome, and all standard mobile browsers with instant performance.'
                },
                {
                  q: 'Can waiters take manual orders or print physical bills?',
                  a: 'Yes. Floor staff can access the passcode-protected Waiter Portal to punch in walk-in POS orders, reassign tables, print KOT tickets on thermal printers, and settle bills with cash or card.'
                },
                {
                  q: 'How does automated recipe inventory deduction work?',
                  a: 'You can link each menu dish to ingredient quantities in the Recipe Manager. Whenever an order is marked as Paid, Ordio automatically deducts the raw ingredients from your current pantry stock.'
                },
                {
                  q: 'Can I manage multi-outlet franchise locations from one account?',
                  a: 'Yes. Ordio includes brand-level multi-outlet management controls allowing you to configure menus, staff permissions, inter-branch stock transfers, and compare revenue metrics across all locations.'
                },
                {
                  q: 'What hardware is required to run Ordio?',
                  a: 'Ordio is hardware-agnostic and runs smoothly on standard iPads, Android tablets, laptops, mobile phones, and thermal receipt printers.'
                },
                {
                  q: 'How fast can our restaurant go live?',
                  a: 'Initial restaurant profile creation, menu import, and table QR code generation take less than 30 minutes. Our team also provides full catalog migration support.'
                }
              ].map((item, idx) => {
                const isOpen = !!faqOpen[idx];
                return (
                  <div
                    key={idx}
                    className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0E121B] transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-6 text-base sm:text-lg font-bold text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#FF6B00] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/[0.06] pt-4">
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
            SECTION 10 — FINAL CALL TO ACTION
            ================================================== */}
        <section className="py-28 px-6 bg-[#07090E] text-center relative overflow-hidden border-t border-white/[0.08]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,107,0,0.15)_0%,transparent_70%)] pointer-events-none blur-[90px]" />
          
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight font-inter-tight">
              Your Restaurant Already Runs. <br/>
              <span className="text-[#FF6B00]">Ordio Helps It Run at Scale.</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Join the new era of connected hospitality. Scan, order, coordinate, and scale with one unified operating system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection('demo-form')}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-500 hover:to-[#FF6B00] text-white text-base font-bold px-10 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#FF6B00]/30 cursor-pointer flex items-center justify-center gap-2 border-t border-l border-white/30"
              >
                <span>Schedule Your Free Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.12] text-base font-semibold px-8 py-4 rounded-xl transition-all text-center"
              >
                Register Restaurant
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ==================================================
          SECTION 11 — FOOTER
          ================================================== */}
      <footer className="bg-[#05070B] text-white py-16 border-t border-white/[0.08] relative z-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left mb-12">
            
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  ORD<span className="text-[#FF6B00]">IO</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The connected restaurant operating system engineering the future of high-velocity hospitality.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ALL CLOUD SERVICES OPERATIONAL</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Product</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors cursor-pointer">QR Digital Menu</button></li>
                <li><button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors cursor-pointer">Kitchen KDS</button></li>
                <li><button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors cursor-pointer">Waiter Portal</button></li>
                <li><button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors cursor-pointer">Recipe Inventory</button></li>
                <li><button onClick={() => scrollToSection('capabilities')} className="hover:text-white transition-colors cursor-pointer">Executive Analytics</button></li>
              </ul>
            </div>

            {/* Col 3: Resources & Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Resources</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Documentation &amp; FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><Link to="/subscription" className="hover:text-white transition-colors">Plans &amp; Pricing</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Owner Login</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Legal</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">
              ORD<span className="text-[#FF6B00]">IO</span> — The Connected Restaurant Operating System.
            </span>
            <span>© 2026 ORDIO. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live orders dynamic mockup states for premium micro-interactions
  const [liveOrders, setLiveOrders] = useState([
    { name: 'Truffle Tagliatelle', status: 'Preparing', bg: 'bg-[#b4cdb8]', text: 'text-[#0b2013]' },
    { name: 'Aged Wagyu Ribeye', status: 'Pending', bg: 'bg-[#fe8770]', text: 'text-[#741f11]' }
  ]);

  // Handle active status simulation on KDS widget
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOrders(prev => {
        const next = [...prev];
        if (next[1].status === 'Pending') {
          next[1] = { name: 'Aged Wagyu Ribeye', status: 'Preparing', bg: 'bg-[#b4cdb8]', text: 'text-[#0b2013]' };
          next[0] = { name: 'Truffle Tagliatelle', status: 'Ready', bg: 'bg-[#d0e9d4]', text: 'text-[#0b2013]' };
        } else if (next[0].status === 'Ready') {
          next[0] = { name: 'Truffle Tagliatelle', status: 'Served', bg: 'bg-[#cbdbf5]', text: 'text-[#0b1c30]' };
          next[1] = { name: 'Aged Wagyu Ribeye', status: 'Ready', bg: 'bg-[#d0e9d4]', text: 'text-[#0b2013]' };
        } else {
          next[0] = { name: 'Truffle Tagliatelle', status: 'Preparing', bg: 'bg-[#b4cdb8]', text: 'text-[#0b2013]' };
          next[1] = { name: 'Aged Wagyu Ribeye', status: 'Pending', bg: 'bg-[#fe8770]', text: 'text-[#741f11]' };
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Dynamically load Google Fonts and Material Symbols Outlined icons on component mount
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const iconLink = document.createElement('link');
    iconLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    iconLink.rel = 'stylesheet';
    document.head.appendChild(iconLink);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(iconLink);
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative bg-[#FFF8F0] text-[#0b1c30] font-sans antialiased selection:bg-[#061b0e]/10 selection:text-[#061b0e] overflow-x-hidden">
      {/* Scoped CSS Styles for Stitch Custom Tokens */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
        }
        .glass-card-hover {
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .glass-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px -12px rgba(27, 48, 34, 0.12);
            border-color: rgba(255, 255, 255, 0.6);
        }
        .timeline-line {
            background: linear-gradient(to bottom, #d0e9d4 0%, #4d6453 50%, #d0e9d4 100%);
            width: 2px;
        }
        .tracking-tight-custom {
            letter-spacing: -0.03em;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        .font-headline-md { font-family: 'Inter', sans-serif; }
        .font-display-lg-mobile { font-family: 'Inter', sans-serif; }
        .font-label-sm { font-family: 'JetBrains Mono', monospace; }
        .font-body-md { font-family: 'Inter', sans-serif; }
        .font-body-lg { font-family: 'Inter', sans-serif; }
        .font-display-lg { font-family: 'Inter', sans-serif; }
        .font-button { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/80 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-10 flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#061b0e] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
            <span className="font-headline-md text-2xl font-bold tracking-tight text-[#061b0e]">Ordio</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-[#061b0e] font-semibold hover:text-[#061b0e] transition-colors duration-200" href="#">Solutions</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e] transition-colors duration-200" href="#features">Features</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e] transition-colors duration-200" href="#pricing">Pricing</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e] transition-colors duration-200" href="#company">Company</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="font-button text-[14px] font-semibold px-6 py-2.5 rounded-full border border-[#061b0e]/10 text-[#061b0e] hover:bg-[#061b0e]/5 transition-all text-center">
              Log In
            </Link>
            <Link to="/register" className="font-button text-[14px] font-semibold px-6 py-2.5 rounded-full bg-[#061b0e] text-white shadow-lg hover:opacity-90 active:scale-95 transition-all text-center">
              Book Demo
            </Link>
            
            {/* Hamburger menu button for mobile responsiveness */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#061b0e] hover:bg-[#061b0e]/5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100 border-b border-[#c3c8c1]/35 bg-[#FFF8F0]' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="px-6 py-4 flex flex-col gap-4">
            <a className="text-[#434843] font-semibold hover:text-[#061b0e]" href="#" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e]" href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e]" href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a className="text-[#434843] font-medium hover:text-[#061b0e]" href="#company" onClick={() => setMobileMenuOpen(false)}>Company</a>
          </div>
        </div>
      </header>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[795px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0"></div>
          <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10 py-12 lg:py-0">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d0e9d4] text-[#0b2013] mb-8">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="font-label-sm text-[12px] font-medium uppercase tracking-widest">Next-Gen POS Ecosystem</span>
              </div>
              <h1 className="font-display-lg text-[48px] font-bold tracking-tight-custom text-[#061b0e] leading-[1.1] mb-4">
                Run Your Restaurant <br/>
                <span className="text-[#1b2e3a]">Smarter.</span> Faster. Better.
              </h1>
              <p className="font-body-lg text-[18px] text-[#434843] mb-8 leading-relaxed">
                The world’s most sophisticated operating system for modern hospitality. Unified commerce, guest intelligence, and back-of-house precision—all in one elegant interface.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="font-button text-[14px] font-semibold px-8 py-4 rounded-full bg-[#061b0e] text-white shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                  Book Demo <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link to="/register" className="font-button text-[14px] font-semibold px-8 py-4 rounded-full glass-card text-[#061b0e] hover:bg-white/50 transition-all text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
              {/* Glassmorphic Dashboard Mockup */}
              <div className="glass-card rounded-3xl p-4 w-full max-w-[420px] relative animate-float shadow-2xl">
                <div className="bg-white/40 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ba1a1a] animate-pulse"></div>
                      <span className="font-label-sm text-[#061b0e] text-[12px]">LIVE ORDERS</span>
                    </div>
                    <span className="font-label-sm text-[#434843] text-[12px]">Table 14 • Live KOT</span>
                  </div>
                  <div className="space-y-3">
                    {liveOrders.map((order, idx) => (
                      <div key={idx} className="flex items-center justify-between transition-all duration-300">
                        <span className="font-body-md font-semibold text-[#0b1c30]">{order.name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full ${order.bg} ${order.text} font-label-sm text-[12px] font-bold shadow-sm`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Floating Widget */}
              <div className="absolute -bottom-10 left-0 lg:-left-10 glass-card rounded-2xl p-6 shadow-2xl hidden md:block border-l-4 border-[#061b0e]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#061b0e]/10 flex items-center justify-center text-[#061b0e]">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#061b0e]">+24%</div>
                    <div className="text-sm text-[#434843] font-medium">Table Turnover</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By & Stats */}
        <section className="py-8 bg-[#f8f9ff]/50 border-y border-[#c3c8c1]/20">
          <div className="max-w-[1440px] mx-auto px-10">
            <p className="text-center font-label-sm text-[#434843]/60 text-[12px] uppercase tracking-widest mb-8">Trusted by high-volume establishments</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale contrast-125 mb-8">
              <img className="h-8 md:h-12" alt="The Gilded Rose" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXCC5886gCX38O0bkHZMe_No1ZpcEALjLKFBXVw15cwRzG1WWp6Guj_FxyGxUh4ZHNrbBc7J5CO06PQ9OKgYalkIAAK3PuRBDWuGdvEDsi-dx8PGe2bzTbX5SIgMu8ISv4dUkY1O6S8GQVuGDx5Xp0_N8R7FsowqrUG00UDGNnpH0hwNHOd31rg5sNvzPptnu8U0WW0huRY47aGqpbymC_ky6Ds_uCN5aYJ72-UG_tuqjSiHjdhhed"/>
              <img className="h-8 md:h-12" alt="L'Avenue" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm4aJ7-F8Q6w71paW9OU3jJwpKP0W-tf7nGRRqNmFiyWw2h7uua0VhXijx_vfoy0EnPBpV9kd3Qj6ll9G5ZfVT2sXnu2HkW41uf4SfW3DcUYO9vnVknQaeEF2dxdL-qW2AfoF87A5KNEgkKfkYcb1LUjCp3XZ7wTrvW8bizrM6Pjx0hzw3QvjimuHrZ-o0AapsH6A7hP7axczV6WEqVwYHYSLT1j5lcrg8RqmBfAcfeJ7VmHUR9Mw8"/>
              <img className="h-8 md:h-12" alt="Velvet Noir" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4TOHnXExUs5s-4DW55MkVhhN80Ku3Q_olfOsx7PG1tTYeeo6kH-hJW2wACeAWEoDKveCXegklqHTh1tXVstcwH3n4uV9YYY9m_l_fdsWOYVhfkaDnGMqAdj1SayA8IKKZPfl_0BDP3q_a0KqwRqQr_EYLnA01_GBBq-6sP-W4XkKTEOai1nZIUHJuXiXtRJkNt6ZHBY61YO-zN38wafKL-nCqshgozU4h8eLsY-cFFEmPxcKgB9Pd"/>
              <img className="h-8 md:h-12" alt="Ember & Ash" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr0JZUs01YG5rBrDap7AFl2PvKJDW7crDwlpklLVP2t5OOv8PvoIOCK3SbIppX90TvDLk15o8_ooRdIwCcVHUXT2Rtt_6cqirkQuqWKQ5IurLfElqIE499i9UiwqrbQgI9BTbGZJEBy45e75js7h7BJcLJlOl4CHx_RtykbTLufanRxzad1BvTbpSq-_SG_1ZNZg0z1GXEX3SyTe9bA_FtxVmmTnGMRwL3LqF-xH9bt6TAYZWWkA-F"/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-8">
              <div>
                <div className="text-4xl font-bold text-[#061b0e] tracking-tight">35%</div>
                <div className="font-body-md text-[#434843] text-sm sm:text-base mt-1">Faster Processing</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#061b0e] tracking-tight">18%</div>
                <div className="font-body-md text-[#434843] text-sm sm:text-base mt-1">Ticket Size Increase</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#061b0e] tracking-tight">0%</div>
                <div className="font-body-md text-[#434843] text-sm sm:text-base mt-1">Downtime in 2023</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#061b0e] tracking-tight">2.5k+</div>
                <div className="font-body-md text-[#434843] text-sm sm:text-base mt-1">Global Venues</div>
              </div>
            </div>
          </div>
        </section>

        {/* The Ecosystem Timeline */}
        <section className="py-16 relative overflow-hidden" id="features">
          <div className="max-w-[1440px] mx-auto px-10">
            <div className="text-center mb-12">
              <h2 className="font-display-lg text-[48px] font-bold text-[#061b0e] mb-2 tracking-tight-custom">The Frictionless Flow</h2>
              <p className="text-body-lg text-[#434843] text-lg max-w-2xl mx-auto">One unified system that connects every touchpoint, from the first guest scan to your end-of-month reporting.</p>
            </div>
            <div className="relative mt-20 max-w-4xl mx-auto">
              {/* Central Line */}
              <div className="absolute left-1/2 top-0 bottom-0 timeline-line -translate-x-1/2 opacity-20 hidden md:block"></div>
              <div className="space-y-24 relative">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-1/2 md:text-right pr-0 md:pr-12 order-2 md:order-1">
                    <h3 className="text-2xl font-bold text-[#061b0e] mb-2">QR Scan & Order</h3>
                    <p className="text-[#434843]">Guests access high-fidelity menus and pay instantly from their table. No apps, no wait.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#061b0e] flex items-center justify-center text-white z-10 order-1 md:order-2 shrink-0 shadow-lg">
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </div>
                  <div className="md:w-1/2 pl-0 md:pl-12 order-3">
                    <div className="glass-card p-4 rounded-2xl w-full max-w-xs shadow-md">
                      <div className="bg-[#cbdbf5] rounded-lg h-32 w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#434843]">smartphone</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-1/2 order-3 md:order-1 flex justify-end pr-0 md:pr-12">
                    <div className="glass-card p-4 rounded-2xl w-full max-w-xs shadow-md">
                      <div className="bg-[#cbdbf5] rounded-lg h-32 w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#434843]">chef_hat</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#061b0e] flex items-center justify-center text-white z-10 order-1 md:order-2 shrink-0 shadow-lg">
                    <span className="material-symbols-outlined">chef_hat</span>
                  </div>
                  <div className="md:w-1/2 pl-0 md:pl-12 order-2 md:order-3">
                    <h3 className="text-2xl font-bold text-[#061b0e] mb-2">Smart KDS Routing</h3>
                    <p className="text-[#434843]">Orders flow directly to kitchen displays with intelligent pacing. Prep times are optimized automatically.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="md:w-1/2 md:text-right pr-0 md:pr-12 order-2 md:order-1">
                    <h3 className="text-2xl font-bold text-[#061b0e] mb-2">Real-time Analytics</h3>
                    <p className="text-[#434843]">View labor costs, menu performance, and guest satisfaction as it happens. Pure control.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#061b0e] flex items-center justify-center text-white z-10 order-1 md:order-2 shrink-0 shadow-lg">
                    <span className="material-symbols-outlined">query_stats</span>
                  </div>
                  <div className="md:w-1/2 pl-0 md:pl-12 order-3">
                    <div className="glass-card p-4 rounded-2xl w-full max-w-xs shadow-md">
                      <div className="bg-[#cbdbf5] rounded-lg h-32 w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-[#434843]">monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className="py-16 bg-[#eff4ff]/50">
          <div className="max-w-[1440px] mx-auto px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <h2 className="font-display-lg text-[48px] font-bold text-[#061b0e] tracking-tight-custom">Surgical Precision.</h2>
                <p className="text-body-lg text-lg text-[#434843]">Every tool built from the ground up for elite operations.</p>
              </div>
              <a className="text-[#061b0e] font-bold flex items-center gap-2 hover:underline mt-4 md:mt-0" href="#">
                Explore all features <span className="material-symbols-outlined">arrow_outward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-[#d0e9d4] flex items-center justify-center text-[#061b0e] mb-6 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                </div>
                <h3 className="text-xl font-bold text-[#061b0e] mb-3">Contactless Commerce</h3>
                <p className="text-[#434843] leading-relaxed mb-6">Revolutionary QR ordering that feels like a native app. Apple Pay, Google Pay, and split-checks built in.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">FAST PAY</span>
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">CUSTOM MENUS</span>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 group border-t-4 border-[#061b0e]">
                <div className="w-14 h-14 rounded-2xl bg-[#d0e9d4] flex items-center justify-center text-[#061b0e] mb-6 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>point_of_sale</span>
                </div>
                <h3 className="text-xl font-bold text-[#061b0e] mb-3">Advanced POS</h3>
                <p className="text-[#434843] leading-relaxed mb-6">Zero-latency transaction processing with offline mode. Built for the fastest rushes in the busiest venues.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">OFFLINE MODE</span>
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">TABLE MGMT</span>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-[#d0e9d4] flex items-center justify-center text-[#061b0e] mb-6 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl">groups</span>
                </div>
                <h3 className="text-xl font-bold text-[#061b0e] mb-3">CRM & Loyalty</h3>
                <p className="text-[#434843] leading-relaxed mb-6">Turn every guest into a regular with automated profiles, personalized offers, and LTV tracking.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">GUEST INSIGHTS</span>
                  <span className="px-3 py-1 rounded-full bg-[#e5eeff] text-[#434843] text-[11px] font-bold">EMAIL FLOWS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CRM & Inventory Showcase (Bento Style) */}
        <section className="py-16">
          <div className="max-w-[1440px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CRM Widget */}
              <div className="lg:col-span-7 glass-card rounded-3xl overflow-hidden border border-[#c3c8c1]/30 flex flex-col shadow-lg">
                <div className="p-8 pb-0">
                  <h3 className="text-2xl font-bold text-[#061b0e] mb-2">Hyper-Personalized CRM</h3>
                  <p className="text-[#434843] mb-8">Know your guests before they sit down. Every dietary preference, anniversary, and favorite table at your fingertips.</p>
                </div>
                <div className="px-8 pb-8 flex-grow">
                  <div className="bg-[#ffffff] rounded-2xl p-6 border border-black/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-200">
                        <img className="w-full h-full object-cover" alt="Eleanor Sterling VIP Guest" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFDLmrDzawfolDUU_qgmvQlHFRbUj-RlkKeO7mEAmz1lUYOs55irRbA9zlcfMdFdaRct9-6OzyV_z7QgFPEpUfxiYng3huipnAGKqX6lLjx7JEtpzgm2KGGcxe9jho4r705zJrhuFYXxuAwiaS_kI4CH5c_S7rdvZ_WQEptSQomCFXzL-pBKtSlRjCGIj88C22bfibiT8t8lAbztJ2Tz0iSlk5ZAIZ-s4dwf0Fnx2TVr-iCjTSFF8W"/>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#061b0e]">Eleanor Sterling</h4>
                        <p className="text-sm text-[#434843]">VIP Guest • 12 Visits</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-xl font-bold text-[#061b0e]">₹24,440</div>
                        <div className="text-xs text-[#434843]">Total LTV</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-[#061b0e]/5 rounded-xl border border-[#061b0e]/10">
                        <div className="text-xs text-[#364c3c] mb-1 font-semibold">Preferences</div>
                        <div className="text-sm font-bold text-[#0b1c30]">Table 4, Gluten-Free</div>
                      </div>
                      <div className="p-3 bg-[#fe8770]/10 rounded-xl border border-[#fe8770]/20">
                        <div className="text-xs text-[#802919] mb-1 font-semibold">Last Order</div>
                        <div className="text-sm font-bold text-[#0b1c30]">Vesper Martini, Oysters</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Widget */}
              <div className="lg:col-span-5 glass-card rounded-3xl p-8 border border-[#c3c8c1]/30 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#061b0e]">Smart Inventory</h3>
                  <span className="material-symbols-outlined text-[#061b0e] text-2xl">inventory_2</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-[#0b1c30]">Aged Ribeye</span>
                      <span className="text-sm font-bold text-[#ba1a1a]">Low Stock (8)</span>
                    </div>
                    <div className="w-full h-2 bg-[#dce9ff] rounded-full overflow-hidden">
                      <div className="bg-[#ba1a1a] h-full w-[20%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold text-[#0b1c30]">Sauvignon Blanc 2021</span>
                      <span className="text-sm font-medium text-[#434843]">Healthy (42)</span>
                    </div>
                    <div className="w-full h-2 bg-[#dce9ff] rounded-full overflow-hidden">
                      <div className="bg-[#b4cdb8] h-full w-[75%]"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#061b0e] text-white rounded-2xl flex items-center justify-between mt-8 shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      <span className="text-sm font-bold uppercase tracking-wider">AI Auto-Order Active</span>
                    </div>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 bg-[#061b0e] text-white">
          <div className="max-w-[1440px] mx-auto px-10">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-[48px] font-bold mb-4 tracking-tight-custom">Upgrade Your Evolution.</h2>
              <p className="text-white/60 text-lg">Stop juggling five tools. Start using one master system.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Without Ordio */}
              <div className="p-12 bg-[#061b0e]/20">
                <div className="flex items-center gap-2 mb-8 text-white/40">
                  <span className="material-symbols-outlined text-xl">close</span>
                  <span className="font-label-sm uppercase tracking-widest text-xs">The Old Way</span>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 text-white/70">
                    <span className="material-symbols-outlined text-[#ba1a1a] pt-1">block</span>
                    <span className="font-medium">Fragmented data across 4+ different apps</span>
                  </li>
                  <li className="flex items-start gap-4 text-white/70">
                    <span className="material-symbols-outlined text-[#ba1a1a] pt-1">block</span>
                    <span className="font-medium">High processing fees from legacy providers</span>
                  </li>
                  <li className="flex items-start gap-4 text-white/70">
                    <span className="material-symbols-outlined text-[#ba1a1a] pt-1">block</span>
                    <span className="font-medium">Manual inventory counts leading to waste</span>
                  </li>
                  <li className="flex items-start gap-4 text-white/70">
                    <span className="material-symbols-outlined text-[#ba1a1a] pt-1">block</span>
                    <span className="font-medium">No guest data or loyalty integration</span>
                  </li>
                </ul>
              </div>
              {/* With Ordio */}
              <div className="p-12 bg-[#1b3022] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-[120px]">check_circle</span>
                </div>
                <div className="flex items-center gap-2 mb-8 text-[#d0e9d4]">
                  <span className="material-symbols-outlined text-xl">check</span>
                  <span className="font-label-sm uppercase tracking-widest text-xs">The Ordio Way</span>
                </div>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#d0e9d4] pt-1">check_circle</span>
                    <span className="font-bold text-white">One source of truth for all operations</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#d0e9d4] pt-1">check_circle</span>
                    <span className="font-bold text-white">Flat, transparent enterprise-grade rates</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#d0e9d4] pt-1">check_circle</span>
                    <span className="font-bold text-white">Real-time depletion with AI predictive ordering</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#d0e9d4] pt-1">check_circle</span>
                    <span className="font-bold text-white">Deep CRM built directly into the order flow</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden" id="pricing">
          <div className="absolute inset-0 z-0"></div>
          <div className="max-w-[1440px] mx-auto px-10 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-[#061b0e]/20 text-[#061b0e] mb-8">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="font-label-sm uppercase tracking-widest text-xs">Ready for the future?</span>
            </div>
            <h2 className="font-display-lg text-[48px] font-bold text-[#061b0e] mb-8 tracking-tight-custom leading-tight">
              Transform Your Restaurant <br/> 
              Into an <span className="underline decoration-[#d0e9d4] underline-offset-8">Operating Machine</span>.
            </h2>
            <p className="text-body-lg text-[#434843] text-lg mb-12 max-w-2xl mx-auto">
              Join the world's most innovative hospitality groups who have traded chaos for clarity. Experience Ordio today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="font-button text-[14px] font-semibold px-10 py-5 rounded-full bg-[#061b0e] text-white shadow-2xl hover:scale-105 transition-all w-full sm:w-auto text-center">
                Book Your Custom Demo
              </Link>
              <Link to="/register" className="font-button text-[14px] font-semibold px-10 py-5 rounded-full border border-[#061b0e]/20 text-[#061b0e] hover:bg-[#061b0e]/5 transition-all w-full sm:w-auto text-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f8f9ff] dark:bg-[#cbdbf5] border-t border-[#c3c8c1]/30 py-16" id="company">
        <div className="max-w-[1440px] mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#061b0e] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              <span className="font-headline-md text-2xl font-bold text-[#061b0e] tracking-tight">Ordio</span>
            </div>
            <p className="text-[#434843]/70 text-sm mb-6 max-w-xs leading-relaxed">
              The premium operating system designed to empower high-end hospitality with intelligence and precision.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#061b0e] mb-4">Product</h4>
            <ul className="space-y-3 font-body-md text-[#434843]/70 text-sm">
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Features</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">POS System</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">QR Ordering</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">CRM & Loyalty</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#061b0e] mb-4">Company</h4>
            <ul className="space-y-3 font-body-md text-[#434843]/70 text-sm">
              <li><a className="hover:text-[#061b0e] transition-all" href="#">About Us</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Careers</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Contact</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Legal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#061b0e] mb-4">Resources</h4>
            <ul className="space-y-3 font-body-md text-[#434843]/70 text-sm">
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Documentation</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">API Reference</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Status</a></li>
              <li><a className="hover:text-[#061b0e] transition-all" href="#">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-10 pt-8 border-t border-[#c3c8c1]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-[#434843]/50">© 2026 Ordio Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a className="text-[#434843]/50 hover:text-[#061b0e] transition-all" href="#"><span className="material-symbols-outlined">face_nod</span></a>
            <a className="text-[#434843]/50 hover:text-[#061b0e] transition-all" href="#"><span className="material-symbols-outlined">photo_camera</span></a>
            <a className="text-[#434843]/50 hover:text-[#061b0e] transition-all" href="#"><span className="material-symbols-outlined">brand_family</span></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

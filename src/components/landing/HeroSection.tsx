import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const orderStatuses = [
  { table: 'Table 7', item: 'Truffle Pasta', status: 'Preparing', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { table: 'Table 12', item: 'Wagyu Steak', status: 'Ready', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  { table: 'Table 3', item: 'Tiramisu', status: 'Served', color: 'bg-[#d0e9d4] text-[#0b2013] border border-[#b4cdb8]' },
  { table: 'Table 9', item: 'Burrata Salad', status: 'Pending', color: 'bg-slate-50 text-slate-600 border border-slate-200' },
];

const metrics = [
  { label: 'Revenue Today', value: '₹1,24,890', delta: '+12%' },
  { label: 'Active Tables', value: '14 / 22', delta: '' },
  { label: 'Orders Placed', value: '87', delta: '+8%' },
];

export const HeroSection: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveOrder(i => (i + 1) % orderStatuses.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#061b0e] flex items-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#d0e9d4]/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid lines background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#d0e9d4 1px, transparent 1px), linear-gradient(90deg, #d0e9d4 1px, transparent 1px)`,
        backgroundSize: '64px 64px'
      }} />

      <div className="relative max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 w-full py-24 lg:py-0 lg:min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d0e9d4]/25 bg-[#d0e9d4]/10 text-[#d0e9d4] mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d0e9d4] animate-pulse" />
              <span className="text-xs font-medium tracking-wide uppercase">Restaurant Operating System</span>
            </div>

            <h1 className="text-[42px] sm:text-[52px] lg:text-[60px] font-bold text-white leading-[1.08] tracking-[-0.03em] mb-6 text-balance">
              Run Your Restaurant
              <br />
              <span className="text-[#d0e9d4]">Smarter</span> with Ordio
            </h1>

            <p className="text-[17px] text-white/55 leading-relaxed mb-10 max-w-xl">
              Manage QR Ordering, Billing, CRM, Inventory, Kitchen Operations, Loyalty and Business Analytics from one intelligent platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#061b0e] text-sm font-semibold hover:bg-[#FFF8F0] active:scale-[0.97] transition-all shadow-lg shadow-black/20"
              >
                Book a Demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/15 text-white text-sm font-semibold hover:bg-white/5 active:scale-[0.97] transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {['#8B9E88', '#6B7F6A', '#4A5F48', '#2A3F28'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#061b0e]" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="text-xs text-white/40">
                Trusted by <span className="text-white/70 font-medium">500+ restaurants</span> across India
              </p>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:flex justify-end">
            <div className="relative w-[480px]">
              {/* Main card */}
              <div className="bg-white/[0.04] backdrop-blur-sm border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="ml-3 text-[11px] text-white/30 font-mono">Ordio Dashboard — Live</span>
                </div>

                <div className="p-5">
                  {/* Metric Row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {metrics.map((m) => (
                      <div key={m.label} className="bg-white/[0.04] border border-white/6 rounded-xl p-3">
                        <div className="text-[10px] text-white/35 mb-1.5 font-medium">{m.label}</div>
                        <div className="text-base font-bold text-white">{m.value}</div>
                        {m.delta && <div className="text-[10px] text-[#d0e9d4] mt-1">{m.delta} today</div>}
                      </div>
                    ))}
                  </div>

                  {/* Live Orders */}
                  <div className="bg-white/[0.03] border border-white/6 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">Live KDS</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[10px] text-white/35">Live</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {orderStatuses.map((order, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-500 ${
                            idx === activeOrder ? 'bg-white/[0.06]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-1 h-8 rounded-full ${idx === activeOrder ? 'bg-[#d0e9d4]' : 'bg-white/10'}`} />
                            <div>
                              <div className="text-xs font-semibold text-white">{order.item}</div>
                              <div className="text-[10px] text-white/35">{order.table}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${order.color}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat widget */}
              <div className="absolute -bottom-5 -left-10 bg-[#FFF8F0] rounded-xl p-4 shadow-2xl border border-[#061b0e]/8 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#d0e9d4] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-7" stroke="#0b2013" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div className="text-base font-bold text-[#061b0e]">+24%</div>
                  <div className="text-[10px] text-[#434843]">Table Turnover</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FFF8F0] to-transparent" />
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-[#061b0e] relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(#d0e9d4 1px, transparent 1px), linear-gradient(90deg, #d0e9d4 1px, transparent 1px)`,
        backgroundSize: '48px 48px'
      }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#d0e9d4]/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[900px] mx-auto px-5 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d0e9d4]/20 bg-[#d0e9d4]/10 text-[#d0e9d4]/80 mb-8">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3.5 3.5.5-2.5 2.5.5 3.5L6 9.5 3 11l.5-3.5L1 5l3.5-.5L6 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="currentColor" fillOpacity="0.3"/></svg>
          <span className="text-xs font-medium tracking-wide">Ready to transform your restaurant?</span>
        </div>

        <h2 className="text-[40px] sm:text-[52px] lg:text-[60px] font-bold text-white tracking-[-0.03em] leading-[1.08] mb-6 text-balance">
          Transform Your Restaurant
          <br />
          <span className="text-[#d0e9d4]">with Ordio.</span>
        </h2>

        <p className="text-[17px] text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
          Join 500+ restaurants that have replaced fragmented tools with one intelligent platform. Setup in 48 hours, results from day one.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#061b0e] text-sm font-bold hover:bg-[#FFF8F0] active:scale-[0.97] transition-all shadow-xl shadow-black/20 w-full sm:w-auto"
          >
            Book a Demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/15 text-white text-sm font-semibold hover:bg-white/5 active:scale-[0.97] transition-all w-full sm:w-auto"
          >
            Start Free Trial
          </Link>
        </div>

        <p className="text-xs text-white/25 mt-6">No credit card required. 14-day free trial on all plans.</p>
      </div>
    </section>
  );
};

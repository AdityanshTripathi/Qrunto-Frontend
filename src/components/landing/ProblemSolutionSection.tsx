import React from 'react';

const problems = [
  { icon: '✗', text: 'Manual ordering via waiters — slow & error-prone' },
  { icon: '✗', text: 'Fragmented tools for billing, CRM & inventory' },
  { icon: '✗', text: 'Inventory mistakes leading to stockouts & waste' },
  { icon: '✗', text: 'No customer data — zero loyalty or repeat visits' },
  { icon: '✗', text: 'Guesswork for business decisions, no real insights' },
];

const solutions = [
  { icon: '✓', text: 'QR Ordering — guests order instantly, no wait' },
  { icon: '✓', text: 'One platform for every operation end-to-end' },
  { icon: '✓', text: 'Automated inventory with AI-powered reordering' },
  { icon: '✓', text: 'Built-in CRM & Loyalty — built into the order flow' },
  { icon: '✓', text: 'Real-time analytics dashboard for every decision' },
];

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FFF8F0]" id="solutions">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#434843]/50 mb-4">The Problem</p>
          <h2 className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold text-[#061b0e] tracking-[-0.03em] leading-[1.1] text-balance">
            Running a restaurant is hard.
            <br />
            <span className="text-[#434843]/50">It does not have to be.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Without Ordio */}
          <div className="rounded-2xl border border-[#061b0e]/10 bg-white p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full border border-red-200 bg-red-50 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3L3 11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <span className="text-sm font-semibold text-[#434843]/60 uppercase tracking-wider">Without Ordio</span>
            </div>
            <ul className="space-y-5">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="text-red-400 font-bold text-base mt-0.5 shrink-0 w-5 h-5 rounded-full border border-red-200 bg-red-50 flex items-center justify-center text-[10px]">✕</span>
                  <span className="text-sm text-[#434843]/70 leading-relaxed">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Ordio */}
          <div className="rounded-2xl bg-[#061b0e] p-8 sm:p-10 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#d0e9d4]/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-full bg-[#d0e9d4]/15 border border-[#d0e9d4]/20 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="#d0e9d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-sm font-semibold text-[#d0e9d4]/60 uppercase tracking-wider">With Ordio</span>
              </div>
              <ul className="space-y-5">
                {solutions.map((s, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="text-[#d0e9d4] font-bold text-lg mt-0.5 shrink-0">✓</span>
                    <span className="text-sm text-white/80 leading-relaxed">{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

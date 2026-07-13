import React from 'react';

const reasons = [
  {
    title: 'One platform, zero chaos',
    desc: 'Replace the patchwork of apps with a single OS that connects every role — owner, staff, kitchen, and customer.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
  },
  {
    title: 'Faster service, happier guests',
    desc: 'QR ordering and smart kitchen routing cut wait times by 35% on average. Guests spend more, return more often.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
  },
  {
    title: 'Higher repeat customers',
    desc: 'Built-in CRM and loyalty programs turn first-timers into regulars. Automated re-engagement handles the follow-up.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M16 6c1.105 0 2 .895 2 2 0 .738-.4 1.381-1 1.732" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
  },
  {
    title: 'Reduced operational errors',
    desc: 'Automated order routing, inventory tracking, and billing eliminate the most common (and costly) restaurant mistakes.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.2 4.8 5.3.5-3.9 3.7 1.1 5.2L10 13.5l-4.7 2.7 1.1-5.2L2.5 7.3l5.3-.5L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    ),
  },
  {
    title: 'Actionable business insights',
    desc: 'Move beyond gut feeling. Real-time analytics, menu performance, and staff reports give you the data to decide confidently.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 14l4-4 3 3 7-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
  {
    title: 'Scales with you',
    desc: 'Single outlet to multi-chain enterprise — Ordio scales without breaking. Role-based access keeps every location in control.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    ),
  },
];

export const WhyOrdioSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FFF8F0]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#434843]/50 mb-4">Why Ordio</p>
            <h2 className="text-[36px] sm:text-[44px] font-bold text-[#061b0e] tracking-[-0.03em] leading-[1.1] mb-6 text-balance">
              Built for serious restaurant businesses.
            </h2>
            <p className="text-[16px] text-[#434843]/65 leading-relaxed mb-8">
              Ordio is not a QR menu. It is a complete Restaurant Operating System — designed from first principles to handle the real complexity of running a profitable restaurant.
            </p>
            <div className="flex gap-3">
              <div className="text-center px-4 py-3 bg-white border border-[#061b0e]/8 rounded-xl">
                <div className="text-xl font-bold text-[#061b0e]">500+</div>
                <div className="text-[10px] text-[#434843]/50 mt-0.5">Restaurants</div>
              </div>
              <div className="text-center px-4 py-3 bg-white border border-[#061b0e]/8 rounded-xl">
                <div className="text-xl font-bold text-[#061b0e]">2M+</div>
                <div className="text-[10px] text-[#434843]/50 mt-0.5">Orders/month</div>
              </div>
              <div className="text-center px-4 py-3 bg-white border border-[#061b0e]/8 rounded-xl">
                <div className="text-xl font-bold text-[#061b0e]">99.9%</div>
                <div className="text-[10px] text-[#434843]/50 mt-0.5">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right: reasons list */}
          <div className="space-y-0 divide-y divide-[#061b0e]/6">
            {reasons.map((r, i) => (
              <div key={i} className="group flex items-start gap-5 py-7 hover:bg-[#061b0e]/[0.02] rounded-xl px-4 -mx-4 transition-colors cursor-default">
                <div className="w-10 h-10 rounded-xl bg-[#061b0e]/5 flex items-center justify-center text-[#061b0e] shrink-0 mt-0.5 group-hover:bg-[#d0e9d4] transition-colors">
                  {r.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#061b0e] mb-1.5">{r.title}</h3>
                  <p className="text-sm text-[#434843]/65 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
    title: 'QR Ordering',
    desc: 'Guests scan, browse and pay instantly — no app download, no waiter dependency.',
    tags: ['Contactless', 'Fast Pay'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 5V4a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'Smart Billing',
    desc: 'Zero-latency billing with UPI, cards, split-pay, and full offline mode.',
    tags: ['Offline Mode', 'Instant'],
    featured: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M14 19c0-3.314-2.686-6-6-6s-6 2.686-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 8h-4m2-2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'CRM & Loyalty',
    desc: 'Every guest profile, preferences, lifetime value and loyalty points — unified.',
    tags: ['Guest Profiles', 'LTV Tracking'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 16l4-4 3 3 7-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 3H3v16h16V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'Business Analytics',
    desc: 'Revenue, orders, staff performance and menu insights — all in real time.',
    tags: ['Real-time', 'Custom Reports'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M7 8h8M7 11h5M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'Inventory Management',
    desc: 'Real-time stock tracking, low-stock alerts and AI-powered auto-reorder.',
    tags: ['Auto-reorder', 'Wastage Control'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="12" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="11" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
    title: 'Kitchen Display System',
    desc: 'Orders routed to the right station with intelligent pacing and real-time updates.',
    tags: ['Smart Routing', 'Station View'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M11 7v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'Table Management',
    desc: 'Visual floor plan with real-time status, occupancy and turnover tracking.',
    tags: ['Visual Floor', 'Reservations'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3l2.5 5.5L19 9.5l-4 4 1 5.5L11 16.5 6 19l1-5.5-4-4 5.5-1L11 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    ),
    title: 'Loyalty Program',
    desc: 'Tiered rewards, coupon campaigns and automated re-engagement sequences.',
    tags: ['Tiers', 'Campaigns'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 7h16M3 11h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    title: 'Menu Management',
    desc: 'Update items, photos, pricing and availability across all channels instantly.',
    tags: ['Multi-channel', 'Live Updates'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3v2M11 17v2M3 11h2M17 11h2M5.22 5.22l1.42 1.42M15.36 15.36l1.42 1.42M5.22 16.78l1.42-1.42M15.36 6.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>
    ),
    title: 'Waiter Dashboard',
    desc: 'Dedicated interface for your floor team to take orders, modify and track status.',
    tags: ['Mobile-first', 'Role-based'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 3C6.582 3 3 6.582 3 11s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    title: 'Payment Integration',
    desc: 'UPI, cards, wallets and cash — all settled with automated reconciliation.',
    tags: ['All Methods', 'Auto-reconcile'],
    featured: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h4v4H4zM9 4h4v4H9zM14 4h4v4h-4zM4 9h4v4H4zM9 9h4v4H9zM14 9h4v4h-4zM4 14h4v4H4zM9 14h4v4H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
    ),
    title: 'Reports & Exports',
    desc: 'Scheduled reports, tax summaries and custom exports sent to your inbox.',
    tags: ['Scheduled', 'Tax-ready'],
    featured: false,
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FFF8F0]" id="features">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#434843]/50 mb-3">Platform Features</p>
            <h2 className="text-[36px] sm:text-[44px] font-bold text-[#061b0e] tracking-[-0.03em] leading-[1.1]">
              Everything your restaurant needs.
              <br />
              <span className="text-[#434843]/40">Nothing it does not.</span>
            </h2>
          </div>
          <a href="#" className="text-sm font-semibold text-[#061b0e] flex items-center gap-2 hover:gap-3 transition-all whitespace-nowrap">
            See all features
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-default ${
                f.featured
                  ? 'bg-[#061b0e] border-[#061b0e] text-white'
                  : 'bg-white border-[#061b0e]/8 hover:border-[#061b0e]/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-105 ${
                  f.featured ? 'bg-[#d0e9d4]/15 text-[#d0e9d4]' : 'bg-[#061b0e]/6 text-[#061b0e]'
                }`}
              >
                {f.icon}
              </div>
              <h3 className={`text-base font-bold mb-2 ${f.featured ? 'text-white' : 'text-[#061b0e]'}`}>{f.title}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${f.featured ? 'text-white/55' : 'text-[#434843]/70'}`}>{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                      f.featured
                        ? 'bg-[#d0e9d4]/10 text-[#d0e9d4]/80'
                        : 'bg-[#061b0e]/5 text-[#434843]/60'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

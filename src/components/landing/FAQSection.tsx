import React, { useState } from 'react';

const faqs = [
  {
    q: 'How does QR Ordering work?',
    a: 'Each table gets a unique QR code. Guests scan it with their phone camera, browse your full menu, place orders and pay — all without downloading an app. Orders appear on the Kitchen Display System instantly.',
  },
  {
    q: 'Does Ordio replace my existing POS?',
    a: 'Yes. Ordio includes a full-featured POS with billing, table management, split payments, UPI/card integration, and offline mode. There is no need to run a separate POS system.',
  },
  {
    q: 'How does the CRM and Loyalty program work?',
    a: 'Every guest who orders through Ordio is automatically profiled — visit history, favourite items, spend, dietary preferences. The loyalty system awards points per order and supports tiered rewards, coupon campaigns, and automated re-engagement messages.',
  },
  {
    q: 'How is inventory tracked?',
    a: 'Inventory depletes in real time as orders are placed. You set par levels; Ordio alerts you when stock falls below them and — with AI Auto-Order enabled — can trigger purchase orders automatically with your configured suppliers.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most restaurants are live within 24-48 hours. Our onboarding team helps you import your menu, configure tables, set up staff roles, and complete a test run before you go live.',
  },
  {
    q: 'What are the pricing plans?',
    a: 'Ordio offers tiered plans based on outlet count and order volume. All plans include QR Ordering, POS, KDS, and Analytics. CRM, Loyalty, and Inventory modules are available on Growth and Enterprise plans. Book a demo for a custom quote.',
  },
  {
    q: 'Is my data secure?',
    a: 'All data is encrypted in transit and at rest. We are SOC 2 compliant, GDPR aligned, and store Indian restaurant data in India-based data centres. Access controls are role-based and fully auditable.',
  },
  {
    q: 'What support do you provide?',
    a: 'Every plan includes 24/7 chat support. Growth and Enterprise plans add a dedicated account manager and phone support with a guaranteed response SLA. We also offer on-site training for enterprise customers.',
  },
];

export const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-[#FFF8F0]" id="faq">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#434843]/50 mb-4">FAQ</p>
            <h2 className="text-[32px] sm:text-[38px] font-bold text-[#061b0e] tracking-[-0.03em] leading-[1.1] mb-6">
              Questions people actually ask.
            </h2>
            <p className="text-sm text-[#434843]/65 leading-relaxed mb-8">
              Can&apos;t find your answer? Our team is available 24/7 to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#061b0e] hover:gap-3 transition-all"
            >
              Contact Support
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-[#061b0e]/6">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  className="w-full flex items-start justify-between gap-4 text-left group"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-[#061b0e] group-hover:text-[#0e3020] transition-colors">
                    {faq.q}
                  </span>
                  <span className={`shrink-0 w-5 h-5 rounded-full border border-[#061b0e]/15 flex items-center justify-center transition-transform duration-200 mt-0.5 ${open === i ? 'rotate-45 bg-[#061b0e] border-[#061b0e]' : ''}`}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 2v6M2 5h6" stroke={open === i ? 'white' : '#061b0e'} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    open === i ? 'max-h-48 mt-3' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm text-[#434843]/70 leading-relaxed pr-8">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

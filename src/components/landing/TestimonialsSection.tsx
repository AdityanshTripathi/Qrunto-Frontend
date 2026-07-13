import React, { useState, useEffect, useRef } from 'react';

const testimonials = [
  {
    quote: "Ordio completely transformed how we run our kitchen. Orders reach the KDS instantly, waste is down 40%, and we haven't had a billing error in six months.",
    name: 'Vikram Nair',
    role: 'Owner, The Grand Spice',
    location: 'Mumbai',
    initials: 'VN',
  },
  {
    quote: "The CRM alone is worth it. We now know every regular guest's preferences before they sit down. Repeat visits are up 60% since we launched the loyalty program.",
    name: 'Aisha Fernandez',
    role: 'GM, Saffron Lounge',
    location: 'Bengaluru',
    initials: 'AF',
  },
  {
    quote: "I was running three different tools for POS, inventory, and analytics. Ordio replaced all of them and cut my operational costs by nearly a third.",
    name: 'Rajiv Choudhary',
    role: 'Director, Choudhary Group',
    location: 'Delhi NCR',
    initials: 'RC',
  },
  {
    quote: "Our table turnover improved by 28% in the first month. Guests love the QR ordering and our staff can focus on hospitality instead of taking orders manually.",
    name: 'Meera Krishnan',
    role: 'F&B Manager, Azure Bistro',
    location: 'Chennai',
    initials: 'MK',
  },
  {
    quote: "The analytics dashboard gave us insights we never had before — which dishes are most profitable, which time slots to push promotions. Pure clarity.",
    name: 'Arjun Pillai',
    role: 'Owner, Coastal Kitchen',
    location: 'Kochi',
    initials: 'AP',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActive(i => (i + 1) % testimonials.length), 5000);
  };

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const go = (i: number) => { setActive(i); resetInterval(); };

  return (
    <section className="py-24 bg-[#061b0e]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d0e9d4]/40 mb-3">Testimonials</p>
          <h2 className="text-[36px] sm:text-[44px] font-bold text-white tracking-[-0.03em] leading-[1.1]">
            What restaurateurs say.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Quote */}
          <div className="relative min-h-[160px]">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-500 ${
                  i === active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <div className="text-[#d0e9d4]/20 text-7xl font-serif leading-none mb-4 select-none">&ldquo;</div>
                <blockquote className="text-lg sm:text-xl text-white/80 leading-relaxed font-light mb-8">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#d0e9d4]/15 border border-[#d0e9d4]/20 flex items-center justify-center text-[#d0e9d4] font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-24">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 h-1.5 bg-[#d0e9d4]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

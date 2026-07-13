import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 500, suffix: '+', label: 'Restaurants Served', description: 'Across India & growing' },
  { value: 2, suffix: 'M+', label: 'Orders Processed', description: 'Monthly, with zero downtime' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction', description: 'Based on 12,000+ reviews' },
  { value: 99.9, suffix: '%', label: 'Platform Uptime', description: 'Enterprise-grade reliability' },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((target * eased).toFixed(target % 1 !== 0 ? 1 : 0)));
      if (frame === totalFrames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

const StatCard: React.FC<{ value: number; suffix: string; label: string; description: string; animate: boolean }> = ({
  value, suffix, label, description, animate
}) => {
  const count = useCountUp(value, 1800, animate);
  return (
    <div className="text-center px-6 py-8 border-r border-[#061b0e]/8 last:border-r-0">
      <div className="text-4xl sm:text-5xl font-bold text-[#061b0e] tracking-tight mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm font-semibold text-[#061b0e] mb-1">{label}</div>
      <div className="text-xs text-[#434843]/60">{description}</div>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#FFF8F0] py-6 border-b border-[#061b0e]/8">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#061b0e]/8 divide-y lg:divide-y-0">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
};

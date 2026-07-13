import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { ProblemSolutionSection } from '../components/landing/ProblemSolutionSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { DashboardShowcase } from '../components/landing/DashboardShowcase';
import { WhyOrdioSection } from '../components/landing/WhyOrdioSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const Landing: React.FC = () => {
  // Load Inter font for the landing page
  useEffect(() => {
    const existing = document.getElementById('ordio-landing-fonts');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'ordio-landing-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById('ordio-landing-fonts');
      if (el) document.head.removeChild(el);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <DashboardShowcase />
        <WhyOrdioSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;

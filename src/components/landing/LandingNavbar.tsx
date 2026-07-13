import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const LandingNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFF8F0]/90 backdrop-blur-xl border-b border-[#061b0e]/8 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-18 py-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#061b0e] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 9.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#d0e9d4"/>
              <circle cx="8" cy="8" r="1.5" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#061b0e]">Ordio</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {['Solutions', 'Features', 'Pricing', 'Company'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 rounded-md text-sm font-medium text-[#434843] hover:text-[#061b0e] hover:bg-[#061b0e]/5 transition-all duration-150"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold px-5 py-2.5 rounded-full text-[#061b0e] hover:bg-[#061b0e]/5 transition-all"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[#061b0e] text-white hover:bg-[#0e3020] active:scale-95 transition-all shadow-md shadow-[#061b0e]/20"
          >
            Book a Demo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#061b0e] hover:bg-[#061b0e]/5 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-[#FFF8F0] border-b border-[#061b0e]/8 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-5 py-5 flex flex-col gap-1">
          {['Solutions', 'Features', 'Pricing', 'Company'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#434843] hover:text-[#061b0e] hover:bg-[#061b0e]/5 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-[#061b0e]/8 mt-2">
            <Link to="/login" className="text-sm font-semibold px-5 py-3 rounded-full border border-[#061b0e]/15 text-[#061b0e] text-center hover:bg-[#061b0e]/5 transition-all" onClick={() => setMobileOpen(false)}>
              Log In
            </Link>
            <Link to="/register" className="text-sm font-semibold px-5 py-3 rounded-full bg-[#061b0e] text-white text-center hover:bg-[#0e3020] transition-all" onClick={() => setMobileOpen(false)}>
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: ['QR Ordering', 'Smart Billing', 'CRM & Loyalty', 'Inventory', 'Kitchen Display', 'Analytics'],
  Resources: ['Documentation', 'API Reference', 'Status', 'Help Center', 'Blog'],
  Company: ['About Us', 'Careers', 'Contact', 'Press'],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Refund Policy', to: '/refund' },
    { label: 'Contact', to: '/contact' },
  ],
};

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-[#FFF8F0] border-t border-[#061b0e]/8" id="company">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#061b0e] flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 9.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#d0e9d4"/>
                  <circle cx="8" cy="8" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-[#061b0e] tracking-tight">Ordio</span>
            </div>
            <p className="text-sm text-[#434843]/60 leading-relaxed max-w-xs mb-6">
              The complete Restaurant Operating System for modern hospitality. QR Ordering, Billing, CRM, Inventory, and Analytics — unified.
            </p>
            <div className="flex items-center gap-3">
              {/* Social icons */}
              {[
                { label: 'Twitter', path: 'M18 6.5c-.7.3-1.4.5-2.1.6.8-.5 1.4-1.2 1.6-2.1-.7.4-1.5.7-2.4.9-.7-.7-1.6-1.2-2.7-1.2-2 0-3.7 1.7-3.7 3.7 0 .3 0 .6.1.9C5.6 9.1 3.1 7.6 1.4 5.4c-.3.6-.5 1.2-.5 1.9 0 1.3.7 2.4 1.6 3.1-.6 0-1.2-.2-1.7-.5v.1c0 1.8 1.3 3.3 2.9 3.6-.3.1-.6.1-.9.1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.6 3.5 2.6-1.3 1-2.9 1.6-4.6 1.6-.3 0-.6 0-.9-.1 1.7 1.1 3.6 1.7 5.7 1.7 6.8 0 10.5-5.6 10.5-10.5v-.5c.7-.5 1.4-1.2 1.9-1.9z' },
                { label: 'LinkedIn', path: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.5 6.5h-2v7h2v-7zm-1-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm5 3h-2v7h2v-3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V13.5h2v-4c0-2-1.3-3-2.8-3-.8 0-1.7.4-2.2 1V6.5z' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-[#061b0e]/6 flex items-center justify-center text-[#434843]/50 hover:text-[#061b0e] hover:bg-[#061b0e]/10 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d={s.path}/></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {(Object.entries(footerLinks) as [string, (string | { label: string; to: string })[]][]).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-[#061b0e] uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  if (typeof link === 'string') {
                    return (
                      <li key={link}>
                        <a href="#" className="text-sm text-[#434843]/55 hover:text-[#061b0e] transition-colors">
                          {link}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link to={link.to} className="text-sm text-[#434843]/55 hover:text-[#061b0e] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[#061b0e]/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#434843]/40">© 2026 Ordio Inc. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-xs text-[#434843]/40 hover:text-[#061b0e] transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-[#434843]/40 hover:text-[#061b0e] transition-colors">Terms</Link>
            <Link to="/contact" className="text-xs text-[#434843]/40 hover:text-[#061b0e] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

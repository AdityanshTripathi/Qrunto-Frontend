import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, lastUpdated, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#FF6B35]/20 selection:text-[#FF6B35]">
      {/* Stripe-style Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_36px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo-black.png" 
                alt="ORDIO" 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF6B35] transition-colors bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/60 rounded-[28px] shadow-sm p-6 sm:p-10 md:p-12">
          {/* Article Header */}
          <div className="border-b border-slate-100 pb-6 mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
            {lastUpdated && (
              <p className="text-xs text-[#FF6B35] font-black uppercase tracking-wider mt-2">
                Last Updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Article Content */}
          <article className="prose prose-slate max-w-none text-slate-650 dark:text-slate-300 leading-relaxed text-left text-sm sm:text-base space-y-6">
            {children}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-200/50 text-center text-[10px] text-slate-400">
        <p>© {new Date().getFullYear()} ORDIO. All rights reserved. Designed for modern hospitality operators.</p>
      </footer>
    </div>
  );
};

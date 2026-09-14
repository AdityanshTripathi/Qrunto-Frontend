import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { defaultRouteForRole } from '../lib/capabilities';

export const NotFound: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const destination = isAuthenticated ? defaultRouteForRole(user?.role) : '/';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#111827] flex items-center justify-center p-6">
      <section className="max-w-md text-center space-y-4">
        <p className="text-sm font-bold text-[#FF6B35]">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">The page you requested does not exist or is no longer available.</p>
        <Link className="inline-flex rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white" to={destination}>
          Return to {isAuthenticated ? 'dashboard' : 'home'}
        </Link>
      </section>
    </main>
  );
};

import React from 'react';
import { useAuthStore } from '../store/authStore';

export const Unauthorized: React.FC = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#111827] flex items-center justify-center p-6">
      <section className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access unavailable</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Your current role does not have a dashboard capability supported by the server.
          Contact an administrator if your responsibilities require additional access.
        </p>
        <button
          type="button"
          onClick={clearAuth}
          className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white"
        >
          Sign out
        </button>
      </section>
    </main>
  );
};

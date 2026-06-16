import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1f2937]/80 border border-slate-200 dark:border-[#374151]/60 rounded-xl text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none shrink-0 shadow-sm"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
};

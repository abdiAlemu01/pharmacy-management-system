import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/shared/hooks/use-theme';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-slate-900/50'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
      }`}
      title={isDark ? 'Switch to Light Mode (White)' : 'Switch to Dark Mode'}
      aria-label="Toggle dark and light theme"
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform duration-300 hover:rotate-90" />
        ) : (
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      <span className="text-xs font-bold tracking-tight select-none hidden sm:inline">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export const ThemeColorSelector = ThemeToggle;
export default ThemeToggle;


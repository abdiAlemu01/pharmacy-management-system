import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { LanguageSelector } from '@/shared/components/LanguageSelector';

export const AppLayout = () => {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: settingsData } = useSettings();

  const settings = settingsData?.settings;
  const logoUrl = settings?.logoUrl || localStorage.getItem('pharmacy_logo_url') || '';
  const pharmacyName = settings?.pharmacyName || localStorage.getItem('pharmacy_name') || 'Pharmacy Care';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar — handles desktop sticky + mobile drawer internally */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Top Header ── */}
        <header className="h-14 sm:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          {/* Left: Mobile hamburger + Mobile Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 md:hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={pharmacyName}
                  className="w-7 h-7 rounded-full object-cover bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  +
                </div>
              )}
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[110px] sm:max-w-[180px]">
                {pharmacyName}
              </span>
            </div>
          </div>

          {/* Desktop left spacer */}
          <div className="hidden md:block" />

          {/* Right: controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* Language Selection Dropdown */}
            <LanguageSelector />

            {/* Theme toggle */}
            <ThemeToggle />

            <div className="h-5 sm:h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* User profile */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                title={`${user?.name || user?.email} (${user?.role || 'Staff'})`}
              >
                {(user?.name || user?.firstName || user?.email || 'U')[0].toUpperCase()}
              </div>

              {/* Name & Email — hidden on mobile, visible on sm+ */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px] md:max-w-none">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
                </span>
                <span className="text-[10px] text-slate-400 truncate hidden md:block">
                  {user?.email}
                </span>
              </div>

              {/* Role badge — hidden on extra small screens, visible on sm+ */}
              <span className="hidden sm:inline-block text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase font-bold tracking-wide shrink-0">
                {user?.role || 'Staff'}
              </span>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar containing Navigation Menu and Bottom Sign Out */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div></div>
          <div className="flex items-center gap-3">
            {/* Shift between Dark and White theme on the top right-hand side */}
            <ThemeToggle />

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
              </span>
              <span className="text-[11px] text-slate-400">
                {user?.email}
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 uppercase font-bold tracking-wide">
              {user?.role || 'Staff'}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

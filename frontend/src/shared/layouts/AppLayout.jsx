import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar containing Navigation Menu and Bottom Sign Out */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">
                {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
              </span>
              <span className="text-[11px] text-slate-400">
                {user?.email}
              </span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase font-bold tracking-wide">
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

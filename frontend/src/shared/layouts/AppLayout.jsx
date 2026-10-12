import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-emerald-600">Pharmacy Care</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">
            {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-semibold">
            {user?.role || 'Staff'}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-rose-600 font-medium cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};


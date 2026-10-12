import React from 'react';
import { useAuth } from '@/features/auth';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.firstName || user?.name || 'Staff'}!
        </h1>
        <p className="text-slate-500 mt-1">
          Authentication is verified and connected to your PostgreSQL database.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Logged in as: <strong>{user?.email}</strong> (Role: {user?.role})</span>
        </div>
      </div>
    </div>
  );
};


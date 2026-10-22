import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  ShoppingCart,
  Truck,
  ArrowRight,
  Pill,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { useInventorySummary } from '@/features/inventory/hooks/use-inventory';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settingsData } = useSettings();
  const { data: invSummaryRes, isLoading: isInvLoading } = useInventorySummary();

  const settings = settingsData?.settings;
  const pharmacyName = settings?.pharmacyName || 'Pharmacy Care';
  const invSummary = invSummaryRes?.data || {};

  return (
    <div className="space-y-6">
      {/* Welcome & Pharmacy Status Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Welcome back, {user?.firstName || user?.name || 'Staff'}!
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {user?.role || 'PHARMACIST'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Operational dashboard for <strong>{pharmacyName}</strong> &bull; All pharmacy systems connected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Pill className="w-4 h-4 text-emerald-600" />
            <span>Medicines</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS</span>
          </button>
        </div>
      </div>

      {/* Connected Financial & Operating KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Inventory Stock Count */}
        <div
          onClick={() => navigate('/inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Medicines in Stock
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {isInvLoading ? '...' : (invSummary?.totalMedicines || invSummary?.totalItems || 0)}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">Items</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Total Units: {invSummary?.totalStock || invSummary?.totalQuantity || 0}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => navigate('/inventory')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Low Stock Warnings
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {isInvLoading ? '...' : (invSummary?.lowStockCount || invSummary?.lowStock || 0)}
            </span>
            <span className="text-xs font-bold text-amber-600 ml-1">Medicines</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Requires reordering</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Supplier Purchases */}
        <div
          onClick={() => navigate('/purchases')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Supplier Purchases
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-800 dark:text-blue-200">
              Manage Orders
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Procure medicine batches</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/medicines')}
          className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Medicines Catalog</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage medicine items, categories, and prices.</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/purchases')}
          className="p-5 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Supplier Purchases</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage medicine orders, supplier bills, and deliveries.</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/sales')}
          className="p-5 bg-gradient-to-br from-purple-500/5 to-pink-500/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">POS & Dispensing</h3>
              <p className="text-xs text-slate-500 mt-0.5">Process patient prescriptions, sales, and receipts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

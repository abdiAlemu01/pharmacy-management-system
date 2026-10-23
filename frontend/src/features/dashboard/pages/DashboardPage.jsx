import React from 'react';
import { LayoutDashboard, Calendar, Store, AlertCircle, RefreshCw } from 'lucide-react';
import { useDashboardSummary } from '../hooks/use-dashboard';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { DashboardStatsCards } from '../components/DashboardStatsCards';
import { SalesBarChart } from '../components/SalesBarChart';
import { InventoryDonutChart } from '../components/InventoryDonutChart';
import { TopSoldMedicinesTable } from '../components/TopSoldMedicinesTable';
import { NearExpiryMedicinesTable } from '../components/NearExpiryMedicinesTable';

export const DashboardPage = () => {
  // Settings for currency symbol
  const { data: settingsData } = useSettings();
  const currencySymbol = settingsData?.settings?.currencySymbol || 'ETB';
  const pharmacyName = settingsData?.settings?.pharmacyName || 'Pharmacy Management';

  // Dashboard API Query
  const { data, isLoading, error, refetch, isFetching } = useDashboardSummary();

  const todayData = data?.today || {};
  const periodData = data?.period || {};
  const mostSoldMedicine = data?.mostSoldMedicine || null;
  const mostProfitableMedicine = data?.mostProfitableMedicine || null;
  const salesTrend = data?.salesTrend || {};
  const stockDistribution = data?.stockDistribution || {};
  const topSellingMedicines = data?.topSellingMedicines || [];
  const nearExpiryMedicines = data?.nearExpiryMedicines || [];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Executive Dashboard
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </div>
        </div>

        {/* Live Date Badge & Refresh Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isFetching ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>Failed to load live dashboard statistics. Please click refresh to retry.</span>
        </div>
      )}

      {/* 2. 4 Key Stats Cards */}
      <DashboardStatsCards
        today={todayData}
        mostSoldMedicine={mostSoldMedicine}
        mostProfitableMedicine={mostProfitableMedicine}
        currencySymbol={currencySymbol}
      />

      {/* 4. Charts Section: 1 Bar Chart (Sales/POS) + 1 Donut Chart (Inventory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Last 7 Days Daily Sales (Source: Sales/POS) */}
        <SalesBarChart
          salesTrend={salesTrend}
          currencySymbol={currencySymbol}
        />

        {/* Donut Chart: Inventory Health (Source: Inventory) */}
        <InventoryDonutChart
          stockDistribution={stockDistribution}
        />
      </div>

      {/* 5. Two Data Tables: Most Sold Medicines + Near to Expire Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold Medicines */}
        <TopSoldMedicinesTable
          medicines={topSellingMedicines}
          currencySymbol={currencySymbol}
        />

        {/* Near to Expire Medicines */}
        <NearExpiryMedicinesTable
          medicines={nearExpiryMedicines}
        />
      </div>
    </div>
  );
};


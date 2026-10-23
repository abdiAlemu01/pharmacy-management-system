import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Store, AlertCircle } from 'lucide-react';
import { useDashboardSummary } from '../hooks/use-dashboard';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { DashboardStatsCards } from '../components/DashboardStatsCards';
import { DashboardDateFilter } from '../components/DashboardDateFilter';
import { SalesBarChart } from '../components/SalesBarChart';
import { InventoryDonutChart } from '../components/InventoryDonutChart';
import { TopSoldMedicinesTable } from '../components/TopSoldMedicinesTable';
import { NearExpiryMedicinesTable } from '../components/NearExpiryMedicinesTable';

export const DashboardPage = () => {
  // Date filter state
  const [period, setPeriod] = useState('week');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Settings for currency symbol
  const { data: settingsData } = useSettings();
  const currencySymbol = settingsData?.settings?.currencySymbol || 'ETB';
  const pharmacyName = settingsData?.settings?.pharmacyName || 'Pharmacy Management';

  // Dashboard API Query
  const { data, isLoading, error, refetch, isFetching } = useDashboardSummary({
    period,
    startDate: period === 'custom' ? dateRange.startDate : undefined,
    endDate: period === 'custom' ? dateRange.endDate : undefined,
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleDateChange = (range) => {
    setDateRange(range);
  };

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
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Operational and business performance overview for <strong>{pharmacyName}</strong>
          </p>
        </div>

        {/* Live Date Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs">
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
      </div>

      {/* 2. Interactive Date Range Filter */}
      <DashboardDateFilter
        period={period}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onPeriodChange={handlePeriodChange}
        onDateChange={handleDateChange}
        onRefresh={() => refetch()}
        isLoading={isFetching}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>Failed to load live dashboard statistics. Please click refresh to retry.</span>
        </div>
      )}

      {/* 3. 4 Key Stats Cards */}
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
        {/* Table 1: Most Sold Medicines */}
        <TopSoldMedicinesTable
          medicines={topSellingMedicines}
          currencySymbol={currencySymbol}
        />

        {/* Table 2: Near to Expire Medicines */}
        <NearExpiryMedicinesTable
          medicines={nearExpiryMedicines}
        />
      </div>
    </div>
  );
};


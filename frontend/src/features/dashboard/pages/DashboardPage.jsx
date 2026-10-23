import React, { useState } from 'react';
import { useAuth } from '@/features/auth';
import { useSettings } from '@/features/settings';
import { useDashboardSummary } from '../hooks/use-dashboard';
import { DashboardHeader } from '../components/DashboardHeader';
import { BusinessPerformanceOverview } from '../components/BusinessPerformanceOverview';
import { QuickActions } from '../components/QuickActions';
import { SalesAndProfitAnalytics } from '../components/SalesAndProfitAnalytics';
import { StockAndExpiryAlerts } from '../components/StockAndExpiryAlerts';
import { RecentSalesAndPurchases } from '../components/RecentSalesAndPurchases';
import { BusinessInsightsAndPendingTasks } from '../components/BusinessInsightsAndPendingTasks';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data: settingsData } = useSettings();

  // Period / Custom Date state for dynamic interactive analysis
  const [period, setPeriod] = useState('7d'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    data: summaryData,
    isLoading,
    isFetching,
    refetch,
    isError,
    error,
  } = useDashboardSummary({
    period,
    startDate: period === 'custom' ? startDate : '',
    endDate: period === 'custom' ? endDate : '',
  });

  const settings = settingsData?.settings || {};
  const pharmacyName = settings.pharmacyName || 'Pharmacy Care';
  const currencySymbol = settings.currencySymbol || summaryData?.settings?.currencySymbol || 'Birr';

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setPeriod('custom');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in duration-200">
      {/* 0. Top Header Banner with Live Date, Greeting, and Date Range Controls */}
      <DashboardHeader
        user={user}
        pharmacyName={pharmacyName}
        period={period}
        onPeriodChange={handlePeriodChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={handleCustomDateChange}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />

      {/* Error Banner */}
      {isError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {error?.response?.data?.message || 'Could not load complete dashboard statistics. Please try refreshing.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 1. Business Performance Overview (6 Essential Summary Cards) */}
      <BusinessPerformanceOverview
        overview={summaryData?.businessOverview}
        currencySymbol={currencySymbol}
        isLoading={isLoading}
      />

      {/* 2. Quick Actions Shortcuts */}
      <QuickActions />

      {/* 3. Main Analytics & Expiry Alerts Grid (2 Columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sales and Profit Analytics Chart (7 cols) */}
        <div className="lg:col-span-7">
          <SalesAndProfitAnalytics
            analytics={summaryData?.salesAndProfitAnalytics}
            currencySymbol={currencySymbol}
            periodLabel={summaryData?.period?.label || 'Selected Range'}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Medicine Stock & Expiry Alerts (5 cols) */}
        <div className="lg:col-span-5">
          <StockAndExpiryAlerts
            alerts={summaryData?.stockAndExpiryAlerts}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 4. Recent Sales and Purchases Compact Tables */}
      <RecentSalesAndPurchases
        recentSales={summaryData?.recentRecords?.recentSales}
        recentPurchases={summaryData?.recentRecords?.recentPurchases}
        currencySymbol={currencySymbol}
        isLoading={isLoading}
      />

      {/* 5. Business Insights & Pending Tasks Panel */}
      <BusinessInsightsAndPendingTasks
        insights={summaryData?.businessInsightsAndPendingTasks}
        currencySymbol={currencySymbol}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardPage;


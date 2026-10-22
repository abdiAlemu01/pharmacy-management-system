import React, { useState } from 'react';
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Boxes,
  ShoppingBag,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { useSettings } from '@/features/settings';
import { useAppDate } from '@/shared/lib/date-utils';
import { useReportsOverview } from '../hooks/use-reports';
import { ReportPeriodSelector } from '../components/ReportPeriodSelector';
import { SalesReportsTab } from '../components/SalesReportsTab';
import { FinancialReportsTab } from '../components/FinancialReportsTab';
import { InventoryReportsTab } from '../components/InventoryReportsTab';
import { PurchaseReportsTab } from '../components/PurchaseReportsTab';
import { MedicinePerformanceTab } from '../components/MedicinePerformanceTab';

export const ReportsPage = () => {
  const { data: settingsData } = useSettings();
  const settings = settingsData?.settings;
  const currencySymbol = settings?.currencySymbol || 'Birr';
  const { calendarType } = useAppDate();

  // Active Tab: 'sales' | 'financial' | 'inventory' | 'purchases' | 'expenses' | 'performance'
  const [activeTab, setActiveTab] = useState('sales');

  // Period state: 'today' | 'week' | 'month' | 'year' | 'custom'
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Overview quick KPIs
  const { data: overview, isLoading: isOverviewLoading } = useReportsOverview();

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDateChange = (start, end) => {
    setPeriod('custom');
    setStartDate(start);
    setEndDate(end);
  };

  const handleReset = () => {
    setPeriod('month');
    setStartDate('');
    setEndDate('');
  };

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const tabs = [
    {
      id: 'sales',
      label: 'Sales Reports',
      icon: ShoppingCart,
      description: 'Sales volume, total sales & transactions by date',
    },
    {
      id: 'financial',
      label: 'Profit & Financials',
      icon: DollarSign,
      description: 'Profit, COGS & total sales',
    },
    {
      id: 'inventory',
      label: 'Inventory Reports',
      icon: Boxes,
      description: 'Stock valuation, low stock, expired & damaged items',
    },
    {
      id: 'purchases',
      label: 'Purchase Reports',
      icon: ShoppingBag,
      description: 'Supplier orders, payments & debts',
    },
    {
      id: 'performance',
      label: 'Medicine Performance',
      icon: Award,
      description: 'Best-selling & slow-moving medicines',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Pharmacy Reports & Analytics
            </h1>
          </div>
        </div>
      </div>

      {/* 2. Top Overview Pulse Banner */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs">
          <div
            onClick={() => {
              setActiveTab('sales');
              handlePeriodChange('today');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] select-none flex flex-col justify-between"
          >
            <div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-semibold">Today's Sales</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                  {formatAmount(overview.todaySales)}
                </strong>
                <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold">
                View content
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('sales');
              handlePeriodChange('month');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] select-none flex flex-col justify-between"
          >
            <div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-semibold">This Month Sales</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {formatAmount(overview.monthSales)}
                </strong>
                <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold">
                View content
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('inventory');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] select-none flex flex-col justify-between"
          >
            <div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-semibold">Capital in Stock</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 tracking-tight">
                  {formatAmount(overview.stockCostValue)}
                </strong>
                <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold">
                View content
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('purchases');
            }}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] select-none flex flex-col justify-between"
          >
            <div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-semibold">Supplier Debt</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 tracking-tight">
                  {formatAmount(overview.totalSupplierDebt)}
                </strong>
                <span className="text-xs font-bold text-slate-400">{currencySymbol}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1 font-semibold">
                View content
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('inventory');
            }}
            className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.99] select-none flex flex-col justify-between"
          >
            <div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-semibold">Stock Risks</span>
              <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                <strong className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400">
                  {overview.lowStockCount || 0} Low
                </strong>
                <span className="text-slate-400 font-bold">&bull;</span>
                <strong className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400">
                  {overview.expiredCount || 0} Expired
                </strong>
              </div>
            </div>
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold">
                View content
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-[11px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Universal Period Selector */}
      <ReportPeriodSelector
        period={period}
        onPeriodChange={handlePeriodChange}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onReset={handleReset}
      />

      {/* 4. Tab Navigation Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-px" aria-label="Reports Navigation Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 5. Active Tab View Render */}
      <div>
        {activeTab === 'sales' && (
          <SalesReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onPeriodChange={handlePeriodChange}
            onDateChange={handleDateChange}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            expiryThresholdDays={settings?.expiryThresholdDays}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchaseReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
          />
        )}

        {activeTab === 'performance' && (
          <MedicinePerformanceTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </div>
  );
};


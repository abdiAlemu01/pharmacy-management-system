import React, { useState } from 'react';
import {
  BarChart3,
  ShoppingCart,
  DollarSign,
  Boxes,
  ShoppingBag,
  Receipt,
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
import { ExpenseReportsTab } from '../components/ExpenseReportsTab';
import { MedicinePerformanceTab } from '../components/MedicinePerformanceTab';
import { ReportCardContentModal } from '../components/ReportCardContentModal';

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

  // Modal State for card click details
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    cardKey: null,
    cardData: {},
  });

  const handleOpenModal = (cardKey, cardData) => {
    setModalConfig({
      isOpen: true,
      cardKey,
      cardData: cardData || {},
    });
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

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
      description: 'Sales volume, revenue & transactions by date',
    },
    {
      id: 'financial',
      label: 'Profit & Financials',
      icon: DollarSign,
      description: 'Gross profit, COGS, operating expenses & net profit',
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
      id: 'expenses',
      label: 'Expense Reports',
      icon: Receipt,
      description: 'Operating bills, payments by category & date',
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive operational, financial, and inventory intelligence
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Overview Pulse Banner */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
          <div
            onClick={() => {
              setActiveTab('sales');
              handlePeriodChange('today');
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
          >
            <span className="text-[11px] text-slate-500 block font-medium">Today's Sales</span>
            <strong className="text-sm font-black text-emerald-700 dark:text-emerald-400 block mt-0.5">
              {formatAmount(overview.todaySales)} {currencySymbol}
            </strong>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 group-hover:text-primary transition-colors flex items-center gap-0.5 font-semibold">
                View content
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('sales');
              handlePeriodChange('month');
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
          >
            <span className="text-[11px] text-slate-500 block font-medium">This Month Sales</span>
            <strong className="text-sm font-black text-slate-900 dark:text-slate-100 block mt-0.5">
              {formatAmount(overview.monthSales)} {currencySymbol}
            </strong>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 group-hover:text-primary transition-colors flex items-center gap-0.5 font-semibold">
                View content
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('inventory');
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
          >
            <span className="text-[11px] text-slate-500 block font-medium">Capital in Stock</span>
            <strong className="text-sm font-black text-blue-700 dark:text-blue-400 block mt-0.5">
              {formatAmount(overview.stockCostValue)} {currencySymbol}
            </strong>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 group-hover:text-primary transition-colors flex items-center gap-0.5 font-semibold">
                View content
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('purchases');
            }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
          >
            <span className="text-[11px] text-slate-500 block font-medium">Supplier Debt</span>
            <strong className="text-sm font-black text-rose-700 dark:text-rose-400 block mt-0.5">
              {formatAmount(overview.totalSupplierDebt)} {currencySymbol}
            </strong>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 group-hover:text-primary transition-colors flex items-center gap-0.5 font-semibold">
                View content
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to open
              </span>
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab('inventory');
            }}
            className="col-span-2 lg:col-span-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
          >
            <span className="text-[11px] text-slate-500 block font-medium">Stock Risks</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
              {overview.lowStockCount || 0} Low &bull; {overview.expiredCount || 0} Expired
            </span>
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 group-hover:text-primary transition-colors flex items-center gap-0.5 font-semibold">
                View content
                <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
            onCardClick={handleOpenModal}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onCardClick={handleOpenModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onCardClick={handleOpenModal}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchaseReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onCardClick={handleOpenModal}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseReportsTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onCardClick={handleOpenModal}
          />
        )}

        {activeTab === 'performance' && (
          <MedicinePerformanceTab
            period={period}
            startDate={startDate}
            endDate={endDate}
            currencySymbol={currencySymbol}
            onCardClick={handleOpenModal}
          />
        )}
      </div>

      {/* 6. Card Detailed Content Modal */}
      <ReportCardContentModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        cardKey={modalConfig.cardKey}
        cardData={modalConfig.cardData}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};


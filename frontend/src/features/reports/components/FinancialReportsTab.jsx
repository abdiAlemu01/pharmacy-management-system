import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, Package, Calendar, Filter } from 'lucide-react';
import { useFinancialReports } from '../hooks/use-reports';

export const FinancialReportsTab = ({
  period = 'month',
  startDate,
  endDate,
  currencySymbol = 'Birr',
  onPeriodChange,
  onDateChange,
}) => {
  const { data, isLoading } = useFinancialReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const comparisons = data?.comparisons || {};

  // Active Timeframe selection state: 'today' | 'week' | 'month' | 'custom'
  const [activeTimeframe, setActiveTimeframe] = useState(() => {
    if (period === 'today' || period === 'week' || period === 'month' || period === 'custom') {
      return period;
    }
    return 'month';
  });

  // Sync when parent period changes
  useEffect(() => {
    if (period && ['today', 'week', 'month', 'custom'].includes(period)) {
      setActiveTimeframe(period);
    }
  }, [period]);

  const handleSelectTimeframe = (tf) => {
    setActiveTimeframe(tf);
    if (onPeriodChange) {
      onPeriodChange(tf);
    }
  };

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Resolve financial metrics for the currently selected timeframe
  const currentData = useMemo(() => {
    if (activeTimeframe === 'today') {
      const rev = comparisons.today?.revenue ?? (period === 'today' ? summary.totalRevenue : 0);
      const cogs = comparisons.today?.cogs ?? (period === 'today' ? (summary.costOfMedicinesSold ?? summary.cogs) : 0);
      const gross = comparisons.today?.grossProfit ?? (period === 'today' ? summary.grossProfit : 0);
      const exp = comparisons.today?.expenses ?? (period === 'today' ? summary.operatingExpenses : 0);
      const margin = rev > 0 ? parseFloat(((gross / rev) * 100).toFixed(1)) : 0;
      return {
        label: "Today's Financial Performance",
        periodBadge: "Daily (Today)",
        hasDates: true,
        revenue: rev,
        cogs,
        grossProfit: gross,
        grossMargin: margin,
        expenses: exp,
      };
    }
    if (activeTimeframe === 'week') {
      const rev = comparisons.thisWeek?.revenue ?? (period === 'week' ? summary.totalRevenue : 0);
      const cogs = comparisons.thisWeek?.cogs ?? (period === 'week' ? (summary.costOfMedicinesSold ?? summary.cogs) : 0);
      const gross = comparisons.thisWeek?.grossProfit ?? (period === 'week' ? summary.grossProfit : 0);
      const exp = comparisons.thisWeek?.expenses ?? (period === 'week' ? summary.operatingExpenses : 0);
      const margin = rev > 0 ? parseFloat(((gross / rev) * 100).toFixed(1)) : 0;
      return {
        label: "Weekly Financial Performance",
        periodBadge: "Last 7 Days",
        hasDates: true,
        revenue: rev,
        cogs,
        grossProfit: gross,
        grossMargin: margin,
        expenses: exp,
      };
    }
    if (activeTimeframe === 'month') {
      const rev = comparisons.thisMonth?.revenue ?? summary.totalRevenue ?? 0;
      const cogs = comparisons.thisMonth?.cogs ?? summary.costOfMedicinesSold ?? summary.cogs ?? 0;
      const gross = comparisons.thisMonth?.grossProfit ?? summary.grossProfit ?? 0;
      const exp = comparisons.thisMonth?.expenses ?? summary.operatingExpenses ?? 0;
      const margin = rev > 0 ? parseFloat(((gross / rev) * 100).toFixed(1)) : 0;
      return {
        label: "Monthly Financial Performance",
        periodBadge: "This Month",
        hasDates: true,
        revenue: rev,
        cogs,
        grossProfit: gross,
        grossMargin: margin,
        expenses: exp,
      };
    }

    // 'custom' timeframe
    if (activeTimeframe === 'custom') {
      const hasBothDates = Boolean(startDate && endDate);
      const isInvalid = hasBothDates && startDate > endDate;

      if (!hasBothDates) {
        return {
          label: "Custom Period Financial Performance",
          periodBadge: "Dates Required",
          hasDates: false,
          isInvalid: false,
          message: !startDate && !endDate
            ? " "
            : !startDate
            ? "Please select a start date (From) above."
            : "Please select an end date (To) above.",
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          grossMargin: 0,
          expenses: 0,
        };
      }

      if (isInvalid) {
        return {
          label: "Custom Period Financial Performance",
          periodBadge: "Invalid Range",
          hasDates: false,
          isInvalid: true,
          message: "The start date cannot be later than the end date. Please adjust your date range.",
          revenue: 0,
          cogs: 0,
          grossProfit: 0,
          grossMargin: 0,
          expenses: 0,
        };
      }

      const rev = summary.totalRevenue || 0;
      const cogs = summary.costOfMedicinesSold ?? summary.cogs ?? 0;
      const gross = summary.grossProfit || 0;
      const exp = summary.operatingExpenses || 0;
      const margin = summary.grossMargin || (rev > 0 ? parseFloat(((gross / rev) * 100).toFixed(1)) : 0);
      return {
        label: `Custom Period (${startDate} to ${endDate})`,
        periodBadge: "Custom Range",
        hasDates: true,
        isInvalid: false,
        revenue: rev,
        cogs,
        grossProfit: gross,
        grossMargin: margin,
        expenses: exp,
      };
    }

    const rev = summary.totalRevenue || 0;
    const cogs = summary.costOfMedicinesSold ?? summary.cogs ?? 0;
    const gross = summary.grossProfit || 0;
    const exp = summary.operatingExpenses || 0;
    const margin = summary.grossMargin || (rev > 0 ? parseFloat(((gross / rev) * 100).toFixed(1)) : 0);
    return {
      label: "Financial Performance",
      periodBadge: "Overview",
      hasDates: true,
      revenue: rev,
      cogs,
      grossProfit: gross,
      grossMargin: margin,
      expenses: exp,
    };
  }, [activeTimeframe, comparisons, summary, startDate, endDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Timeframe Selection Pills (Separate Today, Week, Month, Custom) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleSelectTimeframe('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTimeframe === 'today'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today (Daily)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTimeframe('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTimeframe === 'week'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>This Week (7 Days)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTimeframe('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTimeframe === 'month'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>This Month</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTimeframe('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTimeframe === 'custom'
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Custom Date Range</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Date Range Pickers (only shown when custom range is active) */}
      {activeTimeframe === 'custom' && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Custom Analysis Duration:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange?.(e.target.value, endDate)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange?.(startDate, e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => onDateChange?.('', '')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              Clear dates
            </button>
          )}
        </div>
      )}

      {/* 3. Financial Statement View for the Active Timeframe */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {currentData.label}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                !currentData.hasDates
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {currentData.periodBadge}
            </span>
          </div>
        </div>

        {activeTimeframe === 'custom' && !currentData.hasDates ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl select-none">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {currentData.isInvalid ? 'Invalid Date Range' : 'Enter Date Range to View Values'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {currentData.message}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Total Sales */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sales</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {isLoading ? '...' : formatAmount(currentData.revenue)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Total sales turnover</span>
            </div>
          </div>

          {/* 2. Cost of Medicines Sold (COGS) */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cost of Meds (COGS)</span>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {isLoading ? '...' : formatAmount(currentData.cogs)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Purchase cost of sold medicines</span>
            </div>
          </div>

          {/* 3. Profit (Total Sales - Cost of Medicines) */}
          <div className="p-4 bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none bg-emerald-50/10 dark:bg-emerald-950/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Profit</span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {isLoading ? '...' : formatAmount(currentData.grossProfit)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Total Sales − Med Cost</span>
                <span>Profit: {currentData.grossMargin || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};


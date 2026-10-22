import React from 'react';
import { useFinancialReports } from '../hooks/use-reports';

export const FinancialReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
}) => {
  const { data, isLoading } = useFinancialReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const comparisons = data?.comparisons || {};

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isNetPositive = (summary.estimatedNetProfit || 0) >= 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Quick Timeframe Profit Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Today */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Profit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                Daily
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  (comparisons.today?.netProfit || 0) >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isLoading ? '...' : formatAmount(comparisons.today?.netProfit)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Gross: {formatAmount(comparisons.today?.grossProfit)}</span>
              <span>Exp: {formatAmount(comparisons.today?.expenses)}</span>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Profit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 font-bold text-blue-700 dark:text-blue-300">
                Last 7 Days
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  (comparisons.thisWeek?.netProfit || 0) >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isLoading ? '...' : formatAmount(comparisons.thisWeek?.netProfit)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Gross: {formatAmount(comparisons.thisWeek?.grossProfit)}</span>
              <span>Exp: {formatAmount(comparisons.thisWeek?.expenses)}</span>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Profit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 font-bold text-emerald-700 dark:text-emerald-300">
                This Month
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  (comparisons.thisMonth?.netProfit || 0) >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isLoading ? '...' : formatAmount(comparisons.thisMonth?.netProfit)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Gross: {formatAmount(comparisons.thisMonth?.grossProfit)}</span>
              <span>Exp: {formatAmount(comparisons.thisMonth?.expenses)}</span>
            </div>
          </div>
        </div>

        {/* Selected Period (Custom or Preset) */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                Selected Range Net
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                Active
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black ${
                  isNetPositive ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isLoading ? '...' : formatAmount(summary.estimatedNetProfit)}
              </span>
              <span className="text-xs font-bold text-emerald-700">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
              Net Margin: {summary.netMargin || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


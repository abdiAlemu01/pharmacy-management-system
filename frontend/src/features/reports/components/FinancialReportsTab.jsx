import React from 'react';
import { DollarSign, TrendingUp, Package, Receipt, Scale, ArrowRight } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Core Financial Performance Overview in Selected Period */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Selected Period Financial Statement
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Gross Profit = Sales Revenue − Cost of Medicines Sold &bull; Net Profit = Gross Profit − Operating Expenses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Sales Revenue */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sales Revenue</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {isLoading ? '...' : formatAmount(summary.totalRevenue)}
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
                  {isLoading ? '...' : formatAmount(summary.costOfMedicinesSold ?? summary.cogs)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Purchase cost of sold medicines</span>
            </div>
          </div>

          {/* 3. Gross Profit (Revenue - Cost of Medicines) */}
          <div className="p-4 bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none bg-emerald-50/10 dark:bg-emerald-950/20">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Gross Profit</span>
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {isLoading ? '...' : formatAmount(summary.grossProfit)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Revenue − Med Cost</span>
                <span>Margin: {summary.grossMargin || 0}%</span>
              </div>
            </div>
          </div>

          {/* 4. Operating Expenses */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Operating Expenses</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {isLoading ? '...' : formatAmount(summary.operatingExpenses)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Paid: {formatAmount(summary.expensesPaid)} &bull; Due: {formatAmount(summary.expensesDue)}
              </span>
            </div>
          </div>

          {/* 5. Estimated Net Profit */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Estimated Net Profit</span>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className={`text-2xl font-black ${
                    isNetPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isLoading ? '...' : formatAmount(summary.estimatedNetProfit)}
                </span>
                <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Gross − Expenses</span>
                <span>Net: {summary.netMargin || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Profit Comparisons across Timeframes (Daily, Weekly, Monthly & Custom Range) */}
      <div>
        <div className="mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Timeframe Profit Breakdown
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Compare Gross Profit and Net Profit across daily, weekly, monthly, and active date ranges
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Today */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Today's Profit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                  Daily
                </span>
              </div>

              {/* Large Gross Profit display */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Gross Profit (Revenue − Cost)
                </span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {isLoading ? '...' : formatAmount(comparisons.today?.grossProfit)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Sales Revenue:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.today?.revenue)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cost of Medicines:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.today?.cogs)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Operating Expenses:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatAmount(comparisons.today?.expenses)} {currencySymbol}
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Estimated Net Profit:</span>
                  <span
                    className={
                      (comparisons.today?.netProfit || 0) >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatAmount(comparisons.today?.netProfit)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* This Week */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Weekly Profit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 font-bold text-blue-700 dark:text-blue-300">
                  Last 7 Days
                </span>
              </div>

              {/* Large Gross Profit display */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Gross Profit (Revenue − Cost)
                </span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {isLoading ? '...' : formatAmount(comparisons.thisWeek?.grossProfit)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Sales Revenue:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.thisWeek?.revenue)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cost of Medicines:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.thisWeek?.cogs)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Operating Expenses:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatAmount(comparisons.thisWeek?.expenses)} {currencySymbol}
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Estimated Net Profit:</span>
                  <span
                    className={
                      (comparisons.thisWeek?.netProfit || 0) >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatAmount(comparisons.thisWeek?.netProfit)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Profit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 font-bold text-emerald-700 dark:text-emerald-300">
                  This Month
                </span>
              </div>

              {/* Large Gross Profit display */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Gross Profit (Revenue − Cost)
                </span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {isLoading ? '...' : formatAmount(comparisons.thisMonth?.grossProfit)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Sales Revenue:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.thisMonth?.revenue)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Cost of Medicines:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatAmount(comparisons.thisMonth?.cogs)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Operating Expenses:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatAmount(comparisons.thisMonth?.expenses)} {currencySymbol}
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Estimated Net Profit:</span>
                  <span
                    className={
                      (comparisons.thisMonth?.netProfit || 0) >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatAmount(comparisons.thisMonth?.netProfit)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Period (Custom Date Range) */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800 pb-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Selected Range Profit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Active
                </span>
              </div>

              {/* Large Gross Profit display */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-bold text-emerald-800/80 dark:text-emerald-300/80 block tracking-wider">
                  Gross Profit (Revenue − Cost)
                </span>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                    {isLoading ? '...' : formatAmount(summary.grossProfit)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{currencySymbol}</span>
                </div>
              </div>

              {/* Breakdown lines */}
              <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Sales Revenue:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatAmount(summary.totalRevenue)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Cost of Medicines:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatAmount(summary.costOfMedicinesSold ?? summary.cogs)} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Operating Expenses:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatAmount(summary.operatingExpenses)} {currencySymbol}
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-dashed border-emerald-300 dark:border-emerald-800 flex justify-between font-bold">
                  <span className="text-emerald-900 dark:text-emerald-200">Estimated Net Profit:</span>
                  <span
                    className={
                      isNetPositive
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatAmount(summary.estimatedNetProfit)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


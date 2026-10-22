import React, { useState } from 'react';
import { Calendar, BarChart3, CheckCircle2, AlertCircle, DollarSign, Filter, RefreshCw } from 'lucide-react';
import { useExpenseReports } from '../hooks/use-expenses';
import { useAppDate } from '@/shared/lib/date-utils';

export const ExpenseReportsView = ({ currencySymbol = 'Birr' }) => {
  const { formatDate, calendarType } = useAppDate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reportData, isLoading, refetch } = useExpenseReports({
    startDate,
    endDate,
  });

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const summary = reportData?.summary || {};
  const byCategory = reportData?.byCategory || [];
  const monthlyComparison = reportData?.monthlyComparison || [];

  const maxMonthTotal = Math.max(...monthlyComparison.map((m) => m.total), 1);

  return (
    <div className="space-y-5">
      {/* Date Range Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Report Period Filter:</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {calendarType === 'ethiopian' ? 'Ethiopian (E.C.)' : 'Gregorian (G.C.)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title={`From Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title={`To Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
            />
          </div>

          {(startDate || endDate) && (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              ({startDate ? formatDate(startDate) : '...'} &rarr; {endDate ? formatDate(endDate) : '...'})
            </span>
          )}

          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Refresh Report"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards in Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Expenses in Period</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatAmount(summary.totalAmount)}
            </span>
            <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{summary.totalRecords || 0} records</span>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">Paid Expenses</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
              {formatAmount(summary.totalPaid)}
            </span>
            <span className="text-xs font-bold text-emerald-600">{currencySymbol}</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">
            {summary.paidRatio || 0}% settled
          </span>
        </div>

        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 block">Unpaid Expenses</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-800 dark:text-rose-200">
              {formatAmount(summary.totalUnpaid)}
            </span>
            <span className="text-xs font-bold text-rose-600">{currencySymbol}</span>
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 mt-1 block">
            {summary.unpaidRatio || 0}% outstanding
          </span>
        </div>
      </div>

      {/* Visual Paid vs Unpaid Progress Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">Paid vs Unpaid Ratio</span>
          <span className="text-slate-500">
            {summary.paidRatio || 0}% Paid &bull; {summary.unpaidRatio || 0}% Unpaid
          </span>
        </div>
        <div className="w-full h-3 bg-rose-200 dark:bg-rose-950/60 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${summary.paidRatio || 0}%` }}
          />
        </div>
      </div>

      {/* Two columns: Monthly Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Comparison */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Monthly Expense Comparison
              </h4>
            </div>
            <span className="text-xs text-slate-400">Last 12 Months</span>
          </div>

          {monthlyComparison.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No monthly data recorded yet</div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {monthlyComparison.map((m, i) => {
                const ratio = Math.round((m.total / maxMonthTotal) * 100);
                return (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">
                        {m.monthLabel}
                        {calendarType === 'ethiopian' && m.month && (
                          <span className="ml-1.5 text-[10px] text-slate-400 font-normal">
                            ({formatDate(`${m.month}-01`, { showMonthName: true })})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatAmount(m.total)} {currencySymbol}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({m.count} bills)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(3, ratio)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Paid: {formatAmount(m.paidTotal)} {currencySymbol}</span>
                      <span>Unpaid: {formatAmount(m.dueTotal)} {currencySymbol}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Expenses by Category
              </h4>
            </div>
            <span className="text-xs text-slate-400">Breakdown</span>
          </div>

          {byCategory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No category data recorded yet</div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {byCategory.map((cat, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {formatAmount(cat.total)} {currencySymbol}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(2, cat.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{cat.count} expense(s)</span>
                    <span>Paid: {formatAmount(cat.paidTotal)} &bull; Due: {formatAmount(cat.dueTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { ShoppingCart, TrendingUp, Package, Receipt } from 'lucide-react';
import { useSalesReports } from '../hooks/use-reports';

export const SalesReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
  onCardClick,
}) => {
  const { data, isLoading } = useSalesReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const salesByDate = data?.salesByDate || [];
  const transactions = data?.transactions || [];

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Revenue */}
        <div
          onClick={() => onCardClick?.('SALES_REVENUE', { transactions, salesByDate, summary })}
          className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sales Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.totalRevenue)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
              Across {summary.totalTransactions || 0} completed orders
            </span>
          </div>
        </div>

        {/* Transactions Count */}
        <div
          onClick={() => onCardClick?.('SALES_TRANSACTIONS', { transactions, salesByDate, summary })}
          className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Transactions</span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : summary.totalTransactions || 0}
              </span>
              <span className="text-xs font-bold text-slate-500">Sales</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Checkout receipts issued</span>
          </div>
        </div>

        {/* Units Sold */}
        <div
          onClick={() => onCardClick?.('SALES_UNITS', { transactions, salesByDate, summary })}
          className="p-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Medicines Sold</span>
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : summary.totalUnitsSold || 0}
              </span>
              <span className="text-xs font-bold text-slate-500">Units</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Dispensed inventory units</span>
          </div>
        </div>

        {/* Average Transaction Value */}
        <div
          onClick={() => onCardClick?.('SALES_AVG', { transactions, salesByDate, summary })}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Order Value</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform group-hover:scale-110">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.averageTransactionValue)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Per customer receipt</span>
          </div>
        </div>
      </div>
    </div>
  );
};


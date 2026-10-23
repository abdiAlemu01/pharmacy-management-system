import React from 'react';
import { ShoppingCart, TrendingUp, PackageCheck, CircleDollarSign } from 'lucide-react';

export const DashboardStatsCards = ({
  today,
  mostSoldMedicine,
  mostProfitableMedicine,
  currencySymbol = 'ETB',
}) => {
  const formatCurrency = (val) => {
    return `${currencySymbol} ${parseFloat(Number(val || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const todaySales = today?.sales || 0;
  const todayTransactions = today?.transactions || 0;
  const todayProfit = today?.profit || 0;
  const todayMargin = today?.margin || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Sales */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(todaySales)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Orders completed</span>
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            {todayTransactions} {todayTransactions === 1 ? 'sale' : 'sales'}
          </span>
        </div>
      </div>

      {/* 2. Today's Profit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Profit
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(todayProfit)}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Profit margin</span>
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
            {todayMargin}% margin
          </span>
        </div>
      </div>

      {/* 3. Today's Most Sold Medicine */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Most Sold Medicine
            </span>
            <div
              className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate"
              title={mostSoldMedicine?.name || 'No sales yet today'}
            >
              {mostSoldMedicine?.name || 'No sales yet today'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Units sold today</span>
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
            {mostSoldMedicine ? `${mostSoldMedicine.quantitySold} units` : '0 units'}
          </span>
        </div>
      </div>

      {/* 4. Today's Most Profitable Medicine */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Most Profitable Medicine
            </span>
            <div
              className="text-lg sm:text-xl font-extrabold text-purple-700 dark:text-purple-300 truncate"
              title={mostProfitableMedicine?.name || 'No sales yet today'}
            >
              {mostProfitableMedicine?.name || 'No sales yet today'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Profit today</span>
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg bg-purple-100/80 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
            {mostProfitableMedicine ? formatCurrency(mostProfitableMedicine.totalProfit) : formatCurrency(0)}
          </span>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Calendar, DollarSign, Clock, AlertCircle, FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const ExpenseSummaryCards = ({
  summary = {},
  isLoading = false,
  currencySymbol = 'Birr',
  onCardClick,
  activeFilter = null,
}) => {
  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const cards = [
    {
      key: 'YEAR',
      title: 'Expenses This Year',
      value: formatAmount(summary.totalExpensesYear),
      unit: currencySymbol,
      icon: Calendar,
      borderColor: 'border-blue-200 dark:border-blue-900/60',
      bgColor: 'bg-blue-50/60 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      activeRing: 'ring-2 ring-blue-500 shadow-md ring-offset-1 dark:ring-offset-slate-900',
      hint: 'Click to view this year',
    },
    {
      key: 'MONTH',
      title: 'Expenses This Month',
      value: formatAmount(summary.totalExpensesMonth),
      unit: currencySymbol,
      icon: DollarSign,
      borderColor: 'border-emerald-200 dark:border-emerald-900/60',
      bgColor: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      activeRing: 'ring-2 ring-emerald-500 shadow-md ring-offset-1 dark:ring-offset-slate-900',
      hint: 'Click to view this month',
    },
    {
      key: 'TODAY',
      title: 'Expenses Today',
      value: formatAmount(summary.totalExpensesToday),
      unit: currencySymbol,
      icon: Clock,
      borderColor: 'border-indigo-200 dark:border-indigo-900/60',
      bgColor: 'bg-indigo-50/60 dark:bg-indigo-950/20',
      iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
      activeRing: 'ring-2 ring-indigo-500 shadow-md ring-offset-1 dark:ring-offset-slate-900',
      hint: 'Click to view today',
    },
    {
      key: 'UNPAID',
      title: 'Total Unpaid Expenses',
      value: formatAmount(summary.totalUnpaidExpenses),
      unit: currencySymbol,
      icon: AlertCircle,
      borderColor: summary.totalUnpaidExpenses > 0 ? 'border-rose-200 dark:border-rose-900/60' : 'border-slate-200 dark:border-slate-800',
      bgColor: summary.totalUnpaidExpenses > 0 ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'bg-slate-50 dark:bg-slate-900/40',
      iconColor: summary.totalUnpaidExpenses > 0 ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40' : 'text-slate-500 bg-slate-100 dark:bg-slate-800',
      hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
      activeRing: 'ring-2 ring-rose-500 shadow-md ring-offset-1 dark:ring-offset-slate-900',
      alert: summary.totalUnpaidExpenses > 0,
      hint: 'Click to view unpaid',
    },
    {
      key: 'RECORDS',
      title: 'Number of Records',
      value: String(summary.totalRecords || 0),
      unit: 'Records',
      icon: FileText,
      borderColor: 'border-slate-200 dark:border-slate-800',
      bgColor: 'bg-slate-50/60 dark:bg-slate-900/40',
      iconColor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
      hoverBorder: 'hover:border-slate-400 dark:hover:border-slate-600',
      activeRing: 'ring-2 ring-slate-500 shadow-md ring-offset-1 dark:ring-offset-slate-900',
      hint: 'Click to view all records',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;

        return (
          <div
            key={card.key}
            onClick={() => onCardClick?.(card.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick?.(card.key);
              }
            }}
            title={`${card.title} — ${card.hint}`}
            className={`p-4 rounded-2xl border ${card.borderColor} ${card.bgColor} ${card.hoverBorder} shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none ${
              isActive ? card.activeRing : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.iconColor} transition-transform group-hover:scale-110`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                {isLoading ? (
                  <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md" />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                      {card.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {card.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {isActive ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Filtered</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

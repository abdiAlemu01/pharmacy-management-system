import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Boxes,
  Truck,
  CreditCard,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';

export const BusinessPerformanceOverview = ({
  overview = {},
  currencySymbol = 'Birr',
  isLoading = false,
}) => {
  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  const cards = [
    {
      id: 'todaySales',
      title: "Today's Sales Revenue",
      value: formatBirr(overview.todaySales),
      change: overview.salesChangePct,
      subtext: `Yesterday: ${formatBirr(overview.yesterdaySales)}`,
      icon: TrendingUp,
      color: 'emerald',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-200/80 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'todayGrossProfit',
      title: "Today's Gross Profit",
      value: formatBirr(overview.todayGrossProfit),
      change: overview.profitChangePct,
      subtext: 'Net profit after medicine cost',
      icon: Sparkles,
      color: 'teal',
      bgGlow: 'from-teal-500/10 to-transparent',
      borderColor: 'border-teal-200/80 dark:border-teal-900/50',
      iconBg: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'todayExpenses',
      title: "Today's Expenses",
      value: formatBirr(overview.todayExpenses),
      change: null,
      subtext: 'Operational business expenses',
      icon: CreditCard,
      color: 'rose',
      bgGlow: 'from-rose-500/10 to-transparent',
      borderColor: 'border-rose-200/80 dark:border-rose-900/50',
      iconBg: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'todayTransactions',
      title: 'Sales Transactions',
      value: `${overview.todayTransactions || 0}`,
      change: overview.transactionsChangePct,
      subtext: `Yesterday: ${overview.yesterdayTransactions || 0} orders`,
      icon: Receipt,
      color: 'blue',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-200/80 dark:border-blue-900/50',
      iconBg: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'inventoryValue',
      title: 'Current Inventory Value',
      value: formatBirr(overview.inventoryCostValue),
      change: null,
      subtext: `${overview.totalMedicinesCount || 0} medicines (${overview.totalStockUnits || 0} units)`,
      icon: Boxes,
      color: 'purple',
      bgGlow: 'from-purple-500/10 to-transparent',
      borderColor: 'border-purple-200/80 dark:border-purple-900/50',
      iconBg: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'outstandingSupplier',
      title: 'Outstanding Supplier Balance',
      value: formatBirr(overview.outstandingSupplierBalance),
      change: null,
      subtext: `${overview.unpaidSupplierInvoicesCount || 0} unpaid purchase bills`,
      icon: Truck,
      color: 'amber',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-200/80 dark:border-amber-900/50',
      iconBg: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          1. Business Performance Overview
        </h2>
        <span className="text-xs text-slate-400 font-medium">Updated live from sales & finance</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const hasChange = card.change !== null && card.change !== undefined;
          const isPositive = card.change >= 0;

          return (
            <div
              key={card.id}
              className={`p-4 bg-white dark:bg-slate-900 border ${card.borderColor} rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.bgGlow} pointer-events-none rounded-bl-full`} />

              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                    {card.title}
                  </span>
                  <div className={`p-2 rounded-xl ${card.iconBg} shrink-0 transition-transform group-hover:scale-110 shadow-2xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-2.5">
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight block">
                    {isLoading ? '...' : card.value}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[11px]">
                <span className="text-slate-400 truncate" title={card.subtext}>
                  {card.subtext}
                </span>

                {hasChange && (
                  <span
                    className={`inline-flex items-center gap-0.5 font-black shrink-0 px-1.5 py-0.5 rounded ${
                      isPositive
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                        : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(card.change)}%</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


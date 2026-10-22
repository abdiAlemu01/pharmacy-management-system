import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Building2,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export const PurchasesSummaryCards = ({
  summary,
  onCardClick,
  activeFilter = null,
}) => {
  const [showReports, setShowReports] = useState(false);

  const overview = summary?.overview || {
    totalPurchasesCount: 0,
    totalPurchasesCost: 0,
    totalAmountPaid: 0,
    totalOutstandingBalance: 0,
    purchasesTodayAmount: 0,
    purchasesTodayCount: 0,
    purchasesThisMonthAmount: 0,
    purchasesThisMonthCount: 0,
    purchasesThisYearAmount: 0,
    purchasesThisYearCount: 0,
  };

  const spendingBySupplier = summary?.spendingBySupplier || [];
  const mostPurchasedMedicines = summary?.mostPurchasedMedicines || [];

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const cards = [
    {
      key: 'TODAY',
      title: 'Purchases Today',
      value: formatBirr(overview.purchasesTodayAmount),
      subtitle: `${overview.purchasesTodayCount} order${overview.purchasesTodayCount !== 1 ? 's' : ''} today`,
      icon: Calendar,
      iconColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      activeRing: 'ring-2 ring-emerald-500 shadow-md ring-offset-1 dark:ring-offset-slate-900 border-emerald-400 dark:border-emerald-500',
      borderColor: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500',
      textColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      key: 'MONTH',
      title: 'This Month',
      value: formatBirr(overview.purchasesThisMonthAmount),
      subtitle: `${overview.purchasesThisMonthCount} orders recorded`,
      icon: TrendingUp,
      iconColor: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400',
      activeRing: 'ring-2 ring-sky-500 shadow-md ring-offset-1 dark:ring-offset-slate-900 border-sky-400 dark:border-sky-500',
      borderColor: 'border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500',
      textColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      key: 'YEAR',
      title: 'This Year',
      value: formatBirr(overview.purchasesThisYearAmount),
      subtitle: `${overview.purchasesThisYearCount} total orders`,
      icon: DollarSign,
      iconColor: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
      activeRing: 'ring-2 ring-indigo-500 shadow-md ring-offset-1 dark:ring-offset-slate-900 border-indigo-400 dark:border-indigo-500',
      borderColor: 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500',
      textColor: 'text-slate-900 dark:text-slate-100',
    },
    {
      key: 'PAID',
      title: 'Paid to Suppliers',
      value: formatBirr(overview.totalAmountPaid),
      subtitle: 'Cash settled',
      icon: CreditCard,
      iconColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
      activeRing: 'ring-2 ring-emerald-500 shadow-md ring-offset-1 dark:ring-offset-slate-900 border-emerald-400 dark:border-emerald-500',
      borderColor: 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      key: 'OUTSTANDING',
      title: 'Outstanding Balance',
      value: formatBirr(overview.totalOutstandingBalance),
      subtitle: 'Accounts payable',
      icon: AlertCircle,
      iconColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
      activeRing: 'ring-2 ring-rose-500 shadow-md ring-offset-1 dark:ring-offset-slate-900 border-rose-400 dark:border-rose-500',
      borderColor: 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 5 KPI Metric Cards */}
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
              title={`${card.title} — Click to view content`}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none ${
                isActive ? card.activeRing : card.borderColor
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${card.iconColor} transition-transform group-hover:scale-110`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className={`text-lg font-black ${card.textColor}`}>
                  {card.value}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {card.subtitle}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
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

      {/* Toggle Supplier Spend & Top Medicines Activity Reports */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowReports((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 px-3 rounded-xl shadow-2xs"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{showReports ? 'Hide Reports & Analytics' : 'Show Reports & Analytics'}</span>
          {showReports ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Reports Detail */}
      {showReports && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-200">
          {/* Spending by Supplier */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Spending by Supplier</span>
            </h4>

            {spendingBySupplier.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">No supplier spend data recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="py-2 px-3">Supplier</th>
                      <th className="py-2 px-3 text-center">Orders</th>
                      <th className="py-2 px-3">Total Spend</th>
                      <th className="py-2 px-3 text-rose-600">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {spendingBySupplier.map((s) => (
                      <tr key={s.supplierId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{s.supplierName}</td>
                        <td className="py-2 px-3 text-center font-semibold">{s.orderCount}</td>
                        <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">{formatBirr(s.totalSpent)}</td>
                        <td className="py-2 px-3 font-bold text-rose-600">{formatBirr(s.outstandingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Most Frequently Purchased Medicines */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Most Frequently Purchased Medicines</span>
            </h4>

            {mostPurchasedMedicines.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">No medicine purchase history recorded yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold">
                    <tr>
                      <th className="py-2 px-3">Medicine</th>
                      <th className="py-2 px-3 text-center">Units Purchased</th>
                      <th className="py-2 px-3">Total Spend</th>
                      <th className="py-2 px-3">Avg Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mostPurchasedMedicines.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">{m.medicineName}</td>
                        <td className="py-2 px-3 text-center font-semibold">{m.totalUnitsPurchased}</td>
                        <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">{formatBirr(m.totalSpend)}</td>
                        <td className="py-2 px-3 font-semibold">{formatBirr(m.averageUnitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
} from 'lucide-react';

export const PurchasesSummaryCards = ({ summary }) => {
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

  return (
    <div className="space-y-4">
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Today */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Purchases Today</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            {formatBirr(overview.purchasesTodayAmount)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {overview.purchasesTodayCount} order{overview.purchasesTodayCount !== 1 ? 's' : ''} today
          </p>
        </div>

        {/* This Month */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">This Month</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            {formatBirr(overview.purchasesThisMonthAmount)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {overview.purchasesThisMonthCount} orders recorded
          </p>
        </div>

        {/* This Year */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">This Year</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
            {formatBirr(overview.purchasesThisYearAmount)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {overview.purchasesThisYearCount} total orders
          </p>
        </div>

        {/* Amount Paid */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Paid to Suppliers</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
            {formatBirr(overview.totalAmountPaid)}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
            Cash settled
          </p>
        </div>

        {/* Outstanding Balance Due */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Outstanding Balance</span>
            <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-rose-700 dark:text-rose-400">
            {formatBirr(overview.totalOutstandingBalance)}
          </p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Accounts payable
          </p>
        </div>
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


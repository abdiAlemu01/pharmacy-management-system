import React from 'react';
import { ShoppingBag, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePurchaseReports } from '../hooks/use-reports';

export const PurchaseReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
}) => {
  const { data, isLoading } = usePurchaseReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const suppliers = data?.suppliers || [];

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
        {/* Total Purchase Cost */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Purchase Cost</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform group-hover:scale-110">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.totalPurchaseCost)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Across {summary.totalOrders || 0} purchase orders
            </span>
          </div>
        </div>

        {/* Total Amount Paid */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Settled to Suppliers</span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {isLoading ? '...' : formatAmount(summary.totalAmountPaid)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
              {summary.fullyPaidCount || 0} fully paid bills
            </span>
          </div>
        </div>

        {/* Outstanding Supplier Balances Due */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Supplier Debt (Due)</span>
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                {isLoading ? '...' : formatAmount(summary.totalAmountDue)}
              </span>
              <span className="text-xs font-bold text-rose-600">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
              {summary.unpaidCount || 0} completely unpaid bills
            </span>
          </div>
        </div>

        {/* Suppliers Involved */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Suppliers</span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : suppliers.length}
              </span>
              <span className="text-xs font-bold text-slate-500">Vendors</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Supplied stock in this period
            </span>
          </div>
        </div>
      </div>

      {/* 2. Purchases by Supplier Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Purchases by Supplier
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {suppliers.length} {suppliers.length === 1 ? 'Supplier' : 'Suppliers'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Supplier Name</th>
                <th className="py-2.5 px-4">Phone / Contact</th>
                <th className="py-2.5 px-4 text-center">Orders Count</th>
                <th className="py-2.5 px-4 text-right">Total Ordered ({currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Amount Paid ({currencySymbol})</th>
                <th className="py-2.5 px-4 text-right font-black">Balance Due ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No purchase orders recorded for any supplier in this period.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.supplierId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {s.supplierName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.supplierPhone || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {s.ordersCount} orders
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatAmount(s.totalCost)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                      {formatAmount(s.amountPaid)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-black ${
                        s.outstandingBalance > 0
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatAmount(s.outstandingBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


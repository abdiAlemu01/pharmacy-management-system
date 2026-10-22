import React, { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  PackageCheck,
  AlertCircle,
  CheckCircle2,
  Search,
  Calendar,
  User,
} from 'lucide-react';
import { usePurchaseReports } from '../hooks/use-reports';
import { useAppDate } from '@/shared/lib/date-utils';

export const PurchaseReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
  onCardClick,
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [subView, setSubView] = useState('suppliers'); // 'suppliers' | 'medicines' | 'orders'
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePurchaseReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const suppliers = data?.suppliers || [];
  const medicinesPurchased = data?.medicinesPurchased || [];
  const orders = data?.orders || [];

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
        <div
          onClick={() => onCardClick?.('PUR_TOTAL', { summary, suppliers, medicinesPurchased, orders })}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
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
        <div
          onClick={() => onCardClick?.('PUR_PAID', { summary, suppliers, medicinesPurchased, orders })}
          className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
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
        <div
          onClick={() => onCardClick?.('PUR_DEBT', { summary, suppliers, medicinesPurchased, orders })}
          className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
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
        <div
          onClick={() => onCardClick?.('PUR_SUPPLIERS', { summary, suppliers, medicinesPurchased, orders })}
          className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
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

      {/* 2. Sub-View Toggles */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSubView('suppliers')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            subView === 'suppliers'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Purchases by Supplier ({suppliers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('medicines')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            subView === 'medicines'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Medicines Purchased & Received ({medicinesPurchased.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('orders')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            subView === 'orders'
              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Purchase Orders List ({orders.length})</span>
        </button>
      </div>

      {/* 3. Sub-View Tables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {/* Suppliers Summary */}
        {subView === 'suppliers' && (
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
        )}

        {/* Medicines Purchased */}
        {subView === 'medicines' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Medicine Name</th>
                  <th className="py-2.5 px-4 text-center">Orders Placed</th>
                  <th className="py-2.5 px-4 text-center">Ordered Qty</th>
                  <th className="py-2.5 px-4 text-center">Received Qty</th>
                  <th className="py-2.5 px-4 text-right">Avg Unit Cost ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right font-black">Total Cost ({currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {medicinesPurchased.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No medicines purchased in this period.
                    </td>
                  </tr>
                ) : (
                  medicinesPurchased.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {m.medicineName}
                      </td>
                      <td className="py-2.5 px-4 text-center font-medium text-slate-600 dark:text-slate-400">
                        {m.ordersCount}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {m.orderedQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        {m.receivedQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(m.avgUnitCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                        {formatAmount(m.totalCost)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Purchase Orders List */}
        {subView === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">PO Number</th>
                  <th className="py-2.5 px-4">Order Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-4 text-right">Total ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Paid ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Due ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No purchase orders found in this period.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {o.purchaseOrderNo}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {formatDate(o.orderDate)}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {o.supplierName}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                        {formatAmount(o.totalCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                        {formatAmount(o.amountPaid)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          o.amountDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {formatAmount(o.amountDue)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : o.paymentStatus === 'PARTIAL' || o.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


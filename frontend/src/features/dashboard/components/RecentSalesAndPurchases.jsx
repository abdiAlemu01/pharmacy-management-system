import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Truck,
  ArrowRight,
  ExternalLink,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const RecentSalesAndPurchases = ({
  recentSales = [],
  recentPurchases = [],
  currencySymbol = 'Birr',
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'purchases'

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencySymbol}`;
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Table Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Recent Sales & Purchases
            </h3>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recent Sales ({recentSales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchases')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'purchases'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Recent Purchases ({recentPurchases.length})</span>
          </button>
        </div>
      </div>

      {/* Content: Recent Sales Table */}
      {activeTab === 'sales' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Receipt / ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {s.receiptNo}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                        {s.itemsCount} medicines ({s.totalUnits} units)
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {s.cashierName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatBirr(s.total)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        +{formatBirr(s.profit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Sales Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Content: Recent Purchases Table */}
      {activeTab === 'purchases' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Order / Invoice</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                  <th className="py-2.5 px-3 text-right">Amount Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPurchases.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {p.invoiceNo !== 'N/A' ? p.invoiceNo : p.purchaseOrderNo}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {p.supplierName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(p.orderDate)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatBirr(p.totalCost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                        {p.amountDue > 0 ? (
                          <span className="text-rose-600">{formatBirr(p.amountDue)}</span>
                        ) : (
                          <span className="text-emerald-600">Paid in full</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            p.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : p.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Supplier Purchases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Clock,
  Ban,
  TrendingUp,
  Sliders,
  DollarSign,
  Search,
  Package,
} from 'lucide-react';
import { useInventoryReports } from '../hooks/use-reports';
import { useAppDate } from '@/shared/lib/date-utils';

export const InventoryReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
  onCardClick,
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [activeSection, setActiveSection] = useState('low-stock'); // 'low-stock' | 'expired' | 'soon-expiring' | 'adjustments'
  const [search, setSearch] = useState('');

  const { data, isLoading } = useInventoryReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const lowStockList = data?.lowStockList || [];
  const expiredList = data?.expiredList || [];
  const soonExpiringList = data?.soonExpiringList || [];
  const adjustments = data?.adjustments || [];

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Inventory Valuation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Cost Value (Capital invested) */}
        <div
          onClick={() => onCardClick?.('INV_VALUATION', { summary, lowStockList, expiredList, soonExpiringList, adjustments })}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Capital in Stock (Cost)</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform group-hover:scale-110">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.totalCostValue)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.totalUnitsInStock || 0} units across {summary.totalMedicines || 0} medicines
            </span>
          </div>
        </div>

        {/* Potential Retail Value */}
        <div
          onClick={() => onCardClick?.('INV_RETAIL', { summary, lowStockList, expiredList, soonExpiringList, adjustments })}
          className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Retail Sales Value</span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.totalRetailValue)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-1 block">
              Potential Profit: {formatAmount(summary.potentialProfit)} {currencySymbol}
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onCardClick?.('INV_LOW_STOCK', { summary, lowStockList, expiredList, soonExpiringList, adjustments })}
          className="p-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Low & Out-of-Stock</span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 transition-transform group-hover:scale-110">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-800 dark:text-amber-300">
                {isLoading ? '...' : summary.lowStockCount || 0}
              </span>
              <span className="text-xs font-bold text-slate-500">Medicines</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-1 block">
              {summary.outOfStockCount || 0} completely out of stock
            </span>
          </div>
        </div>

        {/* Expiration Risk */}
        <div
          onClick={() => onCardClick?.('INV_EXPIRY', { summary, lowStockList, expiredList, soonExpiringList, adjustments })}
          className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Expiry Vulnerability</span>
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                {isLoading ? '...' : (summary.expiredCount || 0) + (summary.soonExpiringCount || 0)}
              </span>
              <span className="text-xs font-bold text-slate-500">Items</span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
              {summary.expiredCount || 0} expired &bull; {summary.soonExpiringCount || 0} expiring soon
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Section Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveSection('low-stock')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'low-stock'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Medicines ({lowStockList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('soon-expiring')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'soon-expiring'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Expiring in Next 90 Days ({soonExpiringList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('expired')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'expired'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Expired Medicines ({expiredList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('adjustments')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'adjustments'
              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Adjustments & Damaged ({adjustments.length})</span>
        </button>
      </div>

      {/* 3. Section Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {/* Low Stock View */}
        {activeSection === 'low-stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Medicine Name</th>
                  <th className="py-2.5 px-4 text-center">Remaining Stock</th>
                  <th className="py-2.5 px-4 text-right">Cost Price ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Selling Price ({currencySymbol})</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                  <th className="py-2.5 px-4 text-center">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No medicines currently low or out of stock! Inventory levels are healthy.
                    </td>
                  </tr>
                ) : (
                  lowStockList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {m.name}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            m.quantity === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {m.quantity} in stock
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(m.purchaseCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatAmount(m.sellingPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {m.expiryDate ? formatDate(m.expiryDate) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'OUT_OF_STOCK'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {m.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Soon-Expiring View */}
        {activeSection === 'soon-expiring' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Medicine Name</th>
                  <th className="py-2.5 px-4 text-center">Units in Hand</th>
                  <th className="py-2.5 px-4 text-right">Cost Price ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Capital at Risk ({currencySymbol})</th>
                  <th className="py-2.5 px-4">Expiration Date</th>
                  <th className="py-2.5 px-4 text-center">Days Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {soonExpiringList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No medicines expiring within the next 90 days.
                    </td>
                  </tr>
                ) : (
                  soonExpiringList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {m.name}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {m.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(m.purchaseCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-rose-700 dark:text-rose-400">
                        {formatAmount(m.costAtRisk)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {formatDate(m.expiryDate, { showMonthName: true })}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {m.daysUntilExpiry} days left
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Expired Medicines View */}
        {activeSection === 'expired' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Expired Medicine</th>
                  <th className="py-2.5 px-4 text-center">Units on Shelf</th>
                  <th className="py-2.5 px-4 text-right">Cost Price ({currencySymbol})</th>
                  <th className="py-2.5 px-4 text-right">Expired Loss Value ({currencySymbol})</th>
                  <th className="py-2.5 px-4">Expired On ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                  <th className="py-2.5 px-4 text-center">Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expiredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Great news! There are zero expired medicines in inventory.
                    </td>
                  </tr>
                ) : (
                  expiredList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-rose-900 dark:text-rose-200">
                        {m.name}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-rose-700 dark:text-rose-300">
                        {m.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(m.purchaseCost)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-rose-700 dark:text-rose-400">
                        {formatAmount(m.lossValue)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {formatDate(m.expiryDate, { showMonthName: true })}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          QUARANTINE / DISPOSE
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Stock Adjustments & Damaged Medicines Audit Log */}
        {activeSection === 'adjustments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Medicine</th>
                  <th className="py-2.5 px-4 text-center">Type</th>
                  <th className="py-2.5 px-4 text-center">Stock Shift</th>
                  <th className="py-2.5 px-4">Reason / Notes</th>
                  <th className="py-2.5 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {adjustments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock adjustments or damaged goods recorded in this period.
                    </td>
                  </tr>
                ) : (
                  adjustments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(a.createdAt)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {a.medicineName}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {a.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold">
                        <span className="text-slate-400">{a.previousQuantity}</span> &rarr;{' '}
                        <strong className="text-slate-800 dark:text-slate-200">{a.newQuantity}</strong>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                        {a.reason}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {a.userName}
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


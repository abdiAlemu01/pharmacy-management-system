import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  AlertTriangle,
  CalendarClock,
  Skull,
  CreditCard,
  ShoppingBag,
  Search,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppDate } from '@/shared/lib/date-utils';

export const AlertCardContentModal = ({
  isOpen,
  onClose,
  alertType, // 'lowStock' | 'nearingExpiry' | 'expired' | 'paymentDue' | 'pendingPo'
  alertMetrics = {},
  thresholds = {},
  currencySymbol = 'Birr',
}) => {
  const navigate = useNavigate();
  const { formatDate } = useAppDate();
  const [searchTerm, setSearchTerm] = useState('');

  const config = useMemo(() => {
    switch (alertType) {
      case 'lowStock':
        return {
          title: 'Low-Stock Medicines',
          subtitle: `Active medicine items below the minimum safety threshold (${thresholds.lowStockThreshold || 10} units)`,
          icon: AlertTriangle,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800',
          targetRoute: '/medicines',
          targetLabel: 'Manage Medicines',
          count: alertMetrics.lowStockCount || 0,
          items: alertMetrics.lowStockItems || [],
        };
      case 'nearingExpiry':
        return {
          title: 'Medicines Nearing Expiry',
          subtitle: `Batches expiring within the next ${thresholds.expiryThresholdDays || 90} days`,
          icon: CalendarClock,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800',
          targetRoute: '/inventory',
          targetLabel: 'Open Inventory',
          count: alertMetrics.nearingExpiryCount || 0,
          items: alertMetrics.nearingExpiryItems || [],
        };
      case 'expired':
        return {
          title: 'Expired Medicine Batches',
          subtitle: 'Batches that have passed expiration date and must be removed from dispensing',
          icon: Skull,
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
          iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800',
          targetRoute: '/inventory',
          targetLabel: 'Open Inventory',
          count: alertMetrics.expiredCount || 0,
          items: alertMetrics.expiredItems || [],
        };
      case 'paymentDue':
        return {
          title: 'Supplier Payments Due',
          subtitle: 'Purchase orders with outstanding balances and pending supplier invoices',
          icon: CreditCard,
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
          iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800',
          targetRoute: '/purchases',
          targetLabel: 'View Purchases',
          count: alertMetrics.paymentDueCount || 0,
          items: alertMetrics.paymentDueItems || [],
        };
      case 'pendingPo':
      default:
        return {
          title: 'Pending Purchase Orders',
          subtitle: 'Active purchase orders awaiting supplier delivery and confirmation',
          icon: ShoppingBag,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800',
          targetRoute: '/purchases',
          targetLabel: 'View Purchases',
          count: alertMetrics.pendingPoCount || 0,
          items: alertMetrics.pendingPoItems || [],
        };
    }
  }, [alertType, alertMetrics, thresholds]);

  const filteredItems = useMemo(() => {
    const list = config.items || [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();

    return list.filter((item) => {
      const name = (item.medicineName || item.name || '').toLowerCase();
      const supplier = (item.supplierName || '').toLowerCase();
      const batch = (item.batchNo || '').toLowerCase();
      const status = (item.status || item.paymentStatus || '').toLowerCase();

      return (
        name.includes(term) ||
        supplier.includes(term) ||
        batch.includes(term) ||
        status.includes(term)
      );
    });
  }, [config.items, searchTerm]);

  if (!isOpen) return null;

  const Icon = config.icon;

  const handleNavigate = () => {
    onClose();
    if (config.targetRoute) {
      navigate(config.targetRoute);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-2 sm:p-4 md:p-6 pt-10 sm:pt-16 pb-10 sm:pb-16"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${config.iconColor}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {config.title}
                </h3>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${config.badgeColor}`}>
                  {config.count} {config.count === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {config.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by medicine, supplier, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 min-h-[220px]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {searchTerm ? 'No items match your search.' : 'All clear! No active alert items found.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Everything in this alert category is within safe limits.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  {alertType === 'lowStock' && (
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3 text-center">Current Stock</th>
                      <th className="py-2.5 px-3 text-center">Safety Threshold</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  )}
                  {alertType === 'nearingExpiry' && (
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Batch No</th>
                      <th className="py-2.5 px-3 text-center">Stock</th>
                      <th className="py-2.5 px-3 text-right">Expiration Date</th>
                    </tr>
                  )}
                  {alertType === 'expired' && (
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Batch No</th>
                      <th className="py-2.5 px-3 text-center">Stock To Remove</th>
                      <th className="py-2.5 px-3 text-right">Expired Date</th>
                    </tr>
                  )}
                  {alertType === 'paymentDue' && (
                    <tr>
                      <th className="py-2.5 px-3">Medicine / Order</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3 text-right">Amount Due ({currencySymbol})</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  )}
                  {alertType === 'pendingPo' && (
                    <tr>
                      <th className="py-2.5 px-3">Medicine / Order</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3 text-right">Total Cost ({currencySymbol})</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {alertType === 'lowStock' && (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-amber-700 dark:text-amber-400">
                            {item.quantity} units
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500">
                            {thresholds.lowStockThreshold || 10} units
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              LOW STOCK
                            </span>
                          </td>
                        </>
                      )}
                      {alertType === 'nearingExpiry' && (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.medicineName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {item.batchNo}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                            {item.quantity} units
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-blue-700 dark:text-blue-400">
                            {formatDate(item.expiryDate)}
                          </td>
                        </>
                      )}
                      {alertType === 'expired' && (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.medicineName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                            {item.batchNo}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-700 dark:text-rose-400">
                            {item.quantity} units
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-rose-700 dark:text-rose-400">
                            {formatDate(item.expiryDate)}
                          </td>
                        </>
                      )}
                      {alertType === 'paymentDue' && (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.medicineName || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {item.supplierName || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                            {parseFloat(item.amountDue || 0).toLocaleString()} {currencySymbol}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              {item.paymentStatus}
                            </span>
                          </td>
                        </>
                      )}
                      {alertType === 'pendingPo' && (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.medicineName || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                            {item.supplierName || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                            {parseFloat(item.totalCost || 0).toLocaleString()} {currencySymbol}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-2 p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            Showing {filteredItems.length} of {config.count} items
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {config.targetRoute && (
              <button
                type="button"
                onClick={handleNavigate}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                <span>{config.targetLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


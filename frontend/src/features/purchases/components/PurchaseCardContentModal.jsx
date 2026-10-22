import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertCircle,
  Search,
  Eye,
  Filter,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { usePurchases } from '../hooks/use-purchases';
import { DeliveryStatusBadge, PaymentStatusBadge } from './PurchaseStatusBadge';
import { useAppDate } from '@/shared/lib/date-utils';

export const PurchaseCardContentModal = ({
  isOpen,
  onClose,
  cardType, // 'TODAY' | 'MONTH' | 'YEAR' | 'PAID' | 'OUTSTANDING'
  onViewDetails,
  onApplyFilterToTable,
}) => {
  const { formatDate } = useAppDate();
  const [searchTerm, setSearchTerm] = useState('');

  // Compute card date range & filter configuration
  const cardConfig = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${currentYear}-${pad(currentMonthNum)}-${pad(now.getDate())}`;

    // Month dates
    const monthStart = `${currentYear}-${pad(currentMonthNum)}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonthNum, 0).getDate();
    const monthEnd = `${currentYear}-${pad(currentMonthNum)}-${pad(lastDayOfMonth)}`;

    // Year dates
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    switch (cardType) {
      case 'TODAY':
        return {
          title: `Purchases Today (${todayStr})`,
          subtitle: `Purchase orders recorded for today (${todayStr})`,
          icon: Calendar,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          startDate: todayStr,
          endDate: todayStr,
          paymentStatus: '',
        };
      case 'MONTH':
        return {
          title: `Purchases This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
          subtitle: `Orders placed between ${monthStart} and ${monthEnd}`,
          icon: TrendingUp,
          iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60',
          startDate: monthStart,
          endDate: monthEnd,
          paymentStatus: '',
        };
      case 'YEAR':
        return {
          title: `Purchases This Year (${currentYear})`,
          subtitle: `All purchase orders recorded for the year ${currentYear}`,
          icon: DollarSign,
          iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60',
          startDate: yearStart,
          endDate: yearEnd,
          paymentStatus: '',
        };
      case 'PAID':
        return {
          title: 'Paid to Suppliers',
          subtitle: 'Purchase orders where payments have been made and settled',
          icon: CreditCard,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60',
          startDate: '',
          endDate: '',
          paymentStatus: 'PAID',
        };
      case 'OUTSTANDING':
      default:
        return {
          title: 'Outstanding Balance Due',
          subtitle: 'Purchase orders with unpaid accounts payable balance',
          icon: AlertCircle,
          iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60',
          startDate: '',
          endDate: '',
          paymentStatus: 'OUTSTANDING',
        };
    }
  }, [cardType]);

  // Fetch purchases for this scope
  const { data: purchasesData, isLoading } = usePurchases({
    startDate: cardConfig.startDate,
    endDate: cardConfig.endDate,
    paymentStatus: cardConfig.paymentStatus,
    limit: 100, // Load up to 100 items for modal view
    page: 1,
  });

  const purchasesList = purchasesData?.data?.purchases || [];

  // Filter in memory by search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return purchasesList;
    const term = searchTerm.toLowerCase();

    return purchasesList.filter((p) => {
      const matchPO = p.purchaseOrderNo?.toLowerCase().includes(term);
      const matchSupplier = p.supplierName?.toLowerCase().includes(term);
      const matchInvoice = p.invoiceNo?.toLowerCase().includes(term);
      const matchItems = (p.items || []).some((item) =>
        item.medicineName?.toLowerCase().includes(term)
      );
      return matchPO || matchSupplier || matchInvoice || matchItems;
    });
  }, [purchasesList, searchTerm]);

  // Compute summary stats
  const stats = useMemo(() => {
    let totalCost = 0;
    let totalPaid = 0;
    let totalDue = 0;

    filteredList.forEach((p) => {
      totalCost += Number(p.totalCost || 0);
      totalPaid += Number(p.amountPaid || 0);
      totalDue += Number(p.amountDue || 0);
    });

    return {
      count: filteredList.length,
      totalCost,
      totalPaid,
      totalDue,
    };
  }, [filteredList]);

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  if (!isOpen) return null;

  const Icon = cardConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 pt-16 sm:pt-20 pb-16"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${cardConfig.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {cardConfig.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {stats.count} {stats.count === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {cardConfig.subtitle}
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

        {/* Quick KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Purchases</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {formatBirr(stats.totalCost)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Amount Paid</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatBirr(stats.totalPaid)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">Balance Due</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatBirr(stats.totalDue)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Matching Orders</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {stats.count} orders
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by supplier, PO #, invoice #, or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Loading purchase orders...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No purchase orders found for this view.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">PO Number</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Medicines</th>
                    <th className="py-2.5 px-3 text-right">Total Cost</th>
                    <th className="py-2.5 px-3 text-right text-emerald-600">Paid</th>
                    <th className="py-2.5 px-3 text-right text-rose-600">Due</th>
                    <th className="py-2.5 px-3 text-center">Delivery</th>
                    <th className="py-2.5 px-3 text-center">Payment</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((p) => {
                    const medicineNames = (p.items || [])
                      .map((i) => i.medicineName)
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {p.purchaseOrderNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(p.orderDate)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {p.supplierName}
                        </td>
                        <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={medicineNames}>
                          {medicineNames || `${p.totalItems || 0} items`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {formatBirr(p.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {formatBirr(p.amountPaid)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {formatBirr(p.amountDue)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <DeliveryStatusBadge status={p.status} />
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <PaymentStatusBadge status={p.paymentStatus} />
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onViewDetails(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onApplyFilterToTable(cardType, cardConfig);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filter to Main Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


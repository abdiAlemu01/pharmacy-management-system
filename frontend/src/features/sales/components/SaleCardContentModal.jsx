import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  TrendingUp,
  DollarSign,
  Search,
  Eye,
  Filter,
  ArrowRight,
  Receipt,
  ShoppingCart,
} from 'lucide-react';
import { useSalesHistory } from '../hooks/use-sales';
import { useAppDate } from '@/shared/lib/date-utils';

export const SaleCardContentModal = ({
  isOpen,
  onClose,
  cardType, // 'DAILY_SELL' | 'DAILY_PROFIT' | 'MONTHLY_SELL' | 'MONTHLY_PROFIT'
  onViewReceipt,
  onApplyFilterToHistory,
}) => {
  const { formatDateTime } = useAppDate();
  const [searchTerm, setSearchTerm] = useState('');

  // Compute card date range & configuration
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

    switch (cardType) {
      case 'DAILY_SELL':
        return {
          title: `Daily Sales Transactions (${todayStr})`,
          icon: ShoppingCart,
          iconColor: 'text-emerald-600 bg-emerald-100',
          startDate: todayStr,
          endDate: todayStr,
        };
      case 'DAILY_PROFIT':
        return {
          title: `Daily Profit Breakdown (${todayStr})`,
          icon: TrendingUp,
          iconColor: 'text-blue-600 bg-blue-100',
          startDate: todayStr,
          endDate: todayStr,
        };
      case 'MONTHLY_SELL':
        return {
          title: `Monthly Sales Transactions (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
          icon: DollarSign,
          iconColor: 'text-indigo-600 bg-indigo-100',
          startDate: monthStart,
          endDate: monthEnd,
        };
      case 'MONTHLY_PROFIT':
      default:
        return {
          title: `Monthly Profit Breakdown (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
          icon: TrendingUp,
          iconColor: 'text-purple-600 bg-purple-100',
          startDate: monthStart,
          endDate: monthEnd,
        };
    }
  }, [cardType]);

  // Query sales history for this date range
  const { data: historyData, isLoading } = useSalesHistory({
    startDate: cardConfig.startDate,
    endDate: cardConfig.endDate,
    limit: 100, // Load up to 100 sales for modal view
    page: 1,
  });

  const salesList = historyData?.data?.sales || [];

  // Filter in memory by search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return salesList;
    const term = searchTerm.toLowerCase();

    return salesList.filter((s) => {
      const matchId = s.id?.toLowerCase().includes(term);
      const matchCashier = s.cashierName?.toLowerCase().includes(term);
      const matchItems = (s.items || []).some((item) =>
        item.medicineName?.toLowerCase().includes(term)
      );
      return matchId || matchCashier || matchItems;
    });
  }, [salesList, searchTerm]);

  // Summary stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalUnits = 0;

    filteredList.forEach((s) => {
      totalRevenue += Number(s.total || 0);
      totalProfit += Number(s.totalProfit || 0);
      totalUnits += Number(s.totalQuantity || 0);
    });

    return {
      count: filteredList.length,
      totalRevenue,
      totalProfit,
      totalUnits,
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
                  {stats.count} {stats.count === 1 ? 'Sale' : 'Sales'}
                </span>
              </div>
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

        {/* Financial KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Revenue</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {formatBirr(stats.totalRevenue)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Total Profit</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              +{formatBirr(stats.totalProfit)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Units Sold</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {stats.totalUnits} items
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Transactions</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {stats.count} receipts
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by sale ID, cashier, or medicine name..."
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
              Loading sales transactions...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              No sales transactions found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Sale ID</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Cashier</th>
                    <th className="py-2.5 px-3">Medicines</th>
                    <th className="py-2.5 px-3 text-center">Items</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Profit</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredList.map((sale) => {
                    const medicineNames = (sale.items || [])
                      .map((i) => i.medicineName)
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr
                        key={sale.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {sale.id.slice(0, 8)}...
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {sale.cashierName || 'Cashier'}
                        </td>
                        <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={medicineNames}>
                          {medicineNames || `${sale.items?.length || 0} medicines`}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {sale.totalQuantity} units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {formatBirr(sale.total)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          +{formatBirr(sale.totalProfit)}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(sale)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="View Receipt"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Receipt</span>
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
              onApplyFilterToHistory(cardType, cardConfig);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Sales History</span>
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


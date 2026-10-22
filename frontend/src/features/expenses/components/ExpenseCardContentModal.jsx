import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Eye,
  Filter,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useExpenses } from '../hooks/use-expenses';
import { useAppDate, gregorianToEthiopian } from '@/shared/lib/date-utils';

export const ExpenseCardContentModal = ({
  isOpen,
  onClose,
  cardType, // 'YEAR' | 'MONTH' | 'TODAY' | 'UNPAID' | 'RECORDS'
  onViewExpense,
  onApplyFilterToTable,
  currencySymbol = 'Birr',
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Compute date range / status according to cardType
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
      case 'YEAR': {
        const ethYear = gregorianToEthiopian(now)?.year;
        return {
          title:
            calendarType === 'ethiopian'
              ? `Expenses This Year (${ethYear || currentYear} E.C.)`
              : `Expenses This Year (${currentYear} G.C.)`,
          subtitle: `Operating expenses incurred in ${
            calendarType === 'ethiopian' ? `${ethYear || currentYear} E.C.` : currentYear
          } (${formatDate(yearStart)} to ${formatDate(yearEnd)})`,
          icon: Calendar,
          iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
          startDate: yearStart,
          endDate: yearEnd,
          status: 'ALL',
        };
      }
      case 'MONTH':
        return {
          title:
            calendarType === 'ethiopian'
              ? `Expenses This Month (${formatDate(todayStr, { showMonthName: true })})`
              : `Expenses This Month (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`,
          subtitle: `Operating expenses incurred this month (${formatDate(monthStart)} to ${formatDate(monthEnd)})`,
          icon: DollarSign,
          iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
          startDate: monthStart,
          endDate: monthEnd,
          status: 'ALL',
        };
      case 'TODAY':
        return {
          title: `Expenses Today (${formatDate(todayStr, { showMonthName: true })})`,
          subtitle: `Operating expenses recorded for today (${formatDate(todayStr)})`,
          icon: Clock,
          iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40',
          startDate: todayStr,
          endDate: todayStr,
          status: 'ALL',
        };
      case 'UNPAID':
        return {
          title: 'Total Unpaid Expenses',
          subtitle: 'All active expense records that have an outstanding unpaid balance',
          icon: AlertCircle,
          iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40',
          startDate: '',
          endDate: '',
          status: 'OUTSTANDING',
        };
      case 'RECORDS':
      default:
        return {
          title: 'All Expense Records',
          subtitle: 'Complete list of all recorded pharmacy operating expenses',
          icon: FileText,
          iconColor: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
          startDate: '',
          endDate: '',
          status: 'ALL',
        };
    }
  }, [cardType, calendarType, formatDate]);

  // Fetch items for this card's scope
  const { data: expensesData, isLoading } = useExpenses({
    startDate: cardConfig.startDate,
    endDate: cardConfig.endDate,
    status: cardConfig.status,
    limit: 100, // Load up to 100 items for modal view
    page: 1,
  });

  const allItems = expensesData?.items || [];

  // Filter items in memory by search term & category
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.expenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.payee && item.payee.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'ALL' ||
        item.category === selectedCategory ||
        (selectedCategory === 'Other pharmacy expenses' && (item.category?.startsWith('Other:') || item.category?.startsWith('Other pharmacy')));

      return matchesSearch && matchesCat;
    });
  }, [allItems, searchTerm, selectedCategory]);

  // Summary statistics
  const stats = useMemo(() => {
    let totalAmount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    filteredItems.forEach((item) => {
      if (!item.isVoided) {
        totalAmount += Number(item.amount || 0);
        totalPaid += Number(item.amountPaid || 0);
        totalDue += Number(item.amountDue || 0);
      }
    });

    return {
      count: filteredItems.length,
      totalAmount,
      totalPaid,
      totalDue,
    };
  }, [filteredItems]);

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
        {/* Modal Header */}
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
                  {stats.count} {stats.count === 1 ? 'Record' : 'Records'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {calendarType === 'ethiopian' ? 'Ethiopian (E.C.)' : 'Gregorian (G.C.)'}
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Summary KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 shrink-0 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Amount</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {formatAmount(stats.totalAmount)} {currencySymbol}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Total Paid</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {formatAmount(stats.totalPaid)} {currencySymbol}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">Unpaid Balance</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {formatAmount(stats.totalDue)} {currencySymbol}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 block">Matching Items</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {stats.count} records
            </span>
          </div>
        </div>

        {/* Search & Filters Inside Modal */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses in this view by title, ID, or payee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              Loading expense records...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No matching expenses found for this card.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Expense ID</th>
                    <th className="py-2.5 px-3">
                      Date
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})
                      </span>
                    </th>
                    <th className="py-2.5 px-3">Title & Payee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount ({currencySymbol})</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item) => {
                    const isVoid = item.isVoided;
                    const isPaid = item.paymentStatus === 'PAID';
                    const isPartial = item.paymentStatus === 'PARTIALLY_PAID';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {item.expenseNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {item.expenseDate ? formatDate(item.expenseDate) : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {item.title}
                          </span>
                          {item.payee && (
                            <span className="text-[10px] text-slate-400 block">
                              To: {item.payee}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {formatAmount(item.amount)}
                          </span>
                          {item.amountDue > 0 && !isVoid && (
                            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block">
                              Due: {formatAmount(item.amountDue)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isVoid
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : isPaid
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isPartial
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isVoid ? 'VOIDED' : isPaid ? 'PAID' : isPartial ? 'PARTIALLY PAID' : 'UNPAID'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onViewExpense(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
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

        {/* Modal Footer */}
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


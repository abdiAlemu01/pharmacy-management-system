import React, { useState, useEffect } from 'react';
import {
  Receipt,Plus,BarChart3,
  List,
  Search,
  Filter,
  Eye,
  Edit2,
  CreditCard,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import {
  useExpenseSummary,
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useRecordExpensePayment,
  useVoidExpense,
} from '../hooks/use-expenses';
import { useSettings } from '@/features/settings';
import { useAppDate } from '@/shared/lib/date-utils';
import { ExpenseSummaryCards } from '../components/ExpenseSummaryCards';
import { ExpenseFormModal, EXPENSE_CATEGORIES } from '../components/ExpenseFormModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { ExpenseDetailsModal } from '../components/ExpenseDetailsModal';
import { VoidExpenseModal } from '../components/VoidExpenseModal';
import { ExpenseReportsView } from '../components/ExpenseReportsView';
import { ExpenseCardContentModal } from '../components/ExpenseCardContentModal';

export const ExpensesPage = () => {
  const { formatDate, calendarType } = useAppDate();
  const { data: settingsData } = useSettings();
  const settings = settingsData?.settings;
  const currencySymbol = settings?.currencySymbol || 'Birr';

  const [currentView, setCurrentView] = useState('history'); // 'history' | 'reports'

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewExpenseId, setViewExpenseId] = useState(null);
  const [payingExpense, setPayingExpense] = useState(null);
  const [voidingExpense, setVoidingExpense] = useState(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [selectedCardModal, setSelectedCardModal] = useState({ isOpen: false, cardType: 'YEAR' });
  const [activeCardFilter, setActiveCardFilter] = useState(null);

  // Close action dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setActiveActionMenuId(null);
      }
    };
    if (activeActionMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionMenuId]);

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useExpenseSummary();
  const { data: expensesData, isLoading: isExpensesLoading } = useExpenses({
    search,
    category,
    status,
    startDate,
    endDate,
    page,
    limit,
  });

  // Mutations
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const paymentMutation = useRecordExpensePayment();
  const voidMutation = useVoidExpense();

  const expenses = expensesData?.items || [];
  const pagination = expensesData?.pagination || { page: 1, limit: 10, totalPages: 1, totalItems: 0 };

  const handleFormSubmit = (payload) => {
    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, ...payload },
        {
          onSuccess: (res) => {
            setIsFormOpen(false);
            setEditingExpense(null);
            showToast(`Expense "${res.data?.title || 'record'}" updated successfully.`);
          },
          onError: (err) => {
            showToast(err.response?.data?.message || 'Failed to update expense', 'error');
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          setIsFormOpen(false);
          showToast(`Expense "${res.data?.title || 'record'}" created successfully.`);
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to create expense', 'error');
        },
      });
    }
  };

  const handlePaymentSubmit = (payload) => {
    if (!payingExpense) return;
    paymentMutation.mutate(
      { id: payingExpense.id, ...payload },
      {
        onSuccess: (res) => {
          setPayingExpense(null);
          showToast(`Payment of ${payload.amountPaid} ${currencySymbol} recorded.`);
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to record payment', 'error');
        },
      }
    );
  };

  const handleVoidSubmit = (payload) => {
    if (!voidingExpense) return;
    voidMutation.mutate(
      { id: voidingExpense.id, ...payload },
      {
        onSuccess: () => {
          setVoidingExpense(null);
          showToast('Expense has been voided successfully.');
        },
        onError: (err) => {
          showToast(err.response?.data?.message || 'Failed to void expense', 'error');
        },
      }
    );
  };

  const handleCardClick = (cardKey) => {
    setSelectedCardModal({ isOpen: true, cardType: cardKey });
  };

  const handleApplyCardFilter = (cardKey, config) => {
    setCurrentView('history');
    setActiveCardFilter(cardKey);
    setSearch('');
    setCategory('ALL');
    setPage(1);

    if (cardKey === 'YEAR' || cardKey === 'MONTH' || cardKey === 'TODAY') {
      setStartDate(config.startDate);
      setEndDate(config.endDate);
      setStatus('ALL');
    } else if (cardKey === 'UNPAID') {
      setStartDate('');
      setEndDate('');
      setStatus('OUTSTANDING');
    } else {
      setStartDate('');
      setEndDate('');
      setStatus('ALL');
    }
  };

  const handleClearCardFilter = () => {
    setActiveCardFilter(null);
    setStartDate('');
    setEndDate('');
    setStatus('ALL');
    setCategory('ALL');
    setSearch('');
    setPage(1);
  };

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const statusFilters = [
    { id: 'ALL', label: 'All Status' },
    { id: 'OUTSTANDING', label: 'Unpaid / Due' },
    { id: 'UNPAID', label: 'Unpaid Only' },
    { id: 'PARTIALLY_PAID', label: 'Partially Paid' },
    { id: 'PAID', label: 'Paid' },
    { id: 'VOIDED', label: 'Voided' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast.show && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            className="cursor-pointer ml-3 opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Operating Expenses
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle between History and Reports */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCurrentView('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'history'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'reports'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Top of the page) */}
      <ExpenseSummaryCards
        summary={summary}
        isLoading={isSummaryLoading}
        currencySymbol={currencySymbol}
        onCardClick={handleCardClick}
        activeFilter={activeCardFilter}
      />

      {/* 2. Main Content View: History or Reports */}
      {currentView === 'reports' ? (
        <ExpenseReportsView currencySymbol={currencySymbol} />
      ) : (
        <div className="space-y-4">
          {/* Active Card Filter Banner */}
          {activeCardFilter && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 px-4 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-200 font-medium">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <span>Filtered by card: </span>
                  <strong className="font-bold underline decoration-emerald-500">
                    {activeCardFilter === 'YEAR'
                      ? `Expenses This Year (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`
                      : activeCardFilter === 'MONTH'
                      ? `Expenses This Month (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`
                      : activeCardFilter === 'TODAY'
                      ? `Expenses Today (${formatDate(startDate || new Date().toISOString().split('T')[0], { showMonthName: true })})`
                      : activeCardFilter === 'UNPAID'
                      ? 'Total Unpaid Expenses'
                      : 'All Expense Records'}
                  </strong>
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold ml-2">
                    ({pagination.totalItems} {pagination.totalItems === 1 ? 'record' : 'records'} found)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardModal({ isOpen: true, cardType: activeCardFilter })}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  View Content Modal
                </button>
                <button
                  type="button"
                  onClick={handleClearCardFilter}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Clear Filter / Show All
                </button>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title/subject...."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category Filter */}
              <div className="min-w-[180px]">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Categories</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    title={`From Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    title={`To Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
                  />
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'}
                  </span>
                </div>
                {(startDate || endDate) && (
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    ({startDate ? formatDate(startDate) : '...'} &rarr; {endDate ? formatDate(endDate) : '...'})
                  </span>
                )}
              </div>

              {/* Clear Filters Button */}
              {(search || category !== 'ALL' || status !== 'ALL' || startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategory('ALL');
                    setStatus('ALL');
                    setStartDate('');
                    setEndDate('');
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
              {statusFilters.map((sf) => (
                <button
                  key={sf.id}
                  type="button"
                  onClick={() => {
                    setStatus(sf.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    status === sf.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Expense History Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
            <div className="overflow-x-auto min-h-[320px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Expense ID</th>
                    <th className="py-3 px-4">
                      Date
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})
                      </span>
                    </th>
                    <th className="py-3 px-4">Title & Payee</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount ({currencySymbol})</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isExpensesLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading expenses...
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No expenses found.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((item, index) => {
                      const isVoid = item.isVoided;
                      const isPaid = item.paymentStatus === 'PAID';
                      const isPartial = item.paymentStatus === 'PARTIALLY_PAID';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Expense ID */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.expenseNumber}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {item.expenseDate ? formatDate(item.expenseDate) : '—'}
                          </td>

                          {/* Title & Payee */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {item.title}
                            </span>
                            {item.payee && (
                              <span className="text-[11px] text-slate-400 block">
                                To: {item.payee}
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.category}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 text-right">
                            <span className="font-black text-slate-900 dark:text-slate-100 block">
                              {formatAmount(item.amount)}
                            </span>
                            {item.amountDue > 0 && !isVoid && (
                              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block">
                                Due: {formatAmount(item.amountDue)}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

                          {/* Actions Dropdown (Three Dots Column / Kebab Menu) */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="relative inline-block text-left" data-action-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(activeActionMenuId === item.id ? null : item.id);
                                }}
                                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none ${
                                  activeActionMenuId === item.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-2 ring-emerald-500/20' : ''
                                }`}
                                title="Actions"
                                aria-label="Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeActionMenuId === item.id && (
                                <div
                                  className={`absolute right-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-100 ${
                                    index >= expenses.length - 2 && expenses.length > 2
                                      ? 'bottom-full mb-1'
                                      : 'top-full mt-1'
                                  }`}
                                >
                                  {/* View Details */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setViewExpenseId(item.id);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left font-medium"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </button>

                                  {/* Record Payment (if not paid and not voided) */}
                                  {!isVoid && !isPaid && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        setPayingExpense(item);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors text-left font-medium"
                                    >
                                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Record Payment</span>
                                    </button>
                                  )}

                                  {/* Edit Expense */}
                                  {!isVoid && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        setEditingExpense(item);
                                        setIsFormOpen(true);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors text-left font-medium"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                      <span>Edit Expense</span>
                                    </button>
                                  )}

                                  {/* Void Expense */}
                                  {!isVoid && (
                                    <>
                                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveActionMenuId(null);
                                          setVoidingExpense(item);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium"
                                      >
                                        <Ban className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Void Expense</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalItems} records)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        isPending={createMutation.isPending || updateMutation.isPending}
        currencySymbol={currencySymbol}
      />

      {/* View Details Modal */}
      <ExpenseDetailsModal
        expenseId={viewExpenseId}
        isOpen={Boolean(viewExpenseId)}
        onClose={() => setViewExpenseId(null)}
        onEdit={(item) => {
          setEditingExpense(item);
          setIsFormOpen(true);
        }}
        onRecordPayment={(item) => setPayingExpense(item)}
        onVoid={(item) => setVoidingExpense(item)}
        currencySymbol={currencySymbol}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        expense={payingExpense}
        isOpen={Boolean(payingExpense)}
        onClose={() => setPayingExpense(null)}
        onSubmit={handlePaymentSubmit}
        isPending={paymentMutation.isPending}
        currencySymbol={currencySymbol}
      />

      {/* Void Modal */}
      <VoidExpenseModal
        expense={voidingExpense}
        isOpen={Boolean(voidingExpense)}
        onClose={() => setVoidingExpense(null)}
        onSubmit={handleVoidSubmit}
        isPending={voidMutation.isPending}
      />

      {/* Card Content Modal */}
      <ExpenseCardContentModal
        isOpen={selectedCardModal.isOpen}
        cardType={selectedCardModal.cardType}
        onClose={() => setSelectedCardModal({ isOpen: false, cardType: 'YEAR' })}
        onViewExpense={(id) => {
          setSelectedCardModal({ isOpen: false, cardType: 'YEAR' });
          setViewExpenseId(id);
        }}
        onApplyFilterToTable={(cardKey, config) => {
          handleApplyCardFilter(cardKey, config);
        }}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};


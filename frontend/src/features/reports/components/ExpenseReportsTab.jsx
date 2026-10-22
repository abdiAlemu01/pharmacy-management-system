import React, { useState } from 'react';
import { Receipt, CheckCircle2, AlertCircle, BarChart3, Filter, Search } from 'lucide-react';
import { useExpenseReports } from '../hooks/use-reports';
import { useAppDate } from '@/shared/lib/date-utils';

export const ExpenseReportsTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useExpenseReports({
    period,
    startDate,
    endDate,
    category: selectedCategory,
    status: selectedStatus,
  });

  const summary = data?.summary || {};
  const byCategory = data?.byCategory || [];
  const expenses = data?.expenses || [];

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      !search.trim() ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (e.payee && e.payee.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || e.paymentStatus === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Operating Expenses</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform group-hover:scale-110">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {isLoading ? '...' : formatAmount(summary.totalAmount)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {summary.totalRecords || 0} recorded expense bills
            </span>
          </div>
        </div>

        {/* Paid Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Paid Expenses</span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {isLoading ? '...' : formatAmount(summary.totalPaid)}
              </span>
              <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">
              {summary.paidCount || 0} fully cleared payments
            </span>
          </div>
        </div>

        {/* Unpaid / Due Expenses */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Outstanding Expenses Due</span>
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                {isLoading ? '...' : formatAmount(summary.totalDue)}
              </span>
              <span className="text-xs font-bold text-rose-600">{currencySymbol}</span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
              {summary.unpaidCount || 0} unpaid or partial bills
            </span>
          </div>
        </div>

        {/* Settled Ratio / Categories */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs flex flex-col justify-between transition-all select-none">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Payment Clearance</span>
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {summary.totalAmount > 0
                  ? Math.round((summary.totalPaid / summary.totalAmount) * 100)
                  : 0}
                %
              </span>
              <span className="text-xs font-bold text-slate-500">Settled</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Of period operating obligations</span>
          </div>
        </div>
      </div>

      {/* 2. Expenses by Category Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Operating Expenses Breakdown by Category
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {byCategory.length} Active Categories
          </span>
        </div>

        {byCategory.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No expense categories recorded in this period.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {byCategory.map((cat, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatAmount(cat.total)} {currencySymbol}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, cat.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{cat.count} bill(s)</span>
                  <span>Paid: {formatAmount(cat.paidTotal)} &bull; Due: {formatAmount(cat.dueTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Expense Records Table with Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Expense Records List
            </h3>
            <span className="text-xs text-slate-400">
              ({filteredExpenses.length} records)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>

            {/* Search Input */}
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search expense..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Expense ID</th>
                <th className="py-2.5 px-4">Date ({calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})</th>
                <th className="py-2.5 px-4">Title & Payee</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Amount ({currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Paid ({currencySymbol})</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expense records matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(exp.expenseDate)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{exp.title}</span>
                      {exp.payee && <span className="text-[10px] text-slate-400 block">To: {exp.payee}</span>}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900 dark:text-slate-100">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                      {formatAmount(exp.amountPaid)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : exp.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {exp.paymentStatus}
                      </span>
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


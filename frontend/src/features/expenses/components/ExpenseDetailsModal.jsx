import React from 'react';
import { X, CreditCard, Edit2, Ban, Calendar, User, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useExpenseDetails } from '../hooks/use-expenses';

export const ExpenseDetailsModal = ({
  expenseId,
  isOpen,
  onClose,
  onEdit,
  onRecordPayment,
  onVoid,
  currencySymbol = 'Birr',
}) => {
  const { data: expense, isLoading } = useExpenseDetails(expenseId);

  if (!isOpen) return null;

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isVoid = expense?.isVoided;
  const isPaid = expense?.paymentStatus === 'PAID';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 pt-16 sm:pt-20 pb-16"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {expense?.expenseNumber || 'EXPENSE'}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isVoid
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    : isPaid
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : expense?.paymentStatus === 'PARTIALLY_PAID'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {isVoid ? 'VOIDED' : expense?.paymentStatus || 'UNPAID'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {isLoading ? 'Loading...' : expense?.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading expense details...</div>
        ) : !expense ? (
          <div className="p-8 text-center text-rose-500 text-sm">Expense not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {formatAmount(expense.amount)} <span className="text-xs font-normal text-slate-500">{currencySymbol}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  Amount Paid
                </span>
                <span className="text-lg font-black text-emerald-800 dark:text-emerald-200 mt-0.5 block">
                  {formatAmount(expense.amountPaid)} <span className="text-xs font-normal text-emerald-600">{currencySymbol}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                  Balance Due
                </span>
                <span className="text-lg font-black text-rose-800 dark:text-rose-200 mt-0.5 block">
                  {formatAmount(expense.amountDue)} <span className="text-xs font-normal text-rose-600">{currencySymbol}</span>
                </span>
              </div>
            </div>

            {/* Basic Info Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block">Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{expense.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Expense Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{expense.expenseDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Paid To (Payee):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{expense.payee || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Description:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{expense.description || '—'}</span>
              </div>
            </div>

            {/* Void notification if voided */}
            {isVoid && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200">
                <strong>Expense Voided:</strong> {expense.voidReason || 'No reason specified'}
              </div>
            )}

            {/* Payment History List */}
            <div>
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Payment History ({expense.payments?.length || 0})
              </h4>

              {!expense.payments || expense.payments.length === 0 ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-400 text-center">
                  No payments recorded yet.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {expense.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{p.paymentDate}</td>
                          <td className="py-2 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                            {formatAmount(p.amountPaid)} {currencySymbol}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{p.paymentMethod}</td>
                          <td className="py-2 px-3 text-slate-500">{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isVoid && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onVoid(expense);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Void Expense</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isVoid && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(expense);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                {!isVoid && !isPaid && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRecordPayment(expense);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


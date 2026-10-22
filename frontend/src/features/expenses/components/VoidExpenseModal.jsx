import React, { useState } from 'react';
import { X, Ban, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const VoidExpenseModal = ({
  expense,
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for voiding this expense');
      return;
    }
    onSubmit({ reason: reason.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex items-center justify-center p-4 py-12"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto shrink-0 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Void Expense
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to void{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">
              {expense.title}
            </strong>{' '}
            ({expense.expenseNumber})? This will mark the expense as voided.
          </p>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Reason for Voiding *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Incurred on wrong date, duplicate entry, invoice canceled..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              autoFocus
            />
            {error && <span className="text-xs text-rose-500 mt-0.5">{error}</span>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Voiding...
                </span>
              ) : (
                'Confirm Void'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


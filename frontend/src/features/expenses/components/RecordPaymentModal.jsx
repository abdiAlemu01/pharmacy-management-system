import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export const RecordPaymentModal = ({
  expense,
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
  currencySymbol = 'Birr',
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const remainingBalance = expense ? parseFloat(Number(expense.amountDue || 0).toFixed(2)) : 0;

  useEffect(() => {
    if (expense) {
      setAmountPaid(String(remainingBalance));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
    }
  }, [expense, isOpen]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amountPaid);
    if (!amountPaid || isNaN(amt) || amt <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    if (amt > remainingBalance) {
      setError(`Amount cannot exceed remaining balance (${remainingBalance.toFixed(2)} ${currencySymbol})`);
      return;
    }

    onSubmit({
      amountPaid: amt,
      paymentDate,
      notes: notes.trim() || undefined,
    });
  };

  const parsedAmt = parseFloat(amountPaid) || 0;
  const newBalance = Math.max(0, remainingBalance - parsedAmt);

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
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Record Payment
              </h3>
              <p className="text-xs text-slate-500">{expense.title}</p>
            </div>
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
          {/* Balance overview card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Remaining Balance</span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {remainingBalance.toFixed(2)} {currencySymbol}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAmountPaid(String(remainingBalance))}
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              Pay Full
            </button>
          </div>

          {/* Amount to Pay */}
          <div>
            <Input
              label={`Amount Paid (${currencySymbol}) *`}
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              error={error}
              autoFocus
            />
          </div>

          {/* Payment Date */}
          <div>
            <Input
              label="Payment Date *"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid in cash, bank transfer receipt #..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* New Balance Preview */}
          {parsedAmt > 0 && parsedAmt <= remainingBalance && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between text-emerald-900 dark:text-emerald-200">
              <span>Remaining After Payment:</span>
              <strong className="text-sm">{newBalance.toFixed(2)} {currencySymbol}</strong>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording...
                </span>
              ) : (
                'Save Payment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


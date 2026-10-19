import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import {
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  Receipt,
} from 'lucide-react';

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  purchase,
  onSubmit,
  isLoading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const remainingBalance = purchase ? parseFloat(purchase.amountDue || 0) : 0;
  const totalCost = purchase ? parseFloat(purchase.totalCost || 0) : 0;
  const amountPaid = purchase ? parseFloat(purchase.amountPaid || 0) : 0;

  useEffect(() => {
    if (purchase) {
      setAmount(remainingBalance > 0 ? remainingBalance.toFixed(2) : '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setErrorMsg('');
    }
  }, [purchase, remainingBalance]);

  if (!purchase) return null;

  const handlePayFull = () => {
    setAmount(remainingBalance.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than 0');
      return;
    }

    if (numAmount > remainingBalance + 0.01) {
      setErrorMsg(`Payment amount (${numAmount} Birr) exceeds remaining balance (${remainingBalance} Birr)`);
      return;
    }

    const payload = {
      amount: numAmount,
      paymentDate,
      paymentMethod: 'CASH',
      notes: null,
    };

    onSubmit(purchase.id, payload, () => {
      onClose();
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Supplier Payment"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PO & Financials card */}
        <div className="p-4.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
            <div>
              <span className="text-xs text-slate-500 font-bold block">Purchase Order</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {purchase.purchaseOrderNo}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold block">Supplier</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {purchase.supplierName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 block">Total Cost</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
              </span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 block">Total Paid So Far</span>
              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                {amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
              </span>
            </div>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">Remaining Balance</span>
              <span className="text-sm font-black text-rose-700 dark:text-rose-300">
                {remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
              </span>
            </div>
          </div>
        </div>

        {/* Payment Input form */}
        <div className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Amount (Birr)</span>
              </label>
              {remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Pay Full Balance ({remainingBalance.toFixed(2)} Birr)
                </button>
              )}
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Date *</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </div>

        {/* Existing Payment Installments Log */}
        {purchase.payments && purchase.payments.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Previous Payment Installments ({purchase.payments.length})</span>
            </span>
            <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-1.5 px-3">Date</th>
                    <th className="py-1.5 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchase.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-1.5 px-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="py-1.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                        {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>{isLoading ? 'Recording Payment...' : 'Pay & Record Payment'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


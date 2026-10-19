import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { usePurchaseDetails } from '../hooks/use-purchases';
import {
  PackageCheck,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const ReceiveMedicinesModal = ({
  isOpen,
  onClose,
  purchase,
  onSubmit,
  isLoading = false,
}) => {
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivingNotes, setReceivingNotes] = useState('');
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch full details if items are not already attached or to ensure fresh data
  const { data: detailsData, isLoading: isDetailsLoading } = usePurchaseDetails(purchase?.id, {
    enabled: Boolean(isOpen && purchase?.id),
  });

  const activePurchase = detailsData?.data || purchase;

  useEffect(() => {
    if (activePurchase && activePurchase.items && activePurchase.items.length > 0) {
      setReceivedDate(new Date().toISOString().split('T')[0]);
      setReceivingNotes('');
      setErrorMsg('');
      setItems(
        activePurchase.items.map((it) => ({
          purchaseItemId: it.id,
          medicineName: it.medicineName,
          quantityOrdered: it.quantity,
          // If already partially received, suggest remaining quantity to receive
          quantityReceived: Math.max(0, it.quantity - (it.quantityReceived || 0)),
          quantityRejected: 0,
          batchNumber: it.batchNumber || '',
          expiryDate: it.expiryDate ? it.expiryDate.split('T')[0] : '',
          rejectionReason: '',
        }))
      );
    }
  }, [activePurchase]);

  if (!purchase) return null;

  const handleItemChange = (index, field, value) => {
    setErrorMsg('');
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!items || items.length === 0) {
      setErrorMsg('At least one medicine item is required to receive goods');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const accepted = parseInt(it.quantityReceived, 10) || 0;
      const rejected = parseInt(it.quantityRejected, 10) || 0;

      if (accepted < 0 || rejected < 0) {
        setErrorMsg(`Row ${i + 1}: Quantities cannot be negative`);
        return;
      }
      if (rejected > 0 && !it.rejectionReason.trim()) {
        setErrorMsg(`Row ${i + 1}: Please provide a reason for rejected/damaged quantity`);
        return;
      }
    }

    const payload = {
      receivedDate,
      receivingNotes: receivingNotes.trim() || null,
      items: items.map((it) => ({
        purchaseItemId: it.purchaseItemId,
        quantityReceived: parseInt(it.quantityReceived, 10) || 0,
        quantityRejected: parseInt(it.quantityRejected, 10) || 0,
        batchNumber: it.batchNumber.trim() || null,
        expiryDate: it.expiryDate || null,
        rejectionReason: it.rejectionReason.trim() || null,
      })),
    };

    onSubmit(purchase.id, payload, () => {
      onClose();
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Medicines & Update Inventory"
      className="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PO & Supplier Banner */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 block">Purchase Order</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {purchase.purchaseOrderNo}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 block">Supplier</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {purchase.supplierName}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 block">Order Date</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {new Date(purchase.orderDate).toLocaleDateString()}
            </span>
          </div>
        </div>

      

        {/* Items Receiving Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3 text-center w-20">Ordered</th>
                <th className="py-2.5 px-3 text-center w-28 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">Accepted Qty *</th>
                <th className="py-2.5 px-3 text-center w-28 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">Rejected Qty</th>
                <th className="py-2.5 px-3 w-32">Batch No</th>
                <th className="py-2.5 px-3 w-32">Expiry Date</th>
                <th className="py-2.5 px-3 min-w-[280px]">Rejection Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    {isDetailsLoading ? 'Loading medicine items...' : 'No medicine items found in this purchase order.'}
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.purchaseItemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {it.medicineName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                      {it.quantityOrdered}
                    </td>
                    <td className="py-2.5 px-3 bg-emerald-50/30 dark:bg-emerald-950/20">
                      <input
                        type="number"
                        min="0"
                        value={it.quantityReceived}
                        onChange={(e) => handleItemChange(idx, 'quantityReceived', e.target.value)}
                        className="w-full text-center px-2 py-1.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded-lg text-emerald-900 dark:text-emerald-200 font-extrabold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </td>
                    <td className="py-2.5 px-3 bg-rose-50/30 dark:bg-rose-950/20">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={it.quantityRejected === 0 ? '' : (it.quantityRejected ?? '')}
                        onChange={(e) => handleItemChange(idx, 'quantityRejected', e.target.value)}
                        className="w-full text-center px-2 py-1.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg text-rose-900 dark:text-rose-200 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Batch #"
                        value={it.batchNumber}
                        onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={it.expiryDate}
                        onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 px-3 min-w-[280px]">
                      {((parseInt(it.quantityRejected, 10) || 0) > 0 || it.rejectionReason) ? (
                        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                          <textarea
                            rows={3}
                            placeholder="Please provide reason for rejected items ..."
                            value={it.rejectionReason}
                            onChange={(e) => handleItemChange(idx, 'rejectionReason', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm min-h-[72px] resize-y"
                            required
                            autoFocus
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Please provide reason for rejected items ..."
                          value={it.rejectionReason}
                          onChange={(e) => handleItemChange(idx, 'rejectionReason', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-400 rounded-lg text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Date */}
        <div className="max-w-xs">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Actual Receiving Date</span>
          </label>
          <input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading || isDetailsLoading || items.length === 0} className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4" />
            <span>{isLoading ? 'Processing Receiving...' : 'Confirm Receipt & Update Inventory'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


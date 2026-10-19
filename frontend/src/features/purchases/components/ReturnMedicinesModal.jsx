import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { usePurchaseDetails } from '../hooks/use-purchases';
import {
  RotateCcw,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const ReturnMedicinesModal = ({
  isOpen,
  onClose,
  purchase,
  onSubmit,
  isLoading = false,
}) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [itemsToReturn, setItemsToReturn] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: detailsData } = usePurchaseDetails(purchase?.id, {
    enabled: Boolean(isOpen && purchase?.id),
  });

  const activePurchase = detailsData?.data || purchase;

  // Eligible items are those that have been received
  const eligibleItems = (activePurchase?.items || []).filter(
    (it) => (it.quantityReceived || 0) > 0
  );

  useEffect(() => {
    if (activePurchase) {
      setReturnDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrorMsg('');
      setItemsToReturn(
        eligibleItems.map((it) => ({
          purchaseItemId: it.id,
          medicineName: it.medicineName,
          quantityReceived: it.quantityReceived,
          unitCost: it.unitCost,
          batchNumber: it.batchNumber || '',
          returnQuantity: 0,
          returnReason: 'Damaged / Broken packaging',
          refundStatus: 'CREDITED',
        }))
      );
    }
  }, [activePurchase]);

  if (!purchase) return null;

  const handleItemChange = (index, field, value) => {
    setErrorMsg('');
    setItemsToReturn((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Filter only items with returnQuantity > 0
    const activeReturns = itemsToReturn.filter(
      (it) => (parseInt(it.returnQuantity, 10) || 0) > 0
    );

    if (activeReturns.length === 0) {
      setErrorMsg('Please specify at least one item with a return quantity greater than 0');
      return;
    }

    for (const it of activeReturns) {
      const retQty = parseInt(it.returnQuantity, 10);
      if (retQty > it.quantityReceived) {
        setErrorMsg(`Cannot return ${retQty} units of "${it.medicineName}". Only ${it.quantityReceived} units were received.`);
        return;
      }
      if (!it.returnReason.trim()) {
        setErrorMsg(`Please specify a return reason for "${it.medicineName}"`);
        return;
      }
    }

    const payload = {
      returnDate,
      notes: notes.trim() || null,
      items: activeReturns.map((it) => ({
        purchaseItemId: it.purchaseItemId,
        returnQuantity: parseInt(it.returnQuantity, 10),
        returnReason: it.returnReason.trim(),
        refundStatus: it.refundStatus || 'CREDITED',
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
      title="Return Medicines to Supplier"
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PO & Supplier info */}
        <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">

          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 block">Supplier</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {purchase.supplierName}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 block">Delivery Status</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              {purchase.status}
            </span>
          </div>
        </div>
        {/* Items to return table */}
        {eligibleItems.length === 0 ? (
          <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="font-bold text-sm">No items eligible for return.</p>
            <p className="text-xs text-slate-400 mt-1">
              Medicines must first be accepted/received before a return can be initiated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3 text-center w-24">Accepted Qty</th>
                  <th className="py-2.5 px-3 text-center w-28 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">Return Qty</th>
                  <th className="py-2.5 px-3 w-44">Return Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {itemsToReturn.map((it, idx) => (
                  <tr key={it.purchaseItemId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {it.medicineName}
                      </span>
                      {it.batchNumber && (
                        <span className="text-[11px] text-slate-400">Batch: {it.batchNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                      {it.quantityReceived}
                    </td>
                    <td className="py-2.5 px-3 bg-purple-50/30 dark:bg-purple-950/20">
                      <input
                        type="number"
                        min="0"
                        max={it.quantityReceived}
                        value={it.returnQuantity}
                        onChange={(e) => handleItemChange(idx, 'returnQuantity', e.target.value)}
                        className="w-full text-center px-2 py-1.5 bg-white dark:bg-slate-800 border border-purple-400 dark:border-purple-600 rounded-lg text-purple-900 dark:text-purple-200 font-extrabold focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={it.returnReason}
                        onChange={(e) => handleItemChange(idx, 'returnReason', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="Damaged / Broken packaging">Damaged / Broken packaging</option>
                        <option value="Defective / Quality issue">Defective / Quality issue</option>
                        <option value="Incorrect item delivered">Incorrect item delivered</option>
                        <option value="Expired or near expiry">Expired or near expiry</option>
                        <option value="Excess / Over-delivery">Excess / Over-delivery</option>
                        <option value="Other">Other</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Date and Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Return Date *</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Return Notes / Supplier Confirmation</span>
            </label>
            <textarea
              rows={2}
              placeholder="Please provide a return reason..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        {/* Previous Returns Log */}
        {purchase.returns && purchase.returns.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Previously Logged Returns ({purchase.returns.length})
            </span>
            <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="py-1.5 px-3">Date</th>
                    <th className="py-1.5 px-3">Medicine</th>
                    <th className="py-1.5 px-3">Returned Qty</th>
                    <th className="py-1.5 px-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {purchase.returns.map((r) => (
                    <tr key={r.id}>
                      <td className="py-1.5 px-3">{new Date(r.returnDate).toLocaleDateString()}</td>
                      <td className="py-1.5 px-3 font-semibold">{r.medicineName}</td>
                      <td className="py-1.5 px-3 font-bold text-rose-600">{r.returnQuantity} units</td>
                      <td className="py-1.5 px-3">{r.returnReason}</td>
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
          <Button
            type="submit"
            variant="danger"
            disabled={isLoading || eligibleItems.length === 0}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isLoading ? 'Processing Return...' : 'Confirm Return & Adjust Records'}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


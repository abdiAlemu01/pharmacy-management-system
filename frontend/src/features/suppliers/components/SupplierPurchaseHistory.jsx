import React, { useState } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import {
  ShoppingBag,
  Receipt,
  Calendar,
  Package,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSupplierPurchaseHistory, useCreateSupplierPurchase } from '../hooks/use-suppliers';

export const SupplierPurchaseHistory = ({
  isOpen,
  onClose,
  supplier,
}) => {
  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  // New purchase state
  const [newInvoiceNo, setNewInvoiceNo] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('PAID');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState([
    { medicineName: '', batchNumber: '', quantity: 100, unitCost: 20, expiryDate: '' },
  ]);

  const { data, isLoading } = useSupplierPurchaseHistory(supplier?.id, {
    enabled: Boolean(isOpen && supplier?.id),
  });

  const createPurchaseMutation = useCreateSupplierPurchase();

  if (!supplier) return null;

  const formatBirr = (val) => {
    const num = parseFloat(val || 0);
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const historyData = data?.data || {};
  const purchases = historyData.purchases || [];
  const summary = historyData.summary || {
    totalOrders: 0,
    totalSpent: 0,
    totalItemsPurchased: 0,
    lastPurchaseDate: null,
  };

  const toggleExpand = (id) => {
    setExpandedPurchaseId((prev) => (prev === id ? null : id));
  };

  const handleAddItemRow = () => {
    setNewItems((prev) => [
      ...prev,
      { medicineName: '', batchNumber: '', quantity: 50, unitCost: 15, expiryDate: '' },
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    setNewItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setNewItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    if (newItems.length === 0 || !newItems[0].medicineName.trim()) {
      alert('Please enter at least one valid medicine item');
      return;
    }

    const payload = {
      id: supplier.id,
      invoiceNo: newInvoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      paymentStatus: newPaymentStatus,
      notes: newNotes,
      items: newItems.map((item) => ({
        medicineName: item.medicineName,
        batchNumber: item.batchNumber || `BATCH-${Date.now().toString().slice(-4)}`,
        quantity: parseInt(item.quantity, 10) || 1,
        unitCost: parseFloat(item.unitCost) || 0,
        expiryDate: item.expiryDate || null,
      })),
    };

    createPurchaseMutation.mutate(payload, {
      onSuccess: () => {
        setIsAddingPurchase(false);
        setNewInvoiceNo('');
        setNewNotes('');
        setNewItems([{ medicineName: '', batchNumber: '', quantity: 100, unitCost: 20, expiryDate: '' }]);
      },
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase History: ${supplier.name}`}
      className="max-w-4xl"
    >
      <div className="space-y-4 text-xs">
        {/* Supplier Header & Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">Total Orders</span>
            <span className="font-black text-slate-900 text-lg">{summary.totalOrders}</span>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <span className="text-[11px] text-emerald-800 font-medium block">Total Spend</span>
            <span className="font-black text-emerald-800 text-base whitespace-nowrap">
              {formatBirr(summary.totalSpent)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">Items Received</span>
            <span className="font-black text-slate-900 text-lg">
              {summary.totalItemsPurchased} units
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium block">Last Order</span>
            <span className="font-bold text-slate-700 text-xs">
              {summary.lastPurchaseDate
                ? new Date(summary.lastPurchaseDate).toLocaleDateString()
                : 'None'}
            </span>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">
              All Purchases & Deliveries
            </h4>
            <p className="text-[11px] text-slate-400">
              Stock it supplies: <strong className="text-slate-600">{supplier.stockSupplied}</strong>
            </p>
          </div>

          <Button
            type="button"
            variant={isAddingPurchase ? 'secondary' : 'primary'}
            onClick={() => setIsAddingPurchase((prev) => !prev)}
            className="text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingPurchase ? 'Cancel New Order' : 'Record New Purchase'}</span>
          </Button>
        </div>

        {/* Record New Purchase Form (Collapsible) */}
        {isAddingPurchase && (
          <form
            onSubmit={handleSavePurchase}
            className="p-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                New Purchase Order from {supplier.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Add delivered batch stock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Supplier Invoice #
                </label>
                <input
                  type="text"
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-9042"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PARTIAL">PARTIAL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Received in good condition"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Item Rows */}
            <div className="space-y-2 pt-2">
              <span className="block font-bold text-slate-700 text-[11px]">
                Delivered Items:
              </span>
              {newItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                      placeholder="Medicine / Item Name"
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                      placeholder="Batch No"
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      placeholder="Cost (Birr)"
                      className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                    <span className="font-bold text-slate-800 text-xs">
                      {formatBirr((item.quantity || 0) * (item.unitCost || 0))}
                    </span>
                    {newItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  + Add another medicine
                </button>
                <span className="text-xs font-black text-slate-900">
                  Total Order: {formatBirr(newItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0))}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-100">
              <Button
                type="submit"
                variant="primary"
                disabled={createPurchaseMutation.isPending}
                className="text-xs py-1.5 px-4"
              >
                {createPurchaseMutation.isPending ? 'Saving Order...' : 'Confirm & Save Purchase'}
              </Button>
            </div>
          </form>
        )}

        {/* Purchase Orders Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2" />
              <p className="text-xs font-medium">Loading purchase history...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No purchases recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders have been recorded from this supplier yet. Click &quot;Record New Purchase&quot; above to add one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {purchases.map((purchase) => {
                const isExpanded = expandedPurchaseId === purchase.id;
                return (
                  <div key={purchase.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Purchase Header Row */}
                    <div
                      onClick={() => toggleExpand(purchase.id)}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {purchase.purchaseOrderNo || purchase.id.slice(0, 8)}
                            </span>
                            {purchase.invoiceNo && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                Inv: {purchase.invoiceNo}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                              {purchase.status}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {purchase.paymentStatus}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Date: {new Date(purchase.createdAt).toLocaleString()} •{' '}
                            {purchase.items?.length || 0} items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Order Total</span>
                          <span className="font-black text-slate-900 text-sm">
                            {formatBirr(purchase.totalCost)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-400"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Items Breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100">
                        {purchase.notes && (
                          <p className="text-[11px] text-slate-500 mb-2 italic">
                            Notes: {purchase.notes}
                          </p>
                        )}

                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Medicine / Item</th>
                                <th className="p-2.5">Batch #</th>
                                <th className="p-2.5 text-center">Qty</th>
                                <th className="p-2.5 text-right">Unit Cost</th>
                                <th className="p-2.5 text-right font-bold">Total Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(purchase.items || []).map((item, idx) => (
                                <tr key={item.id || idx}>
                                  <td className="p-2.5 font-bold text-slate-900">
                                    {item.medicineName}
                                  </td>
                                  <td className="p-2.5 font-mono text-[11px] text-slate-500">
                                    {item.batchNumber || '—'}
                                  </td>
                                  <td className="p-2.5 text-center font-semibold text-slate-800">
                                    {item.quantity}
                                  </td>
                                  <td className="p-2.5 text-right whitespace-nowrap text-slate-600">
                                    {formatBirr(item.unitCost)}
                                  </td>
                                  <td className="p-2.5 text-right font-black whitespace-nowrap text-slate-900">
                                    {formatBirr(item.totalCost)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Close */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};


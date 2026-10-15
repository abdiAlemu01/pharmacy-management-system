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
  Trash2,
} from 'lucide-react';
import {
  useSupplierPurchaseHistory,
  useCreateSupplierPurchase,
  useDeleteSupplierPurchase,
} from '../hooks/use-suppliers';

export const SupplierPurchaseHistory = ({
  isOpen,
  onClose,
  supplier,
}) => {
  const [expandedPurchaseId, setExpandedPurchaseId] = useState(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState(null);

  // New purchase state
  const [newPaymentStatus, setNewPaymentStatus] = useState('PAID');
  const [newAmountPaid, setNewAmountPaid] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState([
    { medicineName: '', batchNumber: '', quantity: 1, unitCost: '', expiryDate: '' },
  ]);

  const { data, isLoading } = useSupplierPurchaseHistory(supplier?.id, {
    enabled: Boolean(isOpen && supplier?.id),
  });

  const createPurchaseMutation = useCreateSupplierPurchase();
  const deletePurchaseMutation = useDeleteSupplierPurchase();

  const handleConfirmDelete = () => {
    if (!deletingPurchase || !supplier?.id) return;
    deletePurchaseMutation.mutate(
      { supplierId: supplier.id, purchaseId: deletingPurchase.id },
      {
        onSuccess: () => {
          setDeletingPurchase(null);
        },
      }
    );
  };

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
    totalPaid: 0,
    totalDue: 0,
    totalItemsPurchased: 0,
    lastPurchaseDate: null,
  };

  const currentOrderTotal = newItems.reduce(
    (acc, i) => acc + ((parseInt(i.quantity, 10) || 0) * (parseFloat(i.unitCost) || 0)),
    0
  );

  const parsedAmountPaid = newPaymentStatus === 'PAID'
    ? currentOrderTotal
    : newPaymentStatus === 'PENDING'
    ? 0
    : parseFloat(newAmountPaid) || 0;

  const calculatedAmountLeft = Math.max(0, currentOrderTotal - parsedAmountPaid);

  const toggleExpand = (id) => {
    setExpandedPurchaseId((prev) => (prev === id ? null : id));
  };

  const handleAddItemRow = () => {
    setNewItems((prev) => [
      ...prev,
      { medicineName: '', batchNumber: '', quantity: 1, unitCost: '', expiryDate: '' },
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

    if (newPaymentStatus === 'PARTIAL') {
      const paidVal = parseFloat(newAmountPaid);
      if (isNaN(paidVal) || paidVal < 0) {
        alert('Please enter a valid amount paid for partial payment');
        return;
      }
      if (paidVal > currentOrderTotal) {
        alert(`Amount paid cannot exceed total order cost (${formatBirr(currentOrderTotal)})`);
        return;
      }
    }

    const payload = {
      id: supplier.id,
      paymentStatus: newPaymentStatus,
      amountPaid: parsedAmountPaid,
      amountDue: calculatedAmountLeft,
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
        setNewNotes('');
        setNewAmountPaid('');
        setNewItems([{ medicineName: '', batchNumber: '', quantity: 1, unitCost: '', expiryDate: '' }]);
      },
    });
  };

  return (
    <>
      <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase History: ${supplier.name}`}
      className="max-w-4xl"
    >
      <div className="space-y-5 text-sm">
        {/* Supplier Header & Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Total Orders
            </span>
            <span className="font-black text-slate-900 dark:text-slate-100 text-xl">
              {summary.totalOrders}
            </span>
          </div>

          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-1">
              Total Spend
            </span>
            <span className="font-black text-emerald-800 dark:text-emerald-300 text-lg sm:text-xl whitespace-nowrap block">
              {formatBirr(summary.totalSpent)}
            </span>
            {summary.totalDue > 0 && (
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mt-1">
                Balance Due: {formatBirr(summary.totalDue)}
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Items Received
            </span>
            <span className="font-black text-slate-900 dark:text-slate-100 text-xl">
              {summary.totalItemsPurchased} units
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Last Order
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {summary.lastPurchaseDate
                ? new Date(summary.lastPurchaseDate).toLocaleDateString()
                : 'None'}
            </span>
          </div>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              All Purchases & Deliveries
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Stock supplied: <strong className="text-slate-700 dark:text-slate-300">{supplier.stockSupplied}</strong>
            </p>
          </div>

          <Button
            type="button"
            variant={isAddingPurchase ? 'secondary' : 'primary'}
            onClick={() => setIsAddingPurchase((prev) => !prev)}
            className="text-sm py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingPurchase ? 'Cancel New Order' : 'Record New Purchase'}</span>
          </Button>
        </div>

        {/* Record New Purchase Form (Collapsible) */}
        {isAddingPurchase && (
          <form
            onSubmit={handleSavePurchase}
            className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/50 pb-2.5">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 text-sm uppercase tracking-wider">
                New Purchase Order from {supplier.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add delivered batch stock</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => {
                    setNewPaymentStatus(e.target.value);
                    if (e.target.value !== 'PARTIAL') {
                      setNewAmountPaid('');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PARTIAL">PARTIAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Received in good condition"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Partial Payment Amount Fields */}
            {newPaymentStatus === 'PARTIAL' && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                  <span className="uppercase tracking-wider">Partial Payment Recording</span>
                  <span>Order Cost: {formatBirr(currentOrderTotal)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Paid (Birr) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={currentOrderTotal > 0 ? currentOrderTotal : undefined}
                      value={newAmountPaid}
                      onChange={(e) => setNewAmountPaid(e.target.value)}
                      placeholder="Enter amount paid (e.g. 5000)"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Amount Left (Balance Due)
                    </span>
                    <div className="px-3.5 py-2.5 bg-amber-100/80 dark:bg-amber-900/40 rounded-xl text-sm font-black text-amber-950 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 flex items-center justify-between">
                      <span>{formatBirr(calculatedAmountLeft)}</span>
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Due to Supplier</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Item Rows */}
            <div className="space-y-2.5 pt-2">
              <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Delivered Items:
              </span>
              {newItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2.5 items-center bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="col-span-10 sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">Medicine Name</label>
                    <input
                      type="text"
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                      placeholder="Medicine / Item Name"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">Batch #</label>
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(idx, 'batchNumber', e.target.value)}
                      placeholder="Batch No"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      placeholder="Quantity"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 sm:hidden">Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                      placeholder="Purchasing Cost "
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {formatBirr((item.quantity || 0) * (item.unitCost || 0))}
                    </span>
                    {newItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-rose-500 hover:text-rose-700 text-sm font-bold p-1 cursor-pointer"
                        title="Remove Item"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add another medicine</span>
                </button>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">
                    Total Order: {formatBirr(currentOrderTotal)}
                  </span>
                  {newPaymentStatus === 'PARTIAL' && (
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                      Paid: {formatBirr(parsedAmountPaid)} • Left: {formatBirr(calculatedAmountLeft)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/50">
              <Button
                type="submit"
                variant="primary"
                disabled={createPurchaseMutation.isPending}
                className="text-sm py-2 px-5 rounded-xl font-semibold cursor-pointer shadow-xs"
              >
                {createPurchaseMutation.isPending ? 'Saving Order...' : 'Confirm & Save Purchase'}
              </Button>
            </div>
          </form>
        )}

        {/* Purchase Orders List Table */}
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-2" />
              <p className="text-sm font-medium">Loading purchase history...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-base">No purchases recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders have been recorded from this supplier yet. Click &quot;Record New Purchase&quot; above to add one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchases.map((purchase) => {
                const isExpanded = expandedPurchaseId === purchase.id;
                return (
                  <div key={purchase.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Purchase Header Row */}
                    <div
                      onClick={() => toggleExpand(purchase.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {purchase.purchaseOrderNo || purchase.id.slice(0, 8)}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400">
                              {purchase.status}
                            </span>
                            {purchase.paymentStatus === 'PARTIAL' ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                PARTIAL (Paid: {formatBirr(purchase.amountPaid || 0)} • Left: {formatBirr(purchase.amountDue !== undefined ? purchase.amountDue : Math.max(0, purchase.totalCost - (purchase.amountPaid || 0)))})
                              </span>
                            ) : purchase.paymentStatus === 'PAID' ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                PAID
                              </span>
                            ) : (
                              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
                                PENDING (Due: {formatBirr(purchase.totalCost)})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                            Date: {new Date(purchase.createdAt).toLocaleString()} •{' '}
                            {purchase.items?.length || 0} items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                          <span className="font-black text-slate-900 dark:text-slate-100 text-base">
                            {formatBirr(purchase.totalCost)}
                          </span>
                          {purchase.paymentStatus === 'PARTIAL' && (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block whitespace-nowrap mt-0.5">
                              Left: {formatBirr(purchase.amountDue !== undefined ? purchase.amountDue : Math.max(0, purchase.totalCost - (purchase.amountPaid || 0)))}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPurchase(purchase);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete purchase order"
                          aria-label="Delete purchase order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                          aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Items Breakdown */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {/* Financial summary breakdown banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Total Cost:</span>
                            <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                              {formatBirr(purchase.totalCost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Amount Paid:</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                              {formatBirr(purchase.amountPaid !== undefined ? purchase.amountPaid : (purchase.paymentStatus === 'PAID' ? purchase.totalCost : 0))}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Balance Left / Due:</span>
                            <span className={`font-black text-sm ${
                              (purchase.amountDue !== undefined ? purchase.amountDue : (purchase.paymentStatus === 'PAID' ? 0 : purchase.totalCost)) > 0
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {formatBirr(purchase.amountDue !== undefined ? purchase.amountDue : (purchase.paymentStatus === 'PAID' ? 0 : purchase.totalCost))}
                            </span>
                          </div>
                        </div>

                        {purchase.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            Notes: {purchase.notes}
                          </p>
                        )}

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                <th className="p-3">Medicine / Item</th>
                                <th className="p-3">Batch #</th>
                                <th className="p-3 text-center">Qty</th>
                                <th className="p-3 text-right">Unit Cost</th>
                                <th className="p-3 text-right font-bold">Total Cost</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {(purchase.items || []).map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                                    {item.medicineName}
                                  </td>
                                  <td className="p-3 font-mono text-xs text-slate-500">
                                    {item.batchNumber || '—'}
                                  </td>
                                  <td className="p-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                                    {item.quantity}
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">
                                    {formatBirr(item.unitCost)}
                                  </td>
                                  <td className="p-3 text-right font-black whitespace-nowrap text-slate-900 dark:text-slate-100">
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
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>

    {/* Delete Confirmation Modal */}
    {deletingPurchase && (
      <Dialog
        isOpen={Boolean(deletingPurchase)}
        onClose={() => !deletePurchaseMutation.isPending && setDeletingPurchase(null)}
        title="Delete Purchase Record"
        className="max-w-md"
        overlayClassName="z-[60]"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Are you sure you want to delete this purchase?
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                Order <strong className="font-mono">{deletingPurchase.purchaseOrderNo || deletingPurchase.id.slice(0, 8)}</strong> with {deletingPurchase.items?.length || 0} item(s) totaling <strong>{formatBirr(deletingPurchase.totalCost)}</strong> will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingPurchase(null)}
              disabled={deletePurchaseMutation.isPending}
              className="text-sm py-2 px-4 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deletePurchaseMutation.isPending}
              className="text-sm py-2 px-4 rounded-xl font-semibold cursor-pointer shadow-xs"
            >
              {deletePurchaseMutation.isPending ? 'Deleting...' : 'Delete Purchase'}
            </Button>
          </div>
        </div>
      </Dialog>
    )}
  </>
);
};

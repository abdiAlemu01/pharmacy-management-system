import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { useSuppliers } from '@/features/suppliers';
import {
  Plus,
  Trash2,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
  Package,
  ChevronDown,
  Check,
} from 'lucide-react';

export const PurchaseOrderModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  preselectedSupplierId = null,
}) => {
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const suppliers = suppliersData?.data?.suppliers || [];

  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [notes, setNotes] = useState('');

  // Initial payment
  const [paymentChoice, setPaymentChoice] = useState('UNPAID'); // UNPAID, FULL, PARTIAL
  const [amountPaid, setAmountPaid] = useState(0);

  // Supplier custom dropdown state
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const supplierDropdownRef = useRef(null);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || null;

  const filteredSuppliers = suppliers.filter((sup) =>
    (sup.name || '').toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (sup.phone || '').includes(supplierSearch)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target)) {
        setIsSupplierDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Items
  const [items, setItems] = useState([
    {
      id: 1,
      medicineName: '',
      quantity: '',
      unitCost: '',
      batchNumber: '',
      expiryDate: '',
    },
  ]);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsSupplierDropdownOpen(false);
      setSupplierSearch('');
      if (preselectedSupplierId) {
        setSupplierId(preselectedSupplierId);
      } else if (suppliers.length > 0 && !supplierId) {
        setSupplierId(suppliers[0].id);
      }
    }
  }, [isOpen, preselectedSupplierId, suppliers]);

  // Calculations
  const subtotal = items.reduce((acc, it) => {
    const qty = parseInt(it.quantity, 10) || 0;
    const cost = parseFloat(it.unitCost) || 0;
    return acc + qty * cost;
  }, 0);

  const numDiscount = Math.max(0, parseFloat(discount) || 0);
  const numCharges = Math.max(0, parseFloat(additionalCharges) || 0);
  const totalCost = Math.max(0, parseFloat((subtotal - numDiscount + numCharges).toFixed(2)));
  const amountLeft = Math.max(0, parseFloat((totalCost - (paymentChoice === 'UNPAID' ? 0 : parseFloat(amountPaid) || 0)).toFixed(2)));

  useEffect(() => {
    if (paymentChoice === 'FULL') {
      setAmountPaid(totalCost);
    } else if (paymentChoice === 'UNPAID') {
      setAmountPaid(0);
    }
  }, [paymentChoice, totalCost]);

  const handleAddItem = () => {
    setErrorMsg('');
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        medicineName: '',
        quantity: '',
        unitCost: '',
        batchNumber: '',
        expiryDate: '',
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    setErrorMsg('');
    if (items.length <= 1) {
      // Instead of showing an error, reset/clear the single row fields
      setItems([
        {
          id: Date.now(),
          medicineName: '',
          quantity: '',
          unitCost: '',
          batchNumber: '',
          expiryDate: '',
        },
      ]);
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setErrorMsg('');
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supplierId) {
      setErrorMsg('Please select a registered supplier');
      return;
    }

    if (!items || items.length === 0) {
      setErrorMsg('Please add at least one medicine item');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.medicineName.trim()) {
        setErrorMsg(`Row ${i + 1}: Medicine name is required`);
        return;
      }
      if (!it.quantity || parseInt(it.quantity, 10) <= 0) {
        setErrorMsg(`Row ${i + 1}: Quantity must be greater than 0`);
        return;
      }
      if (!it.unitCost || parseFloat(it.unitCost) <= 0) {
        setErrorMsg(`Row ${i + 1}: Unit price must be greater than 0`);
        return;
      }
    }

    const payload = {
      supplierId,
      orderDate,
      invoiceNo: invoiceNo.trim() || null,
      discount: numDiscount,
      additionalCharges: numCharges,
      notes: notes.trim() || null,
      amountPaid: paymentChoice === 'UNPAID' ? 0 : parseFloat(amountPaid) || 0,
      items: items.map((it) => ({
        medicineName: it.medicineName.trim(),
        quantity: parseInt(it.quantity, 10),
        unitCost: parseFloat(it.unitCost),
        batchNumber: it.batchNumber.trim() || null,
        expiryDate: it.expiryDate || null,
      })),
    };

    onSubmit(payload, () => {
      // Reset form on success
      setItems([
        {
          id: Date.now(),
          medicineName: '',
          quantity: '',
          unitCost: '',
          batchNumber: '',
          expiryDate: '',
        },
      ]);
      setInvoiceNo('');
      setDiscount(0);
      setAdditionalCharges(0);
      setNotes('');
      setPaymentChoice('UNPAID');
      setAmountPaid(0);
      onClose();
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Medicine Purchase Order"
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-rose-600 hover:text-rose-800 font-bold ml-2 p-1 cursor-pointer"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Header Information: Supplier & Order Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="relative" ref={supplierDropdownRef}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supplier *</span>
            </label>
            <button
              type="button"
              onClick={() => setIsSupplierDropdownOpen((prev) => !prev)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
            >
              <span className="truncate">
                {selectedSupplier ? selectedSupplier.name : 'Choose Supplier'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${isSupplierDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {isSupplierDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-56 flex flex-col">
                {suppliers.length > 4 && (
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                    <input
                      type="text"
                      placeholder="Search supplier..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                )}
                <div className="overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-700/50">
                  {filteredSuppliers.length === 0 ? (
                    <div className="px-3 py-2.5 text-xs text-slate-400 italic text-center">
                      No suppliers found
                    </div>
                  ) : (
                    filteredSuppliers.map((sup) => {
                      const isSelected = sup.id === supplierId;
                      return (
                        <button
                          key={sup.id}
                          type="button"
                          onClick={() => {
                            setSupplierId(sup.id);
                            setIsSupplierDropdownOpen(false);
                            setSupplierSearch('');
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="block truncate font-bold">{sup.name}

                          

                           </span> 
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Purchase Date </span>
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            >
            </input>
          </div>
        </div>

        {/* 2. Medicine Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Medicine Items Ordered</span>
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-2 text-center w-12 text-slate-500">#</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Medicine Name</th>
                  <th className="py-2.5 px-3 w-24">Quantity</th>
                  <th className="py-2.5 px-3 w-28">Unit Price</th>
                  <th className="py-2.5 px-3 w-32">Line Total</th>
                  <th className="py-2.5 px-3 w-28">Batch No</th>
                  <th className="py-2.5 px-3 w-36">Expiry Date</th>
                  <th className="py-2.5 px-2 text-center w-12">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it, idx) => {
                  const lineTotal = (parseInt(it.quantity, 10) || 0) * (parseFloat(it.unitCost) || 0);
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-2 text-center font-bold text-slate-400 w-12">{idx + 1}</td>
                      <td className="py-2.5 px-3 min-w-[180px]">
                        <input
                          type="text"
                          placeholder="Enter medicine name "
                          value={it.medicineName}
                          onChange={(e) => handleItemChange(it.id, 'medicineName', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                      </td>
                      <td className="py-2.5 px-3 w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={it.quantity ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (!isNaN(val) && Number(val) >= 0)) {
                              handleItemChange(it.id, 'quantity', val);
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          required
                        />
                      </td>
                      <td className="py-2.5 px-3 w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          value={it.unitCost}
                          onChange={(e) => handleItemChange(it.id, 'unitCost', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                      </td>
                      <td className="py-2.5 px-3 w-32 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
                      </td>
                      <td className="py-2.5 px-3 w-28">
                        <input
                          type="text"
                          placeholder="Batch No"
                          value={it.batchNumber}
                          onChange={(e) => handleItemChange(it.id, 'batchNumber', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 w-36">
                        <input
                          type="date"
                          value={it.expiryDate}
                          onChange={(e) => handleItemChange(it.id, 'expiryDate', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center w-12">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Discount, Charges & Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-3">
            

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Order Notes / Terms
              </label>
              <textarea
                rows={2}
                placeholder="Optional supplier notes, terms, delivery expectations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          {/* Financial summary box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 
          rounded-2xl space-y-2.5">

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-black text-slate-900 dark:text-slate-100">
              <span>Total Purchase Cost:</span>
              <span className="text-emerald-700 dark:text-emerald-400">
                {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr
              </span>
            </div>

            {/* Payment at creation */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Supplier Payment
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'FULL', label: 'Paid Full' },
                  { id: 'PARTIAL', label: 'Partial' },
                  { id: 'UNPAID', label: 'Unpaid' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentChoice(opt.id)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paymentChoice === opt.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {paymentChoice === 'PARTIAL' && (
                <div className="grid grid-cols-2 gap-2 pt-1.5 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Amount Paid (Birr) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={totalCost > 0 ? totalCost : undefined}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Amount Left (Unpaid)
                    </span>
                    <div className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-xs font-black text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                      <span>{amountLeft.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr</span>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Due</span>
                    </div>
                  </div>
                </div>
              )}
              {paymentChoice === 'UNPAID' && (
                <div className="pt-1 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center justify-between px-1">
                  <span>Amount Left (Unpaid):</span>
                  <span>{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr</span>
                </div>
              )}
              {paymentChoice === 'FULL' && (
                <div className="pt-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between px-1">
                  <span>Amount Paid in Full:</span>
                  <span>{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr (0.00 Due)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Creating Purchase Order...' : 'Confirm & Create Order'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


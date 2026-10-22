import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useSuppliers } from '@/features/suppliers';

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Staff salaries and benefits',
  'Utilities (electricity and water)',
  'Pharmacy supplies',
  'Equipment maintenance',
  'Medicine storage and refrigeration',
  'Pharmaceutical waste disposal',
  'Transportation and delivery',
  'License and permit fees',
  'Software and IT maintenance',
  'Cleaning and sanitation',
  'Other pharmacy expenses',
];

export const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isPending = false,
  currencySymbol = 'Birr',
}) => {
  const isEditing = Boolean(initialData);

  // Optional supplier payee autocomplete
  const { data: suppliersRes } = useSuppliers();
  const suppliers = suppliersRes?.data?.suppliers || [];

  const [formData, setFormData] = useState({
    title: '',
    category: EXPENSE_CATEGORIES[0],
    customCategory: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    payee: '',
    description: '',
    // Initial payment option for new expenses
    paymentMode: 'UNPAID', // 'UNPAID' | 'FULL' | 'PARTIAL'
    initialAmountPaid: '',
    paymentMethod: 'Cash',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const isOther =
        initialData.category === 'Other pharmacy expenses' ||
        initialData.category?.startsWith('Other:') ||
        (!EXPENSE_CATEGORIES.includes(initialData.category) && initialData.category);

      let catValue = initialData.category || EXPENSE_CATEGORIES[0];
      let customVal = '';

      if (isOther) {
        catValue = 'Other pharmacy expenses';
        if (initialData.category?.startsWith('Other: ')) {
          customVal = initialData.category.slice(7);
        } else if (initialData.category?.startsWith('Other:')) {
          customVal = initialData.category.slice(6);
        } else if (initialData.category !== 'Other pharmacy expenses') {
          customVal = initialData.category;
        }
      }

      setFormData({
        title: initialData.title || '',
        category: catValue,
        customCategory: customVal,
        amount: String(initialData.amount || ''),
        expenseDate: initialData.expenseDate || new Date().toISOString().split('T')[0],
        payee: initialData.payee || '',
        description: initialData.description || '',
        paymentMode: initialData.paymentStatus === 'PAID' ? 'FULL' : initialData.paymentStatus === 'PARTIALLY_PAID' ? 'PARTIAL' : 'UNPAID',
        initialAmountPaid: String(initialData.amountPaid || ''),
        paymentMethod: 'Cash',
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        category: EXPENSE_CATEGORIES[0],
        customCategory: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        payee: '',
        description: '',
        paymentMode: 'UNPAID',
        initialAmountPaid: '',
        paymentMethod: 'Cash',
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Expense title is required';
    }
    if (!formData.category) {
      errs.category = 'Category is required';
    }
    const amt = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Amount must be greater than zero';
    }
    if (!formData.expenseDate) {
      errs.expenseDate = 'Expense date is required';
    }

    if (isEditing) {
      const paidAlready = parseFloat(Number(initialData.amountPaid || 0).toFixed(2));
      if (amt < paidAlready) {
        errs.amount = `Total cannot be less than already paid (${paidAlready} ${currencySymbol})`;
      }
    } else if (formData.paymentMode === 'PARTIAL') {
      const partAmt = parseFloat(formData.initialAmountPaid);
      if (isNaN(partAmt) || partAmt <= 0) {
        errs.initialAmountPaid = 'Enter a valid amount paid';
      } else if (partAmt >= amt) {
        errs.initialAmountPaid = 'Partial payment must be less than total amount';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let finalCategory = formData.category;
    if (formData.category === 'Other pharmacy expenses' && formData.customCategory?.trim()) {
      finalCategory = `Other: ${formData.customCategory.trim()}`;
    }

    const payload = {
      title: formData.title.trim(),
      category: finalCategory,
      amount: parseFloat(formData.amount),
      expenseDate: formData.expenseDate,
      payee: formData.payee.trim() || undefined,
      description: formData.description.trim() || undefined,
    };

    if (!isEditing) {
      if (formData.paymentMode === 'FULL') {
        payload.isPaidInFull = true;
        payload.paymentMethod = formData.paymentMethod;
      } else if (formData.paymentMode === 'PARTIAL') {
        payload.initialAmountPaid = parseFloat(formData.initialAmountPaid);
        payload.paymentMethod = formData.paymentMethod;
      }
    }

    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 pt-16 sm:pt-20 pb-16"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEditing ? 'Edit Operating Expense' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update expense details and operating amount'
                : 'Enter pharmacy expense details to track costs and payments'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div>
              <Input
                label="Expense Title *"
                name="title"
                placeholder="e.g. October Store Rent, Electric Bill, Syringes"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1 w-full text-left">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Expense Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Dynamic input with placeholder when user chooses "Other pharmacy expenses" */}
              {formData.category === 'Other pharmacy expenses' && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <Input
                    label="Specify Other Expense / Your Idea"
                    name="customCategory"
                    placeholder="Put your idea here (e.g. Marketing, Packaging, Security service...)"
                    value={formData.customCategory}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Amount & Date in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Input
                  label={`Amount (${currencySymbol}) *`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  error={errors.amount}
                />
                {isEditing && (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Paid so far: {Number(initialData.amountPaid || 0).toFixed(2)} {currencySymbol}
                  </span>
                )}
              </div>

              <div>
                <Input
                  label="Expense Date *"
                  name="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  error={errors.expenseDate}
                />
              </div>
            </div>

            {/* Paid To (Payee) */}
            <div>
              <Input
                label="Paid To (Payee)"
                name="payee"
                list="suppliers-payee-datalist"
                placeholder="Enter for what you pay"
                value={formData.payee}
                onChange={handleChange}
              />
              {suppliers.length > 0 && (
                <datalist id="suppliers-payee-datalist">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 w-full text-left">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Additional notes, invoice number, or memo..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Simple Initial Payment Selection (Only for Add) */}
            {!isEditing && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Payment Status
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, paymentMode: 'UNPAID' }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.paymentMode === 'UNPAID'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Unpaid (Bill)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, paymentMode: 'FULL' }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.paymentMode === 'FULL'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, paymentMode: 'PARTIAL' }))}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.paymentMode === 'PARTIAL'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    Partially Paid
                  </button>
                </div>

                {formData.paymentMode === 'PARTIAL' && (
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
                    <Input
                      label={`Amount Paid Now (${currencySymbol}) *`}
                      name="initialAmountPaid"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.initialAmountPaid}
                      onChange={handleChange}
                      error={errors.initialAmountPaid}
                    />
                    {formData.amount && formData.initialAmountPaid && (
                      <div className="text-xs text-amber-800 dark:text-amber-300">
                        Remaining Unpaid Balance:{' '}
                        <strong>
                          {Math.max(
                            0,
                            parseFloat(formData.amount || 0) - parseFloat(formData.initialAmountPaid || 0)
                          ).toFixed(2)}{' '}
                          {currencySymbol}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
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
                  Saving...
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Record Expense'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


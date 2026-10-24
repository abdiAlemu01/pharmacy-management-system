import React, { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useAppDate } from '@/shared/lib/date-utils';

export const MedicineForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { formatDate, calendarType } = useAppDate();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    purchaseCost: '',
    sellingPrice: '',
    expiryDate: '',
  });

  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        quantity: initialData.quantity !== undefined ? String(initialData.quantity) : '',
        purchaseCost: initialData.purchaseCost !== undefined ? String(initialData.purchaseCost) : '',
        sellingPrice: initialData.sellingPrice !== undefined ? String(initialData.sellingPrice) : '',
        expiryDate: initialData.expiryDate ? String(initialData.expiryDate).slice(0, 10) : '',
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        purchaseCost: '',
        sellingPrice: '',
        expiryDate: '',
      });
    }
    setErrors({});
    setShowConfirm(false);
  }, [initialData]);

  const handleKeyDownNonNegative = (e) => {
    // Prevent minus sign, exponents, and unnecessary symbols
    if (e.key === '-' || e.key === 'Subtract' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Disallow negative numbers for quantity, purchaseCost, and sellingPrice
    if (name === 'quantity') {
      if (value.includes('-')) return;
      if (value !== '' && Number(value) < 0) return;
    }
    if (name === 'purchaseCost' || name === 'sellingPrice') {
      if (value.includes('-')) return;
      if (value !== '' && Number(value) < 0) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Medicine Name
    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }

    // Quantity: non-negative whole number
    const qtyNum = Number(formData.quantity);
    if (formData.quantity === '' || isNaN(qtyNum)) {
      newErrors.quantity = 'Quantity is required and must be a valid number';
    } else if (qtyNum < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    } else if (!Number.isInteger(qtyNum)) {
      newErrors.quantity = 'Quantity must be a whole number';
    }

    // Purchase Cost: non-negative decimal amount
    const costNum = Number(formData.purchaseCost);
    if (formData.purchaseCost === '' || isNaN(costNum)) {
      newErrors.purchaseCost = 'Purchase cost is required and must be a valid number';
    } else if (costNum < 0) {
      newErrors.purchaseCost = 'Purchase cost cannot be negative';
    }

    // Selling Price: non-negative decimal amount
    const priceNum = Number(formData.sellingPrice);
    if (formData.sellingPrice === '' || isNaN(priceNum)) {
      newErrors.sellingPrice = 'Selling price is required and must be a valid number';
    } else if (priceNum < 0) {
      newErrors.sellingPrice = 'Selling price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData) {
      setShowConfirm(true);
    } else {
      performSubmit();
    }
  };

  const performSubmit = () => {
    const payload = {
      name: formData.name.trim(),
      quantity: parseInt(formData.quantity, 10),
      purchaseCost: parseFloat(Number(formData.purchaseCost).toFixed(2)),
      sellingPrice: parseFloat(Number(formData.sellingPrice).toFixed(2)),
      expiryDate: formData.expiryDate && formData.expiryDate.trim() !== '' ? formData.expiryDate : null,
    };
    onSubmit(payload);
  };

  const calculatedProfit =
    formData.purchaseCost !== '' && formData.sellingPrice !== '' && !isNaN(Number(formData.purchaseCost)) && !isNaN(Number(formData.sellingPrice))
      ? (Number(formData.sellingPrice) - Number(formData.purchaseCost)).toFixed(2)
      : null;

  return (
    <div>
      {showConfirm ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-amber-900">Confirm Medicine Update</h4>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setShowConfirm(false)}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={performSubmit}
              className="flex items-center gap-2"
            >
              {loading ? 'Saving...' : 'Yes, Update Medicine'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <Input
            label="Medicine Name "
            name="name"
            placeholder="e.g. Paracetamol 500mg"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            autoFocus
          />

          <Input
            label="Quantity "
            name="quantity"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 100"
            value={formData.quantity}
            onChange={handleChange}
            onKeyDown={handleKeyDownNonNegative}
            error={errors.quantity}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Purchase Cost (Birr) "
              name="purchaseCost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5.00"
              value={formData.purchaseCost}
              onChange={handleChange}
              onKeyDown={handleKeyDownNonNegative}
              error={errors.purchaseCost}
            />

            <Input
              label="Selling Price (Birr) "
              name="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 10.00"
              value={formData.sellingPrice}
              onChange={handleChange}
              onKeyDown={handleKeyDownNonNegative}
              error={errors.sellingPrice}
            />
          </div>

          <div>
            <Input
              label={`Expiry Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
              name="expiryDate"
              type="date"
              placeholder="YYYY-MM-DD"
              value={formData.expiryDate}
              onChange={handleChange}
              error={errors.expiryDate}
            />
            {formData.expiryDate && (
              <div className="text-[11px] text-slate-500 mt-1 pl-1">
                
                <span className="font-semibold text-emerald-700">
                  {formatDate(formData.expiryDate)}
                </span>
              </div>
            )}
          </div>

          {calculatedProfit !== null && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Estimated Profit per Unit:</span>
              <span
                className={`font-bold ${
                  Number(calculatedProfit) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {calculatedProfit} Birr
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : initialData ? (
                'Review & Save'
              ) : (
                'Add Medicine'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

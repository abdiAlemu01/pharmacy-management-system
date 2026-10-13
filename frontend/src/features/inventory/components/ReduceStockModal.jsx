import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { MinusCircle, AlertTriangle, Calculator } from 'lucide-react';

export const ReduceStockModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedMedicine = null,
  medicines = [],
  isLoading = false,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [medicineId, setMedicineId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (selectedMedicine) {
        setMedicineId(selectedMedicine.id);
      } else if (medicines.length > 0) {
        setMedicineId(medicines[0].id);
      } else {
        setMedicineId('');
      }
      setQuantity('');
      setDate(today);
      setErrors({});
    }
  }, [isOpen, selectedMedicine, medicines, today]);

  const activeMedicine = medicines.find((m) => m.id === medicineId) || selectedMedicine;

  const availableStock = activeMedicine ? parseInt(activeMedicine.quantity, 10) || 0 : 0;
  const unitCost = activeMedicine ? parseFloat(activeMedicine.purchaseCost || 0) : 0;
  const unitSelling = activeMedicine ? parseFloat(activeMedicine.sellingPrice || 0) : 0;

  const qtyNum = parseInt(quantity, 10) || 0;
  const totalCostDeducted = (qtyNum * unitCost).toFixed(2);
  const remainingStock = Math.max(0, availableStock - qtyNum);

  const validate = () => {
    const errs = {};
    if (!medicineId) {
      errs.medicineId = 'Please select a medicine';
    }
    if (!quantity || qtyNum <= 0) {
      errs.quantity = 'Quantity to reduce must be greater than 0';
    } else if (qtyNum > availableStock) {
      errs.quantity = `Cannot reduce ${qtyNum} units. Current stock is only ${availableStock} units.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      medicineId,
      quantity: qtyNum,
      date,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Reduce Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Selector */}
        {selectedMedicine ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 font-medium block">Medicine</span>
            <p className="font-bold text-slate-800 text-sm">{selectedMedicine.name}</p>
          </div>
        ) : (
          <Select
            label="Select Medicine"
            value={medicineId}
            onChange={(e) => {
              setMedicineId(e.target.value);
              setErrors({});
            }}
            options={medicines.map((m) => ({
              value: m.id,
              label: `${m.name} (Available: ${m.quantity} units)`,
            }))}
            error={errors.medicineId}
          />
        )}

        {/* Available Stock Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium">Currently Available Stock</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md ${
              availableStock === 0
                ? 'bg-rose-100 text-rose-800'
                : availableStock <= 10
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {availableStock} units
          </span>
        </div>

        {/* Quantity to Deduct & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quantity to Reduced "
            type="number"
            min="1"
            max={availableStock}
            step="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
            }}
            placeholder={`Max: ${availableStock}`}
            error={errors.quantity}
            autoFocus
          />
          <Input
            label="reduced Date "
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Live Calculation Panel */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-base">
            <Calculator className="w-4 h-4 text-slate-500" />
            <span>Unit Price & Reduced Value</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
            <div>
              <span className="block text-slate-400 text-sm">Unit Purchase Price</span>
              <span className="font-bold text-slate-800 text-base">{unitCost.toFixed(2)} Birr</span>
            </div>
            <div>
              <span className="block text-slate-400 text-sm">Unit Selling Price</span>
              <span className="font-bold text-slate-800 text-base">{unitSelling.toFixed(2)} Birr</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
              <span className="block text-rose-700 font-medium text-sm">Total Cost of Reduced Stock</span>
              <span className="font-extrabold text-rose-900 text-base">
                {totalCostDeducted} Birr
              </span>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
              <span className="block text-slate-600 font-medium text-sm">Remaining Stock</span>
              <span className="font-extrabold text-slate-900 text-base">
                {remainingStock} units
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {remainingStock <= 0 ? (
                  <span className="text-rose-600 font-semibold">⚠ Will become Out of Stock</span>
                ) : remainingStock <= 10 ? (
                  <span className="text-amber-600 font-semibold">⚠ Will reach Low Stock</span>
                ) : (
                  ''
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Out of Stock warning */}
        {availableStock === 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>This medicine is currently out of stock (0 units). You cannot reduce stock further.</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={isLoading || availableStock === 0}
            className="flex items-center gap-1.5"
          >
            {isLoading ? 'Reducing...':'Reduce Stock '}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


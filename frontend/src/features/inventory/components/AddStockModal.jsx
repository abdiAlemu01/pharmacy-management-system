import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PlusCircle, Info, Calculator, CheckCircle2 } from 'lucide-react';

export const AddStockModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialMedicine = null,
  existingMedicines = [],
  isLoading = false,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialMedicine) {
        setName(initialMedicine.name || '');
        setQuantity('');
        setPurchaseCost(initialMedicine.purchaseCost !== undefined ? String(initialMedicine.purchaseCost) : '');
        setSellingPrice(initialMedicine.sellingPrice !== undefined ? String(initialMedicine.sellingPrice) : '');
        setPurchaseDate(initialMedicine.purchaseDate || today);
      } else {
        setName('');
        setQuantity('');
        setPurchaseCost('');
        setSellingPrice('');
        setPurchaseDate(today);
      }
      setErrors({});
    }
  }, [isOpen, initialMedicine, today]);

  // Match existing medicine by name
  const matchedExisting = useMemo(() => {
    if (!name.trim()) return null;
    return existingMedicines.find(
      (m) => m.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  }, [name, existingMedicines]);

  // When matched existing is selected, suggest its prices if user hasn't filled them
  const handleSelectExisting = (med) => {
    setName(med.name);
    if (!purchaseCost) setPurchaseCost(String(med.purchaseCost || ''));
    if (!sellingPrice) setSellingPrice(String(med.sellingPrice || ''));
  };

  // Live calculations
  const qtyNum = parseInt(quantity, 10) || 0;
  const unitCostNum = parseFloat(purchaseCost) || 0;
  const unitSellingNum = parseFloat(sellingPrice) || 0;
  const totalPrice = (qtyNum * unitCostNum).toFixed(2);
  const totalSellingValue = (qtyNum * unitSellingNum).toFixed(2);
  const potentialProfit = (totalSellingValue - totalPrice).toFixed(2);
  const updatedTotalStock = (matchedExisting ? matchedExisting.quantity : 0) + qtyNum;

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Medicine name is required';
    }
    if (!quantity || qtyNum <= 0) {
      errs.quantity = 'Quantity must be greater than 0';
    }
    if (purchaseCost === '' || isNaN(unitCostNum) || unitCostNum < 0) {
      errs.purchaseCost = 'Valid purchase price is required';
    }
    if (sellingPrice === '' || isNaN(unitSellingNum) || unitSellingNum < 0) {
      errs.sellingPrice = 'Valid selling price is required';
    }
    if (!purchaseDate) {
      errs.purchaseDate = 'Purchase date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      quantity: qtyNum,
      purchaseCost: unitCostNum,
      sellingPrice: unitSellingNum,
      purchaseDate,
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Notice for existing medicine */}
        {matchedExisting ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Existing Medicine Found &quot;{matchedExisting.name}&quot;
              </p>
              <p className="text-emerald-700 mt-0.5">
                Current stock <strong>{matchedExisting.quantity} units</strong>. Adding{' '}
                <strong>{qtyNum} units</strong> will automatically update the inventory to{' '}
                <strong>{updatedTotalStock} units</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">New Medicine Entry</p>
              <p className="text-blue-700 mt-0.5">
                If the medicine does not already exist in inventory, a new medicine record will be created.
              </p>
            </div>
          </div>
        )}

        {/* Medicine Name */}
        <div>
          <Input
            label="Medicine Name "
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            placeholder="e.g. Paracetamol 500mg"
            error={errors.name}
            list="medicine-suggestions"
            autoFocus
          />
          <datalist id="medicine-suggestions">
            {existingMedicines.map((m) => (
              <option key={m.id} value={m.name} />
            ))}
          </datalist>
        </div>

        {/* Quantity & Purchase Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quantity to Add "
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
            }}
            placeholder="e.g. 50"
            error={errors.quantity}
          />
          <Input
            label="Purchase Date "
            type="date"
            value={purchaseDate}
            onChange={(e) => {
              setPurchaseDate(e.target.value);
              if (errors.purchaseDate) setErrors((prev) => ({ ...prev, purchaseDate: null }));
            }}
            error={errors.purchaseDate}
          />
        </div>

        {/* Unit Purchase Price & Unit Selling Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Purchase Price"
            type="number"
            min="0"
            step="0.01"
            value={purchaseCost}
            onChange={(e) => {
              setPurchaseCost(e.target.value);
              if (errors.purchaseCost) setErrors((prev) => ({ ...prev, purchaseCost: null }));
            }}
            placeholder="0.00 Birr"
            error={errors.purchaseCost}
          />
          <Input
            label="Selling Price "
            type="number"
            min="0"
            step="0.01"
            value={sellingPrice}
            onChange={(e) => {
              setSellingPrice(e.target.value);
              if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: null }));
            }}
            placeholder="0.00 Birr"
            error={errors.sellingPrice}
          />
        </div>

        {/* Live Calculation Panel */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-sm">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-base">
            <Calculator className="w-4 h-4 text-slate-500" />
            <span>Stock Price & Cost</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
            <div>
              <span className="block text-slate-400 text-sm">Unit Purchase Price</span>
              <span className="font-bold text-slate-800 text-base">{unitCostNum.toFixed(2)} Birr</span>
            </div>
            <div>
              <span className="block text-slate-400 text-sm">Unit Selling Price</span>
              <span className="font-bold text-slate-800 text-base">{unitSellingNum.toFixed(2)} Birr</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="block text-emerald-700 font-medium text-sm">Total Purchase Cost</span>
              <span className="font-extrabold text-emerald-900 text-base">
                {totalPrice} Birr
              </span>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="block text-blue-700 font-medium text-sm">Total Selling Value</span>
              <span className="font-extrabold text-blue-900 text-base">
                {totalSellingValue} Birr
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="flex items-center gap-1.5">
           
            {isLoading ? 'Saving...' : 'Add Stock '}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


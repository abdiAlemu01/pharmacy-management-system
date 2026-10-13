import React, { useState, useEffect } from 'react';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Edit3, Calculator } from 'lucide-react';

export const EditStockModal = ({
  isOpen,
  onClose,
  onSubmit,
  medicine = null,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && medicine) {
      setName(medicine.name || '');
      setQuantity(medicine.quantity !== undefined ? String(medicine.quantity) : '0');
      setPurchaseCost(medicine.purchaseCost !== undefined ? String(medicine.purchaseCost) : '0');
      setSellingPrice(medicine.sellingPrice !== undefined ? String(medicine.sellingPrice) : '0');
      setPurchaseDate(medicine.purchaseDate || new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [isOpen, medicine]);

  const qtyNum = parseInt(quantity, 10) || 0;
  const unitCostNum = parseFloat(purchaseCost) || 0;
  const unitSellingNum = parseFloat(sellingPrice) || 0;
  const individualTotalCost = (qtyNum * unitCostNum).toFixed(2);
  const individualTotalSelling = (qtyNum * unitSellingNum).toFixed(2);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Medicine name is required';
    if (quantity === '' || isNaN(qtyNum) || qtyNum < 0) {
      errs.quantity = 'Quantity cannot be negative';
    }
    if (purchaseCost === '' || isNaN(unitCostNum) || unitCostNum < 0) {
      errs.purchaseCost = 'Valid purchase price is required';
    }
    if (sellingPrice === '' || isNaN(unitSellingNum) || unitSellingNum < 0) {
      errs.sellingPrice = 'Valid selling price is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: medicine.id,
      data: {
        name: name.trim(),
        quantity: qtyNum,
        purchaseCost: unitCostNum,
        sellingPrice: unitSellingNum,
        purchaseDate: purchaseDate || null,
      },
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Medicine Stock Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Name */}
        <Input
          label="Medicine Name *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
          }}
          error={errors.name}
        />

        {/* Quantity & Purchase Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Stock Quantity *"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: null }));
            }}
            error={errors.quantity}
          />
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        {/* Purchase Price & Selling Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Purchase Price (Unit Price in Birr) *"
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
            label="Selling Price (Unit Price in Birr) *"
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

        {/* Dynamic Individual Total Cost Panel */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Calculator className="w-4 h-4 text-slate-500" />
            <span>Updated Cost & Value for this Item</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="block text-emerald-700 font-medium">Individual Total Cost:</span>
              <span className="font-extrabold text-emerald-900 text-sm">
                {individualTotalCost} Birr
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">
                ({qtyNum} units × {unitCostNum.toFixed(2)} Birr)
              </span>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <span className="block text-blue-700 font-medium">Individual Selling Value:</span>
              <span className="font-extrabold text-blue-900 text-sm">
                {individualTotalSelling} Birr
              </span>
              <span className="text-[10px] text-blue-600 block mt-0.5">
                ({qtyNum} units × {unitSellingNum.toFixed(2)} Birr)
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
            <Edit3 className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};


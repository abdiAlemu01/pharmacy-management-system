import React from 'react';
import { Button } from '@/shared/components/ui/Button';

export const MedicineDetails = ({ medicine, onEdit, onClose }) => {
  if (!medicine) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{medicine.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase">Available Quantity</span>
          <p className="text-lg font-bold text-slate-800 mt-1">{medicine.quantity} units</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase">Purchase Cost</span>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {Number(medicine.purchaseCost).toFixed(2)} Birr
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase">Selling Price</span>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {Number(medicine.sellingPrice).toFixed(2)} Birr
          </p>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="text-xs font-medium text-emerald-700 uppercase">Profit per Unit</span>
          <p className="text-lg font-bold text-emerald-800 mt-1">
            {Number(medicine.profitPerUnit).toFixed(2)} Birr
          </p>
        </div>
      </div>

      {medicine.expiryDate && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase">Expiry Date</span>
          <span className="text-sm font-bold text-slate-800">
            {String(medicine.expiryDate).slice(0, 10)}
          </span>
        </div>
      )}

      <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-100">
       
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(medicine)}>
          Edit Medicine
        </Button>
      </div>
    </div>
  );
};


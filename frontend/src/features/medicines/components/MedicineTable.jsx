import React from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Eye, Edit2, ArrowUpDown } from 'lucide-react';

export const MedicineTable = ({
  medicines = [],
  loading = false,
  onViewDetails,
  onEditMedicine,
  sortBy,
  sortOrder,
  onSortToggle,
}) => {
  const statusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const renderSortHeader = (label, columnKey) => {
    const isSorted = sortBy === columnKey;
    return (
      <button
        type="button"
        onClick={() => onSortToggle(columnKey)}
        className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors cursor-pointer font-bold uppercase tracking-wider text-xs"
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`w-3.5 h-3.5 ${
            isSorted ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
          }`}
        />
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-emerald-600 mb-3"></div>
        <p className="text-slate-500 text-sm">Loading medicines list...</p>
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3 text-2xl">
          💊
        </div>
        <h3 className="text-base font-semibold text-slate-800">No medicines found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          No medicines match your current filters or none have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">
                {renderSortHeader('Medicine Name', 'name')}
              </th>
              <th className="px-4 py-3 font-semibold">
                {renderSortHeader('Quantity', 'quantity')}
              </th>
              <th className="px-4 py-3 font-semibold">
                {renderSortHeader('Purchase Cost', 'purchaseCost')}
              </th>
              <th className="px-4 py-3 font-semibold">
                {renderSortHeader('Selling Price', 'sellingPrice')}
              </th>
              <th className="px-4 py-3 font-semibold">Profit per Unit</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {medicines.map((med) => (
              <tr
                key={med.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="px-4 py-3.5 font-medium text-slate-900">
                  {med.name}
                </td>
                <td className="px-4 py-3.5 font-semibold">
                  <span
                    className={
                      med.quantity === 0
                        ? 'text-rose-600'
                        : med.quantity <= 10
                        ? 'text-amber-600'
                        : 'text-slate-800'
                    }
                  >
                    {med.quantity}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {Number(med.purchaseCost).toFixed(2)} Birr
                </td>
                <td className="px-4 py-3.5 font-medium">
                  {Number(med.sellingPrice).toFixed(2)} Birr
                </td>
                <td className="px-4 py-3.5 font-semibold">
                  <span
                    className={
                      med.profitPerUnit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }
                  >
                    {Number(med.profitPerUnit).toFixed(2)} Birr
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(med)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditMedicine(med)}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Medicine"
                      aria-label="Edit Medicine"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


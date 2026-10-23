import React from 'react';

export const StockStatusBadge = ({ quantity }) => {
  const qty = parseInt(quantity, 10) || 0;

  if (qty <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        Out of Stock (0)
      </span>
    );
  }

  if (qty <= 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Low Stock ({qty})
      </span>
    );
  }

  if (qty > 50) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Excess Stock ({qty})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      Normal Stock ({qty})
    </span>
  );
};

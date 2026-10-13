import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export const StockStatusBadge = ({ quantity }) => {
  const qty = parseInt(quantity, 10) || 0;

  if (qty <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        Out of Stock (0)
      </span>
    );
  }

  if (qty <= 10) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        Low Stock ({qty})
      </span>
    );
  }

  if (qty >= 100) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        Excess Stock ({qty})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      Normal Stock ({qty})
    </span>
  );
};


import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, RotateCcw, AlertCircle } from 'lucide-react';

export const DeliveryStatusBadge = ({ status }) => {
  switch (status) {
    case 'RECEIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Received</span>
        </span>
      );
    case 'PARTIALLY_RECEIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
          <Clock className="w-3.5 h-3.5" />
          <span>Partially Received</span>
        </span>
      );
    case 'RETURNED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Returned</span>
        </span>
      );
    case 'ORDERED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          <Clock className="w-3.5 h-3.5" />
          <span>Ordered</span>
        </span>
      );
  }
};

export const PaymentStatusBadge = ({ status }) => {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Paid</span>
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Partial</span>
        </span>
      );
    case 'UNPAID':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Unpaid</span>
        </span>
      );
  }
};


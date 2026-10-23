import React from 'react';
import { AlertTriangle, Clock, Calendar, ShieldAlert } from 'lucide-react';

export const NearExpiryMedicinesTable = ({ medicines = [] }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Near to Expire Medicines
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3" />
            <span>Expiry Risk</span>
          </span>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {medicines.length} Tracked
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Medicine Name</th>
              <th className="py-3 px-3 text-center">Batch No</th>
              <th className="py-3 px-3 text-center">Stock</th>
              <th className="py-3 px-3">Expiry Date</th>
              <th className="py-3 px-3 text-center">Days Left</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No near-expiry medicines found. Inventory is fresh!
                </td>
              </tr>
            ) : (
              medicines.map((med, index) => {
                const daysLeft = med.daysLeft;
                const isExpired = daysLeft < 0;
                const isCritical = !isExpired && daysLeft <= 30;
                const isWarning = !isExpired && daysLeft > 30 && daysLeft <= 90;

                return (
                  <tr
                    key={med.id || index}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Medicine Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {med.medicineName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {med.genericName || med.category || 'Pharmaceutical'}
                      </div>
                    </td>

                    {/* Batch No */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {med.batchNo}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {med.totalStock}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        units in stock
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(med.expiryDate)}
                      </div>
                    </td>

                    {/* Days Left */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-black text-xs ${
                          isExpired
                            ? 'text-rose-600 dark:text-rose-400'
                            : isCritical
                            ? 'text-amber-600 dark:text-amber-400'
                            : isWarning
                            ? 'text-amber-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpired
                          ? `${Math.abs(daysLeft)}d ago`
                          : `${daysLeft} days`}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          isExpired
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                            : isCritical
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                            : isWarning
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        {isExpired
                          ? 'Expired'
                          : isCritical
                          ? 'Critical (<30d)'
                          : isWarning
                          ? 'Warning (<90d)'
                          : 'Valid'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


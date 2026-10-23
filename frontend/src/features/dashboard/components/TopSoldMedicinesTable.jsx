import React from 'react';
import { ShoppingCart, TrendingUp, Package, ArrowUpRight } from 'lucide-react';

export const TopSoldMedicinesTable = ({
  medicines = [],
  currencySymbol = 'ETB',
}) => {
  const formatCurrency = (val) => {
    return `${currencySymbol} ${parseFloat(Number(val || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Most Sold Medicines
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <ShoppingCart className="w-3 h-3" />
              <span>Table 1: Top Demand</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked by quantity sold with generated revenue and gross profit
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Top {medicines.length}
        </span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 text-center w-12">Rank</th>
              <th className="py-3 px-4">Medicine Name</th>
              <th className="py-3 px-3 text-center">Units Sold</th>
              <th className="py-3 px-3 text-right">Revenue</th>
              <th className="py-3 px-3 text-right">Profit</th>
              <th className="py-3 px-3 text-center">In Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {medicines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No medicine sales recorded for the selected period.
                </td>
              </tr>
            ) : (
              medicines.map((med, index) => {
                const rank = index + 1;
                return (
                  <tr
                    key={med.id || index}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          rank === 1
                            ? 'bg-amber-400 text-white shadow-2xs'
                            : rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white'
                            : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {rank}
                      </span>
                    </td>

                    {/* Medicine Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {med.category || 'General'}
                      </div>
                    </td>

                    {/* Units Sold */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                        {med.quantitySold}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(med.totalRevenue)}
                    </td>

                    {/* Profit */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(med.totalProfit)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {med.margin}% margin
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          med.currentStock <= 10
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                            : med.currentStock > 50
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {med.currentStock} left
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


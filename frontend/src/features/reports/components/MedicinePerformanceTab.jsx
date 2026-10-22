import React, { useState, useMemo } from 'react';
import { Award, AlertCircle, TrendingUp, TrendingDown, Search, ArrowUpDown, Package } from 'lucide-react';
import { useMedicinePerformanceReports } from '../hooks/use-reports';

export const MedicinePerformanceTab = ({
  period,
  startDate,
  endDate,
  currencySymbol = 'Birr',
}) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'best' | 'slow'
  const [sortBy, setSortBy] = useState('quantitySold'); // 'quantitySold' | 'totalRevenue' | 'totalProfit'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const { data, isLoading } = useMedicinePerformanceReports({ period, startDate, endDate });

  const summary = data?.summary || {};
  const bestSelling = data?.bestSelling || [];
  const slowMoving = data?.slowMoving || [];
  const allMedicines = data?.allMedicines || [];

  const formatAmount = (num) => {
    return parseFloat(Number(num || 0).toFixed(2)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const displayedMedicines = useMemo(() => {
    let list = viewMode === 'best' ? bestSelling : viewMode === 'slow' ? slowMoving : allMedicines;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.medicineName.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      const valA = a[sortBy] ?? 0;
      const valB = b[sortBy] ?? 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [allMedicines, bestSelling, slowMoving, viewMode, search, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Performance Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Sold Units */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs transition-all select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Units Dispensed</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-transform group-hover:scale-110">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {isLoading ? '...' : summary.totalSoldUnits || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">Packs / Bottles</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dispensed across all sales</span>
        </div>

        {/* Revenue Generated */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs transition-all select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Revenue Generated</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {isLoading ? '...' : formatAmount(summary.totalRevenueGenerated)}
            </span>
            <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
            Gross sales revenue
          </span>
        </div>

        {/* Profit Generated */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl shadow-2xs transition-all select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Margin Generated</span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-800 dark:text-blue-200">
              {isLoading ? '...' : formatAmount(summary.totalProfitGenerated)}
            </span>
            <span className="text-xs font-bold text-slate-500">{currencySymbol}</span>
          </div>
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-1 block">
            Direct sales profit (Revenue - Cost)
          </span>
        </div>

        {/* Active Products Ratio */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl shadow-2xs transition-all select-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Turnover Ratio</span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.activeSellingMedicinesCount || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">/ {summary.totalCatalogMedicines || 0}</span>
          </div>
          <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold mt-1 block">
            {summary.totalCatalogMedicines > 0
              ? Math.round((summary.activeSellingMedicinesCount / summary.totalCatalogMedicines) * 100)
              : 0}
            % catalog turnover
          </span>
        </div>
      </div>

      {/* 2. Top Best-Sellers vs Slow-Moving Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Best Sellers */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                🏆 Top
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Top Performing Medicines
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('best')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              View all ({bestSelling.length})
            </button>
          </div>

          <div className="space-y-2">
            {bestSelling.slice(0, 5).map((med, i) => (
              <div
                key={med.medicineId}
                className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{med.medicineName}</span>
                    <span className="text-[11px] text-slate-400">Stock: {med.currentStock} units in hand</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                    {med.quantitySold} sold ({formatAmount(med.totalRevenue)} {currencySymbol})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Profit: +{formatAmount(med.totalProfit)} {currencySymbol} ({med.profitMargin}%)
                  </span>
                </div>
              </div>
            ))}
            {bestSelling.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">No sales recorded yet</div>
            )}
          </div>
        </div>

        {/* Slow-Moving Medicines */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs">
                🐢 Slow
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Slow-Moving Medicines
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('slow')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              View all ({slowMoving.length})
            </button>
          </div>

          <div className="space-y-2">
            {slowMoving.slice(0, 5).map((med, i) => (
              <div
                key={med.medicineId}
                className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">{med.medicineName}</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    {med.currentStock} units waiting in stock
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {med.quantitySold} sold
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Revenue: {formatAmount(med.totalRevenue)} {currencySymbol}
                  </span>
                </div>
              </div>
            ))}
            {slowMoving.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">All medicines are selling well!</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Complete Medicine Sales Performance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Medicines Sales & Margin Performance Table
            </h3>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'
                }`}
              >
                All ({allMedicines.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('best')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'best' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Best-Sellers ({bestSelling.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('slow')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'slow' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Slow-Moving ({slowMoving.length})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Medicine Name</th>
                <th className="py-2.5 px-4 text-center">In Stock</th>
                <th className="py-2.5 px-4 text-right">Cost Price ({currencySymbol})</th>
                <th className="py-2.5 px-4 text-right">Selling Price ({currencySymbol})</th>
                <th
                  onClick={() => toggleSort('quantitySold')}
                  className="py-2.5 px-4 text-center cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <span className="inline-flex items-center gap-1">
                    <span>Units Sold</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('totalRevenue')}
                  className="py-2.5 px-4 text-right cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200"
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <span>Revenue ({currencySymbol})</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  onClick={() => toggleSort('totalProfit')}
                  className="py-2.5 px-4 text-right cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 font-black"
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <span>Profit ({currencySymbol})</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-2.5 px-4 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No medicines match the criteria.
                  </td>
                </tr>
              ) : (
                displayedMedicines.map((m) => {
                  const hasSales = m.quantitySold > 0;
                  return (
                    <tr key={m.medicineId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {m.medicineName}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            m.currentStock === 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : m.currentStock <= 10
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {m.currentStock}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {formatAmount(m.purchasePrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatAmount(m.sellingPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100">
                        {m.quantitySold}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {formatAmount(m.totalRevenue)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-blue-700 dark:text-blue-400">
                        {formatAmount(m.totalProfit)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                        {hasSales ? `${m.profitMargin}%` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


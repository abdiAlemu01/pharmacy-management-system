import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  XCircle,
  Clock,
  Skull,
  FileQuestion,
  ChevronRight,
  Pill,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const StockAndExpiryAlerts = ({
  alerts = {},
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lowStock'); // 'lowStock' | 'outOfStock' | 'expiring' | 'discrepancies'

  const {
    lowStockList = [],
    lowStockCount = 0,
    outOfStockList = [],
    outOfStockCount = 0,
    expirySummary = {},
    expiringBatchesList = [],
    stockDiscrepancies = [],
  } = alerts;

  const totalExpired = expirySummary.expiredBatchesCount || 0;
  const totalExpiring30 = expirySummary.expiring30DaysCount || 0;
  const totalExpiring60 = expirySummary.expiring60DaysCount || 0;
  const totalExpiring90 = expirySummary.expiring90DaysCount || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Medicine Stock & Expiry Alerts
            </h3>
            <p className="text-xs text-slate-400">
              Real-time inventory safeguards & batch tracking
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('lowStock')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'lowStock'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Low Stock</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outOfStock')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'outOfStock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Out of Stock</span>
            {outOfStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {outOfStockCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expiring')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'expiring'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Expiry Alerts</span>
            {(totalExpiring30 + totalExpired) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {totalExpiring30 + totalExpired}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discrepancies')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'discrepancies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Discrepancies</span>
            {stockDiscrepancies.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                {stockDiscrepancies.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Low Stock Items */}
      {activeTab === 'lowStock' && (
        <div className="space-y-2.5">
          {lowStockList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              All medicines are adequately stocked above reorder thresholds! ✨
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {lowStockList.slice(0, 6).map((med) => (
                <div
                  key={med.id}
                  className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {med.name}
                      </h5>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold block">
                        {med.quantity} left &bull; Min {med.reorderLevel}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/purchases')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Inventory Warnings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Out of Stock Items */}
      {activeTab === 'outOfStock' && (
        <div className="space-y-2.5">
          {outOfStockList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              Zero stock-outs! No medicine is completely out of stock.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {outOfStockList.slice(0, 6).map((med) => (
                <div
                  key={med.id}
                  className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {med.name}
                      </h5>
                      <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold block">
                        0 Units Available
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/purchases')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Expiry Tracking (30d, 60d, 90d & Expired) */}
      {activeTab === 'expiring' && (
        <div className="space-y-3">
          {/* Expiry Breakdown Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-600 uppercase block">Already Expired</span>
              <span className="text-base font-black text-rose-700 dark:text-rose-300">{totalExpired} batches</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-600 uppercase block">Expiring ≤ 30 Days</span>
              <span className="text-base font-black text-amber-700 dark:text-amber-300">{totalExpiring30} batches</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
              <span className="text-[10px] font-bold text-purple-600 uppercase block">31 - 60 Days</span>
              <span className="text-base font-black text-purple-700 dark:text-purple-300">{totalExpiring60} batches</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-600 uppercase block">61 - 90 Days</span>
              <span className="text-base font-black text-blue-700 dark:text-blue-300">{totalExpiring90} batches</span>
            </div>
          </div>

          {/* List of Near-Expiry Batches */}
          <div className="space-y-1.5">
            {expiringBatchesList.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No batches nearing expiration.</p>
            ) : (
              expiringBatchesList.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">{b.medicineName}</strong>
                      <span className="text-[11px] text-slate-400 ml-1.5">Batch #{b.batchNo} ({b.quantity} units)</span>
                    </div>
                  </div>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      b.daysToExpiry < 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                        : b.daysToExpiry <= 30
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700'
                    }`}
                  >
                    {b.daysToExpiry < 0 ? 'EXPIRED' : `${b.daysToExpiry} days left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Stock Discrepancies */}
      {activeTab === 'discrepancies' && (
        <div className="space-y-2">
          {stockDiscrepancies.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              Zero physical inventory discrepancies logged! Audit records match system counts.
            </div>
          ) : (
            <div className="space-y-1.5">
              {stockDiscrepancies.slice(0, 5).map((disc) => (
                <div
                  key={disc.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100">{disc.medicineName}</strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      System: {disc.previousQuantity} &rarr; Physical count: {disc.countedQuantity} ({disc.reason})
                    </span>
                  </div>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[10px] ${
                      disc.difference < 0
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                    }`}
                  >
                    {disc.difference > 0 ? `+${disc.difference}` : disc.difference} Units
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


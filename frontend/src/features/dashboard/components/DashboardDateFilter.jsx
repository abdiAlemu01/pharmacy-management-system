import React from 'react';
import { Calendar, RefreshCw, Filter } from 'lucide-react';

export const DashboardDateFilter = ({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onDateChange,
  onRefresh,
  isLoading,
}) => {
  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Last 7 Days' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Timeframe:</span>
          </span>
          {presets.map((p) => {
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodChange(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs active:scale-95'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Custom Range Picker */}
      {period === 'custom' && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-600 dark:text-slate-400">From:</span>
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onDateChange({ startDate: e.target.value, endDate })}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">To:</span>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onDateChange({ startDate, endDate: e.target.value })}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <span className="text-[11px] text-slate-400 italic">
            Select start and end dates to filter metrics and top medicines.
          </span>
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { Calendar, Filter, RotateCcw, ArrowRight } from 'lucide-react';
import { useAppDate } from '@/shared/lib/date-utils';

export const ReportPeriodSelector = ({
  period = 'month',
  onPeriodChange,
  startDate = '',
  endDate = '',
  onDateChange,
  onReset,
}) => {
  const { formatDate, calendarType } = useAppDate();

  const presets = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            {presets.map((p) => {
              const isActive = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons (Refresh) */}
        <div className="flex items-center gap-2 shrink-0">
          {(startDate || endDate || period !== 'month') && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Reset to default (This Month)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Picker bar (shown whenever 'custom' is selected or dates are manually entered) */}
      {(period === 'custom' || startDate || endDate) && (
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Date Range:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                title={`From Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                title={`To Date (${calendarType === 'ethiopian' ? 'E.C.' : 'G.C.'})`}
              />
            </div>
          </div>

          {/* Active Calendar Live Preview Badge */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              <span>{startDate ? formatDate(startDate, { showMonthName: true }) : 'Beginning'}</span>
              <ArrowRight className="w-3 h-3 text-emerald-500" />
              <span>{endDate ? formatDate(endDate, { showMonthName: true }) : 'Today'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


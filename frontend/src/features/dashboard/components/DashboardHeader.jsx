import React, { useState } from 'react';
import {
  Calendar,
  RefreshCw,
} from 'lucide-react';

export const DashboardHeader = ({
  user,
  period = '7d',
  onPeriodChange,
  startDate = '',
  endDate = '',
  onCustomDateChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(period === 'custom');
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePresetClick = (p) => {
    if (p === 'custom') {
      setShowCustomPicker(true);
      onPeriodChange('custom');
    } else {
      setShowCustomPicker(false);
      onPeriodChange(p);
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (localStart && localEnd) {
      onCustomDateChange(localStart, localEnd);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Top Row: Welcome Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {getGreeting()}, {user?.firstName || user?.name || 'Staff'}! 👋
          </h1>
        </div>

        {/* Action Controls & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Preset Buttons */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'custom', label: 'Custom' },
            ].map((tab) => {
              const isActive = period === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePresetClick(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard metrics"
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker (Shown when 'custom' is active) */}
      {(showCustomPicker || period === 'custom') && (
        <form
          onSubmit={handleApplyCustom}
          className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Select Custom Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Apply Analysis
          </button>
        </form>
      )}
    </div>
  );
};


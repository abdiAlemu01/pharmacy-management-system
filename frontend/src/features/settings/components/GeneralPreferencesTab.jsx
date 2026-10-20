import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Coins,
  Calendar,
  Globe,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Monitor,
} from 'lucide-react';
import { useUpdateGeneralPreferences } from '../hooks/use-settings';
import { useTheme } from '@/shared/hooks/use-theme';

export const GeneralPreferencesTab = ({ settings, isLoading }) => {
  const { theme, setTheme } = useTheme();

  const [preferences, setPreferences] = useState({
    currency: 'ETB',
    currencySymbol: 'Br',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Addis_Ababa',
    theme: 'light',
    defaultDashboardDateRange: 'month',
    tableRowsPerPage: 10,
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateGeneralPreferences();

  useEffect(() => {
    if (settings) {
      setPreferences({
        currency: settings.currency || 'ETB',
        currencySymbol: settings.currencySymbol || 'Br',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        timeZone: settings.timeZone || 'Africa/Addis_Ababa',
        theme: settings.theme || theme || 'light',
        defaultDashboardDateRange: settings.defaultDashboardDateRange || 'month',
        tableRowsPerPage: settings.tableRowsPerPage || 10,
      });
    }
  }, [settings, theme]);

  const handleChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleThemeSelect = (selectedTheme) => {
    handleChange('theme', selectedTheme);
    setTheme(selectedTheme);
  };

  // Preview formatted date
  const getFormattedDatePreview = (format) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    if (format === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    updateMutation.mutate(
      {
        ...preferences,
        tableRowsPerPage: parseInt(preferences.tableRowsPerPage, 10) || 10,
      },
      {
        onSuccess: () => {
          setSuccessMsg('General preferences saved successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || 'Failed to save general preferences');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-8">
        {/* Section Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">General Preferences</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize currency, date presentation, appearance theme, and default table views.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Light / Dark Mode Appearance */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            System Appearance Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Card */}
            <div
              onClick={() => handleThemeSelect('light')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                preferences.theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  preferences.theme === 'light'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  Light Theme
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Crisp daylight appearance with high contrast
                </span>
              </div>
              {preferences.theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Dark Mode Card */}
            <div
              onClick={() => handleThemeSelect('dark')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                preferences.theme === 'dark'
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  preferences.theme === 'dark'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  Dark Theme
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Low-light night shift mode for reduced eye strain
                </span>
              </div>
              {preferences.theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Currency: Ethiopian Birr (ETB) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Primary Currency
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  Ethiopian Birr (ETB)
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Official currency code: ETB • Symbol: Br
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                  Price Display Preview
                </span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  1,450.00 {preferences.currency}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                (1,450.00 {preferences.currencySymbol})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Date Format & Time Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Date format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Date Format
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferences.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Standard in Ethiopia)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Today's Preview: <span className="font-bold text-slate-600 dark:text-slate-300">{getFormattedDatePreview(preferences.dateFormat)}</span>
            </p>
          </div>

          {/* Time zone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Time Zone
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferences.timeZone}
                onChange={(e) => handleChange('timeZone', e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT, UTC+3)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                <option value="Africa/Cairo">Africa/Cairo (EEST, UTC+2)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Ensures sales timestamps, receipts, and order dates align with local Ethiopian time.
            </p>
          </div>
        </div>

        {/* 4. Default Dashboard Range & Table Rows Per Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default dashboard range */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Dashboard Date Range
            </label>
            <div className="relative">
              <LayoutGrid className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferences.defaultDashboardDateRange}
                onChange={(e) => handleChange('defaultDashboardDateRange', e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value="today">Today (Live Shifts)</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Current Month (Recommended)</option>
                <option value="year">Current Financial Year</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Determines the starting metrics loaded when opening the main Dashboard.
            </p>
          </div>

          {/* Table rows per page */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Table Rows Per Page
            </label>
            <div className="relative">
              <ListFilter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={preferences.tableRowsPerPage}
                onChange={(e) => handleChange('tableRowsPerPage', e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500/80 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              >
                <option value={10}>10 rows per page (Compact)</option>
                <option value={20}>20 rows per page (Balanced)</option>
                <option value={50}>50 rows per page (Detailed)</option>
                <option value={100}>100 rows per page (Maximum)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400">
              Default pagination size for Medicines, Purchases, Inventory, and Sales tables.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save General Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};


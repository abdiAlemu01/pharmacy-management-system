import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  AlertTriangle,
  CalendarClock,
  Skull,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useUpdateNotifications } from '../hooks/use-settings';
import { useAppDate } from '@/shared/lib/date-utils';

export const NotificationsAlertsTab = ({ settings, alertMetrics, isLoading }) => {
  const { t } = useTranslation();
  const { formatDate } = useAppDate();
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [preferences, setPreferences] = useState({
    lowStockAlerts: true,
    lowStockThreshold: 10,
    nearingExpiryAlerts: true,
    expiryThresholdDays: 90,
    expiredAlerts: true,
    supplierPaymentDueReminders: true,
    pendingPurchaseAlerts: true,
    inAppNotifications: true,
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateNotifications();

  useEffect(() => {
    if (settings) {
      setPreferences({
        lowStockAlerts: settings.lowStockAlerts ?? true,
        lowStockThreshold: settings.lowStockThreshold ?? 10,
        nearingExpiryAlerts: settings.nearingExpiryAlerts ?? true,
        expiryThresholdDays: settings.expiryThresholdDays ?? 90,
        expiredAlerts: settings.expiredAlerts ?? true,
        supplierPaymentDueReminders: settings.supplierPaymentDueReminders ?? true,
        pendingPurchaseAlerts: settings.pendingPurchaseAlerts ?? true,
        inAppNotifications: settings.inAppNotifications ?? true,
      });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleNumberChange = (key, val) => {
    setSuccessMsg('');
    setErrorMsg('');
    if (val === '') {
      setPreferences((prev) => ({ ...prev, [key]: '' }));
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setPreferences((prev) => ({ ...prev, [key]: num }));
    }
  };

  const handleNumberBlur = (key, defaultMin = 1) => {
    setPreferences((prev) => {
      const current = prev[key];
      if (current === '' || current === null || isNaN(current) || Number(current) < defaultMin) {
        return { ...prev, [key]: defaultMin };
      }
      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      ...preferences,
      lowStockThreshold: Math.max(1, parseInt(preferences.lowStockThreshold, 10) || 10),
      expiryThresholdDays: Math.max(1, parseInt(preferences.expiryThresholdDays, 10) || 90),
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setPreferences(payload);
        setSuccessMsg(t('settings.notifications.successMsg'));
        setTimeout(() => setSuccessMsg(''), 4000);
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to save alert preferences');
      },
    });
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

      {/* Live Alert Metrics Summary Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('settings.notifications.overview')}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Low stock badge */}
          <button
            type="button"
            onClick={() => setSelectedMetric(selectedMetric === 'lowStock' ? null : 'lowStock')}
            className={`p-3.5 bg-amber-50 dark:bg-amber-950/30 border rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer ${
              selectedMetric === 'lowStock'
                ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-amber-200 dark:border-amber-900/60 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                {t('settings.notifications.lowStock')}
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
              {alertMetrics?.lowStockCount ?? 0}
            </span>
          </button>

          {/* Nearing expiry badge */}
          <button
            type="button"
            onClick={() => setSelectedMetric(selectedMetric === 'nearingExpiry' ? null : 'nearingExpiry')}
            className={`p-3.5 bg-blue-50 dark:bg-blue-950/30 border rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer ${
              selectedMetric === 'nearingExpiry'
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-blue-200 dark:border-blue-900/60 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">
                {t('settings.notifications.nearingExpiry')}
              </span>
              <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
              {alertMetrics?.nearingExpiryCount ?? 0}
            </span>
          </button>

          {/* Expired medicines badge */}
          <button
            type="button"
            onClick={() => setSelectedMetric(selectedMetric === 'expired' ? null : 'expired')}
            className={`p-3.5 bg-rose-50 dark:bg-rose-950/30 border rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer ${
              selectedMetric === 'expired'
                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                : 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                {t('settings.notifications.expired')}
              </span>
              <Skull className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-2xl font-extrabold text-rose-900 dark:text-rose-100 mt-1">
              {alertMetrics?.expiredCount ?? 0}
            </span>
          </button>

          {/* Supplier payment due badge */}
          <button
            type="button"
            onClick={() => setSelectedMetric(selectedMetric === 'paymentDue' ? null : 'paymentDue')}
            className={`p-3.5 bg-purple-50 dark:bg-purple-950/30 border rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer ${
              selectedMetric === 'paymentDue'
                ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                : 'border-purple-200 dark:border-purple-900/60 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">
                {t('settings.notifications.paymentDue')}
              </span>
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-2xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
              {alertMetrics?.paymentDueCount ?? 0}
            </span>
          </button>

          {/* Pending purchases badge */}
          <button
            type="button"
            onClick={() => setSelectedMetric(selectedMetric === 'pendingPo' ? null : 'pendingPo')}
            className={`p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              selectedMetric === 'pendingPo'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                {t('settings.notifications.pendingPo')}
              </span>
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
              {alertMetrics?.pendingPoCount ?? 0}
            </span>
          </button>
        </div>

        {/* Live Database Items Breakdown Panel */}
        {selectedMetric && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {selectedMetric === 'lowStock' && `Live Low-Stock Medicines (${alertMetrics?.lowStockCount ?? 0})`}
                {selectedMetric === 'nearingExpiry' && `Live Medicines Nearing Expiry (${alertMetrics?.nearingExpiryCount ?? 0})`}
                {selectedMetric === 'expired' && `Live Expired Batches (${alertMetrics?.expiredCount ?? 0})`}
                {selectedMetric === 'paymentDue' && `Live Supplier Payments Due (${alertMetrics?.paymentDueCount ?? 0})`}
                {selectedMetric === 'pendingPo' && `Live Pending Purchase Orders (${alertMetrics?.pendingPoCount ?? 0})`}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedMetric(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Low stock items table */}
            {selectedMetric === 'lowStock' && (
              alertMetrics?.lowStockItems?.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3 text-center">Current Stock</th>
                        <th className="py-2.5 px-3 text-center">Safety Threshold</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {alertMetrics.lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                          <td className="py-2 px-3 text-center font-extrabold text-amber-700 dark:text-amber-400">{item.quantity} units</td>
                          <td className="py-2 px-3 text-center text-slate-500">{preferences.lowStockThreshold} units</td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              LOW STOCK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  All medicines are well-stocked above the threshold of {preferences.lowStockThreshold} units.
                </div>
              )
            )}

            {/* Nearing expiry items table */}
            {selectedMetric === 'nearingExpiry' && (
              alertMetrics?.nearingExpiryItems?.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Batch No</th>
                        <th className="py-2.5 px-3 text-center">Remaining Stock</th>
                        <th className="py-2.5 px-3 text-right">Expiration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {alertMetrics.nearingExpiryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.medicineName}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{item.batchNo}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700 dark:text-slate-300">{item.quantity} units</td>
                          <td className="py-2 px-3 text-right font-semibold text-blue-700 dark:text-blue-400">
                            {formatDate(item.expiryDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  No medicine batches are nearing expiration within {preferences.expiryThresholdDays} days.
                </div>
              )
            )}

            {/* Expired items table */}
            {selectedMetric === 'expired' && (
              alertMetrics?.expiredItems?.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Batch No</th>
                        <th className="py-2.5 px-3 text-center">Stock To Remove</th>
                        <th className="py-2.5 px-3 text-right">Expired Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {alertMetrics.expiredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.medicineName}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{item.batchNo}</td>
                          <td className="py-2 px-3 text-center font-bold text-rose-700 dark:text-rose-400">{item.quantity} units</td>
                          <td className="py-2 px-3 text-right font-semibold text-rose-700 dark:text-rose-400">
                            {formatDate(item.expiryDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  No expired medicine batches found in stock.
                </div>
              )
            )}

            {/* Supplier payment due items table */}
            {selectedMetric === 'paymentDue' && (
              alertMetrics?.paymentDueItems?.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3 text-right">Amount Due</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {alertMetrics.paymentDueItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.medicineName || '—'}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{item.supplierName || '—'}</td>
                          <td className="py-2 px-3 text-right font-bold text-rose-700 dark:text-rose-400">{parseFloat(item.amountDue || 0).toLocaleString()} Birr</td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              {item.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  All supplier purchase orders are fully settled.
                </div>
              )
            )}

            {/* Pending POs table */}
            {selectedMetric === 'pendingPo' && (
              alertMetrics?.pendingPoItems?.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {alertMetrics.pendingPoItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{item.medicineName || '—'}</td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{item.supplierName || '—'}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">{parseFloat(item.totalCost || 0).toLocaleString()} Birr</td>
                          <td className="py-2 px-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  No pending purchase orders awaiting delivery.
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Alert Rules & Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('settings.notifications.rulesTitle')}
              </h2>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* 1. Low-Stock Alerts */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-xl mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.lowStockTitle')}
                </h4>
                {preferences.lowStockAlerts && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t('settings.notifications.alertThreshold')}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="10"
                      value={preferences.lowStockThreshold}
                      onChange={(e) => handleNumberChange('lowStockThreshold', e.target.value)}
                      onBlur={() => handleNumberBlur('lowStockThreshold', 1)}
                      className="w-20 px-2.5 py-1 text-xs font-extrabold text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors placeholder:text-slate-400"
                    />
                    <span className="text-xs text-slate-500">
                      {t('settings.notifications.units')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('lowStockAlerts')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.lowStockAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.lowStockAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Medicines Nearing Expiry */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl mt-0.5 shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.nearingExpiryTitle')}
                </h4>
                {preferences.nearingExpiryAlerts && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {t('settings.notifications.alertAheadBy')}
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="90"
                      value={preferences.expiryThresholdDays}
                      onChange={(e) => handleNumberChange('expiryThresholdDays', e.target.value)}
                      onBlur={() => handleNumberBlur('expiryThresholdDays', 1)}
                      className="w-20 px-2.5 py-1 text-xs font-extrabold text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition-colors placeholder:text-slate-400"
                    />
                    <span className="text-xs text-slate-500">
                      {t('settings.notifications.daysBeforeExpiry')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('nearingExpiryAlerts')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.nearingExpiryAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.nearingExpiryAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Expired Medicine Alerts */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl mt-0.5 shrink-0">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.expiredTitle')}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('expiredAlerts')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.expiredAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.expiredAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Supplier Payment Due Reminders */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-xl mt-0.5 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.paymentDueTitle')}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('supplierPaymentDueReminders')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.supplierPaymentDueReminders ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.supplierPaymentDueReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Pending Purchase Order Alerts */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl mt-0.5 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.pendingPoTitle')}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('pendingPurchaseAlerts')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.pendingPurchaseAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.pendingPurchaseAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
                <span>{t('settings.notifications.savingAlertsBtn')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('settings.notifications.saveAlertsBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};


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
  ArrowUpRight,
} from 'lucide-react';
import { useUpdateNotifications } from '../hooks/use-settings';
import { useAppDate } from '@/shared/lib/date-utils';
import { AlertCardContentModal } from './AlertCardContentModal';

export const NotificationsAlertsTab = ({ settings, alertMetrics, isLoading }) => {
  const { t } = useTranslation();
  const { formatDate } = useAppDate();
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedCardModal, setSelectedCardModal] = useState({
    isOpen: false,
    alertType: null,
  });
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
    const nextVal = !preferences[key];
    const newPreferences = { ...preferences, [key]: nextVal };
    setPreferences(newPreferences);
    setSuccessMsg('');
    setErrorMsg('');

    // If disabling this alert category, automatically close its live table breakdown
    if (!nextVal) {
      if (key === 'lowStockAlerts' && selectedMetric === 'lowStock') setSelectedMetric(null);
      if (key === 'nearingExpiryAlerts' && selectedMetric === 'nearingExpiry') setSelectedMetric(null);
      if (key === 'expiredAlerts' && selectedMetric === 'expired') setSelectedMetric(null);
      if (key === 'supplierPaymentDueReminders' && selectedMetric === 'paymentDue') setSelectedMetric(null);
      if (key === 'pendingPurchaseAlerts' && selectedMetric === 'pendingPo') setSelectedMetric(null);
    }

    const payload = {
      ...newPreferences,
      lowStockThreshold: Math.max(1, parseInt(newPreferences.lowStockThreshold, 10) || 10),
      expiryThresholdDays: Math.max(1, parseInt(newPreferences.expiryThresholdDays, 10) || 90),
    };

    // Auto-persist toggle preference immediately
    updateMutation.mutate(payload, {
      onError: (err) => {
        // Rollback state if server update failed
        setPreferences((prev) => ({ ...prev, [key]: !nextVal }));
        setErrorMsg(err.response?.data?.message || 'Failed to update alert preference');
      },
    });
  };

  const handleOpenCardModal = (metricKey) => {
    setSelectedMetric(metricKey);
    setSelectedCardModal({
      isOpen: true,
      alertType: metricKey,
    });
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('settings.notifications.overview', 'Live Alert Metrics Overview')}
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Low stock badge */}
          <button
            type="button"
            disabled={!preferences.lowStockAlerts}
            onClick={() => preferences.lowStockAlerts && handleOpenCardModal('lowStock')}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
              !preferences.lowStockAlerts
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                : selectedMetric === 'lowStock'
                ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-500/20 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
                : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                {selectedMetric === 'lowStock' ? (
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : preferences.lowStockAlerts ? (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OFF</span>
                )}
              </div>

              <div className="mt-2.5">
                <span className={`text-2xl font-extrabold block ${!preferences.lowStockAlerts ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {preferences.lowStockAlerts ? (alertMetrics?.lowStockCount ?? 0) : 0}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                  {t('settings.notifications.lowStock')}
                </span>
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] w-full">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {selectedMetric === 'lowStock' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Open</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </button>

          {/* Nearing expiry badge */}
          <button
            type="button"
            disabled={!preferences.nearingExpiryAlerts}
            onClick={() => preferences.nearingExpiryAlerts && handleOpenCardModal('nearingExpiry')}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
              !preferences.nearingExpiryAlerts
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                : selectedMetric === 'nearingExpiry'
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs ring-1 ring-blue-500/20 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                {selectedMetric === 'nearingExpiry' ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : preferences.nearingExpiryAlerts ? (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OFF</span>
                )}
              </div>

              <div className="mt-2.5">
                <span className={`text-2xl font-extrabold block ${!preferences.nearingExpiryAlerts ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {preferences.nearingExpiryAlerts ? (alertMetrics?.nearingExpiryCount ?? 0) : 0}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                  {t('settings.notifications.nearingExpiry')}
                </span>
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] w-full">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {selectedMetric === 'nearingExpiry' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Open</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </button>

          {/* Expired medicines badge */}
          <button
            type="button"
            disabled={!preferences.expiredAlerts}
            onClick={() => preferences.expiredAlerts && handleOpenCardModal('expired')}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-rose-500/30 ${
              !preferences.expiredAlerts
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                : selectedMetric === 'expired'
                ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 shadow-xs ring-1 ring-rose-500/20 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
                : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
                  <Skull className="w-4 h-4" />
                </div>
                {selectedMetric === 'expired' ? (
                  <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : preferences.expiredAlerts ? (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OFF</span>
                )}
              </div>

              <div className="mt-2.5">
                <span className={`text-2xl font-extrabold block ${!preferences.expiredAlerts ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {preferences.expiredAlerts ? (alertMetrics?.expiredCount ?? 0) : 0}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                  {t('settings.notifications.expired')}
                </span>
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] w-full">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {selectedMetric === 'expired' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Open</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </button>

          {/* Supplier payment due badge */}
          <button
            type="button"
            disabled={!preferences.supplierPaymentDueReminders}
            onClick={() => preferences.supplierPaymentDueReminders && handleOpenCardModal('paymentDue')}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
              !preferences.supplierPaymentDueReminders
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                : selectedMetric === 'paymentDue'
                ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 shadow-xs ring-1 ring-purple-500/20 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
                : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                {selectedMetric === 'paymentDue' ? (
                  <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : preferences.supplierPaymentDueReminders ? (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OFF</span>
                )}
              </div>

              <div className="mt-2.5">
                <span className={`text-2xl font-extrabold block ${!preferences.supplierPaymentDueReminders ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {preferences.supplierPaymentDueReminders ? (alertMetrics?.paymentDueCount ?? 0) : 0}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                  {t('settings.notifications.paymentDue')}
                </span>
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] w-full">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {selectedMetric === 'paymentDue' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Open</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </button>

          {/* Pending purchases badge */}
          <button
            type="button"
            disabled={!preferences.pendingPurchaseAlerts}
            onClick={() => preferences.pendingPurchaseAlerts && handleOpenCardModal('pendingPo')}
            className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
              !preferences.pendingPurchaseAlerts
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-60 cursor-not-allowed'
                : selectedMetric === 'pendingPo'
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20 cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer group hover:scale-[1.02] hover:shadow-md active:scale-[0.99] select-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                {selectedMetric === 'pendingPo' ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : preferences.pendingPurchaseAlerts ? (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">OFF</span>
                )}
              </div>

              <div className="mt-2.5">
                <span className={`text-2xl font-extrabold block ${!preferences.pendingPurchaseAlerts ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {preferences.pendingPurchaseAlerts ? (alertMetrics?.pendingPoCount ?? 0) : 0}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mt-0.5">
                  {t('settings.notifications.pendingPo')}
                </span>
              </div>
            </div>

            {/* Clickable Action Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] w-full">
              <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>View content</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>

              {selectedMetric === 'pendingPo' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Open</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to open
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Live Database Items Breakdown Panel */}
        {selectedMetric && (
          ((selectedMetric === 'lowStock' && preferences.lowStockAlerts) ||
           (selectedMetric === 'nearingExpiry' && preferences.nearingExpiryAlerts) ||
           (selectedMetric === 'expired' && preferences.expiredAlerts) ||
           (selectedMetric === 'paymentDue' && preferences.supplierPaymentDueReminders) ||
           (selectedMetric === 'pendingPo' && preferences.pendingPurchaseAlerts)) && (
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
        ))}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* 1. Low-Stock Alerts Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
              preferences.lowStockAlerts
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.lowStockTitle')}
                </h4>
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

            {preferences.lowStockAlerts && (
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.notifications.alertThreshold')}
                </span>
                <div className="flex items-center gap-1.5">
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
              </div>
            )}
          </div>

          {/* 2. Medicines Nearing Expiry Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
              preferences.nearingExpiryAlerts
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.nearingExpiryTitle')}
                </h4>
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

            {preferences.nearingExpiryAlerts && (
              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.notifications.alertAheadBy')}
                </span>
                <div className="flex items-center gap-1.5">
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
              </div>
            )}
          </div>

          {/* 3. Expired Medicine Alerts Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
              preferences.expiredAlerts
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
                  <Skull className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.expiredTitle')}
                </h4>
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
          </div>

          {/* 4. Supplier Payment Due Reminders Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
              preferences.supplierPaymentDueReminders
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.paymentDueTitle')}
                </h4>
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
          </div>

          {/* 5. Pending Purchase Order Alerts Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 md:col-span-2 ${
              preferences.pendingPurchaseAlerts
                ? 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t('settings.notifications.pendingPoTitle')}
                </h4>
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

      {/* Alert Card Content Modal */}
      <AlertCardContentModal
        isOpen={selectedCardModal.isOpen}
        alertType={selectedCardModal.alertType}
        alertMetrics={alertMetrics}
        thresholds={{
          lowStockThreshold: preferences.lowStockThreshold,
          expiryThresholdDays: preferences.expiryThresholdDays,
        }}
        onClose={() => setSelectedCardModal({ isOpen: false, alertType: null })}
      />
    </form>
  );
};


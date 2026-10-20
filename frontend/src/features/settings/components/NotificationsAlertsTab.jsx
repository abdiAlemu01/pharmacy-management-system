import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CalendarClock,
  Skull,
  CreditCard,
  ShoppingBag,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
} from 'lucide-react';
import { useUpdateNotifications } from '../hooks/use-settings';

export const NotificationsAlertsTab = ({ settings, alertMetrics, isLoading }) => {
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

  const [soundEnabled, setSoundEnabled] = useState(true);
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
      const savedSound = localStorage.getItem('pharmacy_alert_sound');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
    }
  }, [settings]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleNumberChange = (key, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setPreferences((prev) => ({ ...prev, [key]: num }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    localStorage.setItem('pharmacy_alert_sound', String(soundEnabled));

    updateMutation.mutate(preferences, {
      onSuccess: () => {
        setSuccessMsg('Notification and alert preferences saved successfully.');
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
              Live System Alerts Overview
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Real-time counts based on active inventory & purchases
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Low stock badge */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Low Stock</span>
            <span className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
              {alertMetrics?.lowStockCount ?? 0}
            </span>
          </div>

          {/* Nearing expiry badge */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Nearing Expiry</span>
            <span className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
              {alertMetrics?.nearingExpiryCount ?? 0}
            </span>
          </div>

          {/* Expired medicines badge */}
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">Expired Items</span>
            <span className="text-xl font-extrabold text-rose-900 dark:text-rose-100 mt-1">
              {alertMetrics?.expiredCount ?? 0}
            </span>
          </div>

          {/* Supplier payment due badge */}
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Payment Due</span>
            <span className="text-xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
              {alertMetrics?.paymentDueCount ?? 0}
            </span>
          </div>

          {/* Pending purchases badge */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Pending Orders</span>
            <span className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
              {alertMetrics?.pendingPoCount ?? 0}
            </span>
          </div>
        </div>
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
                Notifications & Alert Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure when and how the system triggers warnings and notifies you of required actions.
              </p>
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
                  Low-Stock Alerts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Warns when available medicine stock drops to or below the minimum safety threshold.
                </p>
                {preferences.lowStockAlerts && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Alert threshold:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={preferences.lowStockThreshold}
                      onChange={(e) => handleNumberChange('lowStockThreshold', e.target.value)}
                      className="w-20 px-2.5 py-1 text-xs font-extrabold text-center bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">units</span>
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
                  Medicines Nearing Expiry
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proactively flags medicine batches approaching their expiration date for priority dispensing or return.
                </p>
                {preferences.nearingExpiryAlerts && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Alert ahead by:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={preferences.expiryThresholdDays}
                      onChange={(e) => handleNumberChange('expiryThresholdDays', e.target.value)}
                      className="w-20 px-2.5 py-1 text-xs font-extrabold text-center bg-white dark:bg-slate-800 border border-emerald-400 dark:border-emerald-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-500">days before expiry</span>
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
                  Expired Medicine Alerts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Immediately blocks dispensing and flags batches that have passed expiration to enforce regulatory compliance.
                </p>
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
                  Supplier Payment Due Reminders
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sends reminders for outstanding credit invoices and unpaid purchase orders to keep good supplier relations.
                </p>
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
                  Pending Purchase Order Alerts
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitors active purchase orders in ORDERED or PENDING state to remind staff to follow up on deliveries.
                </p>
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

          {/* 6. In-App Notification Preferences */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl mt-0.5 shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  In-App Notification Banners & Badges
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Display visual popup badges and top banner messages inside the application interface.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('inAppNotifications')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.inAppNotifications ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.inAppNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 7. Sound / Chime Alert Toggle */}
          <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-xl">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl mt-0.5 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Audio Alert Chime
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Plays a subtle chime when high-priority stock or expiry alerts occur.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
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
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Alert Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};


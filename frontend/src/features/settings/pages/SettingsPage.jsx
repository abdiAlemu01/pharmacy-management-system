import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  Bell,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { useSettings, useUpdateGeneralPreferences, SETTINGS_QUERY_KEY } from '../hooks/use-settings';
import { PharmacyInfoTab } from '../components/PharmacyInfoTab';
import { AccountSecurityTab } from '../components/AccountSecurityTab';
import { NotificationsAlertsTab } from '../components/NotificationsAlertsTab';
import { GeneralPreferencesTab } from '../components/GeneralPreferencesTab';
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('pharmacy');
  const { data, isLoading, error } = useSettings();
  const queryClient = useQueryClient();
  const updatePrefsMutation = useUpdateGeneralPreferences();

  const handleQuickLanguageChange = (langCode) => {
    const code = (langCode || 'en').slice(0, 2);
    i18n.changeLanguage(code);
    localStorage.setItem('pharmacy_language', code);

    // Optimistically update React Query cache so all tabs reflect new language immediately
    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          language: code,
        },
      };
    });

    // Persist to backend database
    updatePrefsMutation.mutate({ language: code });
  };

  const settings = data?.settings;
  const user = data?.user;
  const alertMetrics = data?.alertMetrics;

  const totalActiveAlerts =
    (settings?.lowStockAlerts !== false ? (alertMetrics?.lowStockCount || 0) : 0) +
    (settings?.nearingExpiryAlerts !== false ? (alertMetrics?.nearingExpiryCount || 0) : 0) +
    (settings?.expiredAlerts !== false ? (alertMetrics?.expiredCount || 0) : 0) +
    (settings?.supplierPaymentDueReminders !== false ? (alertMetrics?.paymentDueCount || 0) : 0) +
    (settings?.pendingPurchaseAlerts !== false ? (alertMetrics?.pendingPoCount || 0) : 0);

  const tabs = [
    {
      id: 'pharmacy',
      label: t('settings.tabs.pharmacy', 'Pharmacy Information'),
      shortLabel: 'Pharmacy',
      icon: Building2,
      description: '',
    },
    {
      id: 'security',
      label: t('settings.tabs.security', 'Account & Security'),
      shortLabel: 'Security',
      icon: ShieldCheck,
      description: '',
    },
    {
      id: 'notifications',
      label: t('settings.tabs.notifications', 'Notifications & Alerts'),
      shortLabel: 'Alerts',
      icon: Bell,
      description: '',
    },
    {
      id: 'preferences',
      label: t('settings.tabs.preferences', 'General Preferences'),
      shortLabel: 'Preferences',
      icon: Palette,
      description: '',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xs">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-sm sm:text-lg md:text-xl font-bold sm:font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            {t('settings.title', 'System & Pharmacy Settings')}
          </h1>
        </div>
      </div>

      {/* Error state if API fails */}
      {error && (
        <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
          <span>Failed to load settings. Please verify the backend connection and try again.</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-slate-100/70 dark:bg-slate-800/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center sm:items-start p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer text-center sm:text-left relative ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-400 dark:border-emerald-500/80 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mb-1 sm:mb-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {/* Short label on mobile, full label on sm+ */}
              <span className="text-[10px] sm:text-xs font-bold leading-tight sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:block text-xs font-bold leading-tight truncate">{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1 right-1 px-1 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white shrink-0">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="mt-4 sm:mt-6">
        {activeTab === 'pharmacy' && (
          <PharmacyInfoTab settings={settings} user={user} isLoading={isLoading} />
        )}

        {activeTab === 'security' && (
          <AccountSecurityTab user={user} settings={settings} isLoading={isLoading} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsAlertsTab
            settings={settings}
            alertMetrics={alertMetrics}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'preferences' && (
          <GeneralPreferencesTab settings={settings} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};


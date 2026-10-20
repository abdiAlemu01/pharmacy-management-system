import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  ShieldCheck,
  Bell,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useSettings } from '../hooks/use-settings';
import { PharmacyInfoTab } from '../components/PharmacyInfoTab';
import { AccountSecurityTab } from '../components/AccountSecurityTab';
import { NotificationsAlertsTab } from '../components/NotificationsAlertsTab';
import { GeneralPreferencesTab } from '../components/GeneralPreferencesTab';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('pharmacy');
  const { data, isLoading, error } = useSettings();

  const settings = data?.settings;
  const user = data?.user;
  const alertMetrics = data?.alertMetrics;

  const totalActiveAlerts =
    (alertMetrics?.lowStockCount || 0) +
    (alertMetrics?.nearingExpiryCount || 0) +
    (alertMetrics?.expiredCount || 0) +
    (alertMetrics?.paymentDueCount || 0);

  const tabs = [
    {
      id: 'pharmacy',
      label: '1. Pharmacy Information',
      shortLabel: 'Pharmacy Info',
      icon: Building2,
      description: 'Official details, contact & logo',
    },
    {
      id: 'security',
      label: '2. Account & Security',
      shortLabel: 'Account & Security',
      icon: ShieldCheck,
      description: 'Owner profile, password & session',
    },
    {
      id: 'notifications',
      label: '5. Notifications & Alerts',
      shortLabel: 'Notifications',
      icon: Bell,
      badge: totalActiveAlerts > 0 ? totalActiveAlerts : null,
      description: 'Stock, expiry & payment warnings',
    },
    {
      id: 'preferences',
      label: '6. General Preferences',
      shortLabel: 'Preferences',
      icon: Palette,
      description: 'Currency ETB, theme & formatting',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <SettingsIcon className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                System & Pharmacy Settings
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {settings?.currency || 'ETB'} Active
              </span>
            </div>
            
          </div>
        </div>

        {/* Quick Identity Chip */}
        {settings && (
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3 shrink-0">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                +
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                {settings.pharmacyName || 'Pharmacy Care'}
              </span>
              <span className="text-[10px] text-slate-400">
                Owner: {settings.ownerName || 'Abdi Alemu'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error state if API fails */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Failed to load settings. Please verify the backend connection and try again.</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start p-3 rounded-xl transition-all cursor-pointer text-left relative ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-400 dark:border-emerald-500/80 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold truncate">{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5 truncate hidden sm:block">
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="mt-6">
        {activeTab === 'pharmacy' && (
          <PharmacyInfoTab settings={settings} isLoading={isLoading} />
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


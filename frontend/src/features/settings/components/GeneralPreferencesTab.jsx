import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Palette,
  Sun,
  Moon,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useUpdateGeneralPreferences } from '../hooks/use-settings';
import { useTheme } from '@/shared/hooks/use-theme';
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

export const GeneralPreferencesTab = ({ settings, isLoading }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: i18n.language || 'en',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateGeneralPreferences();

  useEffect(() => {
    if (settings) {
      const activeLang = settings.language || localStorage.getItem('pharmacy_language') || i18n.language || 'en';
      setPreferences((prev) => ({
        ...prev,
        theme: settings.theme || theme || 'light',
        language: activeLang,
      }));
      if (activeLang && activeLang !== i18n.language) {
        i18n.changeLanguage(activeLang);
      }
    }
  }, [settings, theme, i18n]);

  useEffect(() => {
    const handleLangChange = (lng) => {
      setPreferences((prev) => ({ ...prev, language: lng }));
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const handleThemeSelect = (selectedTheme) => {
    setPreferences((prev) => ({ ...prev, theme: selectedTheme }));
    setTheme(selectedTheme);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleLanguageSelect = (selectedLang) => {
    setPreferences((prev) => ({ ...prev, language: selectedLang }));
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('pharmacy_language', selectedLang);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    updateMutation.mutate(
      {
        theme: preferences.theme,
        language: preferences.language,
      },
      {
        onSuccess: () => {
          setSuccessMsg(t('settings.preferences.successMsg', 'Preferences saved successfully.'));
          setTimeout(() => setSuccessMsg(''), 4000);
        },
        onError: (err) => {
          setErrorMsg(
            err.response?.data?.message ||
              t('settings.preferences.errorMsg', 'Failed to save preferences')
          );
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('settings.preferences.title', 'General Preferences')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings.preferences.subtitle', 'Customize appearance and visual presentation of the system.')}
              </p>
            </div>
          </div>
        </div>

        {/* 1. System Language Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('settings.preferences.languageTitle', 'System Language')}
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
            {t('settings.preferences.languageSubtitle', 'Choose your preferred operating language across the interface.')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = preferences.language === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {lang.badge}
                    </span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>

                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {lang.name} • {lang.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. System Appearance Theme */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {t('settings.preferences.appearanceTitle', 'System Appearance Theme')}
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
                  {t('settings.preferences.lightTheme', 'Light Theme')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('settings.preferences.lightDesc', 'Clean daylight appearance with high contrast')}
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
                  {t('settings.preferences.darkTheme', 'Dark Theme')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t('settings.preferences.darkDesc', 'Low-light night shift mode for reduced eye strain')}
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
                <span>{t('settings.preferences.savingBtn', 'Saving Preferences...')}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('settings.preferences.saveBtn', 'Save Preferences')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Sun,
  Moon,
  Globe,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useUpdateGeneralPreferences, SETTINGS_QUERY_KEY } from '../hooks/use-settings';
import { useTheme } from '@/shared/hooks/use-theme';
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';
import {
  TIME_ZONE_OPTIONS,
  formatAppDate,
  formatAppTime,
} from '@/shared/lib/date-utils';

export const DATE_FORMAT_OPTIONS = [
  {
    format: 'DD/MM/YYYY',
    subtitle: 'Day / Month / Year',
  },
  {
    format: 'MM/DD/YYYY',
    subtitle: 'Month / Day / Year',
  },
  {
    format: 'YYYY-MM-DD',
    subtitle: 'Year / Month / Day',
  },
];

export const GeneralPreferencesTab = ({ settings, isLoading }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: (i18n.language || 'en').slice(0, 2),
    calendarType: localStorage.getItem('pharmacy_calendar_type') || 'ethiopian',
    dateFormat: localStorage.getItem('pharmacy_date_format') || 'DD/MM/YYYY',
    timeZone: localStorage.getItem('pharmacy_timezone') || 'Africa/Addis_Ababa',
  });

  const [showTzDropdown, setShowTzDropdown] = useState(false);
  const [localTime, setLocalTime] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: localStorage.getItem('pharmacy_timezone') || 'Africa/Addis_Ababa',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());
    } catch {
      return '10:00 AM';
    }
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useUpdateGeneralPreferences();

  useEffect(() => {
    const updateTime = () => {
      try {
        setLocalTime(
          new Intl.DateTimeFormat('en-US', {
            timeZone: preferences.timeZone || 'Africa/Addis_Ababa',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(new Date())
        );
      } catch {
        setLocalTime('10:00 AM');
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 5000);
    return () => clearInterval(timer);
  }, [preferences.timeZone]);

  useEffect(() => {
    if (settings) {
      const activeLang = (
        localStorage.getItem('pharmacy_language') ||
        settings.language ||
        i18n.language ||
        'en'
      ).slice(0, 2);

      const activeCalendar =
        settings.calendarType ||
        localStorage.getItem('pharmacy_calendar_type') ||
        'ethiopian';

      const activeDateFormat =
        settings.dateFormat ||
        localStorage.getItem('pharmacy_date_format') ||
        'DD/MM/YYYY';

      const activeTimeZone =
        settings.timeZone ||
        localStorage.getItem('pharmacy_timezone') ||
        'Africa/Addis_Ababa';

      setPreferences((prev) => ({
        ...prev,
        theme: settings.theme || theme || 'light',
        language: activeLang,
        calendarType: activeCalendar,
        dateFormat: activeDateFormat,
        timeZone: activeTimeZone,
      }));

      if (activeLang && activeLang !== (i18n.language || '').slice(0, 2)) {
        i18n.changeLanguage(activeLang);
      }
    }
  }, [settings, theme, i18n]);

  useEffect(() => {
    const handleLangChange = (lng) => {
      const normalized = (lng || 'en').slice(0, 2);
      setPreferences((prev) => ({ ...prev, language: normalized }));
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

    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          theme: selectedTheme,
        },
      };
    });

    updateMutation.mutate(
      {
        theme: selectedTheme,
        language: preferences.language,
        calendarType: preferences.calendarType,
        dateFormat: preferences.dateFormat,
        timeZone: preferences.timeZone,
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

  const handleLanguageSelect = (selectedLang) => {
    const code = (selectedLang || 'en').slice(0, 2);
    setPreferences((prev) => ({ ...prev, language: code }));
    i18n.changeLanguage(code);
    localStorage.setItem('pharmacy_language', code);
    setSuccessMsg('');
    setErrorMsg('');

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

    updateMutation.mutate(
      {
        theme: preferences.theme,
        language: code,
        calendarType: preferences.calendarType,
        dateFormat: preferences.dateFormat,
        timeZone: preferences.timeZone,
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

  const handleCalendarSelect = (calType) => {
    setPreferences((prev) => ({ ...prev, calendarType: calType }));
    localStorage.setItem('pharmacy_calendar_type', calType);
    window.dispatchEvent(new Event('pharmacy_preferences_changed'));
    setSuccessMsg('');
    setErrorMsg('');

    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          calendarType: calType,
        },
      };
    });

    updateMutation.mutate(
      {
        theme: preferences.theme,
        language: preferences.language,
        calendarType: calType,
        dateFormat: preferences.dateFormat,
        timeZone: preferences.timeZone,
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

  const handleDateFormatSelect = (format) => {
    setPreferences((prev) => ({ ...prev, dateFormat: format }));
    localStorage.setItem('pharmacy_date_format', format);
    window.dispatchEvent(new Event('pharmacy_preferences_changed'));
    setSuccessMsg('');
    setErrorMsg('');

    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          dateFormat: format,
        },
      };
    });

    updateMutation.mutate(
      {
        theme: preferences.theme,
        language: preferences.language,
        calendarType: preferences.calendarType,
        dateFormat: format,
        timeZone: preferences.timeZone,
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

  const handleTimeZoneSelect = (tz) => {
    setPreferences((prev) => ({ ...prev, timeZone: tz }));
    localStorage.setItem('pharmacy_timezone', tz);
    window.dispatchEvent(new Event('pharmacy_preferences_changed'));
    setShowTzDropdown(false);
    setSuccessMsg('');
    setErrorMsg('');

    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          timeZone: tz,
        },
      };
    });

    updateMutation.mutate(
      {
        theme: preferences.theme,
        language: preferences.language,
        calendarType: preferences.calendarType,
        dateFormat: preferences.dateFormat,
        timeZone: tz,
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

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      theme: preferences.theme,
      language: (preferences.language || i18n.language || 'en').slice(0, 2),
      calendarType: preferences.calendarType || 'ethiopian',
      dateFormat: preferences.dateFormat || 'DD/MM/YYYY',
      timeZone: preferences.timeZone || 'Africa/Addis_Ababa',
    };

    updateMutation.mutate(payload, {
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
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeLanguage = (preferences.language || i18n.language || 'en').slice(0, 2);
  const selectedTzObj =
    TIME_ZONE_OPTIONS.find((tzo) => tzo.tz === preferences.timeZone) ||
    TIME_ZONE_OPTIONS[0];

  const today = new Date();

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = activeLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {lang.badge}
                    </span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
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
                  </div>
                </button>
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
            <button
              type="button"
              onClick={() => handleThemeSelect('light')}
              className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                preferences.theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
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
              </div>
              {preferences.theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => handleThemeSelect('dark')}
              className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                preferences.theme === 'dark'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
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
              </div>
              {preferences.theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 3. Calendar System (Ethiopian vs Gregorian) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('settings.preferences.calendarTitle', 'Calendar System')}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ethiopian Calendar Card */}
            <button
              type="button"
              onClick={() => handleCalendarSelect('ethiopian')}
              className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                preferences.calendarType === 'ethiopian'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                    {t('settings.preferences.ethiopianCalendar', 'Ethiopian Calendar (E.C.)')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Default
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {formatAppDate(today, {
                    calendarType: 'ethiopian',
                    dateFormat: preferences.dateFormat,
                    showMonthName: true,
                    language: activeLanguage,
                  })}
                </span>
              </div>
              {preferences.calendarType === 'ethiopian' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </button>

            {/* Gregorian Calendar Card */}
            <button
              type="button"
              onClick={() => handleCalendarSelect('gregorian')}
              className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                preferences.calendarType === 'gregorian'
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  {t('settings.preferences.gregorianCalendar', 'Gregorian Calendar (G.C.)')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                  {formatAppDate(today, {
                    calendarType: 'gregorian',
                    dateFormat: preferences.dateFormat,
                    showSuffix: true,
                  })}
                </span>
              </div>
              {preferences.calendarType === 'gregorian' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Date Format Selection */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('settings.preferences.dateFormatTitle', 'Date Format')}
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DATE_FORMAT_OPTIONS.map((item) => {
              const isSelected = (preferences.dateFormat || 'DD/MM/YYYY') === item.format;
              const liveSample = formatAppDate(today, {
                calendarType: preferences.calendarType,
                dateFormat: item.format,
                language: activeLanguage,
              });

              return (
                <button
                  key={item.format}
                  type="button"
                  onClick={() => handleDateFormatSelect(item.format)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-700 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {item.format}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                      {item.subtitle}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                      {liveSample}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Time Zone Selection */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('settings.preferences.timeZoneTitle', 'Time Zone')}
            </label>
          </div>

          <div className="relative">
            {/* Active Time Zone Card / Dropdown Trigger */}
            <div
              onClick={() => setShowTzDropdown(!showTzDropdown)}
              className="w-full p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:border-emerald-600 select-none"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                    {selectedTzObj.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {t('settings.preferences.timeZoneDesc', 'Illustrative local sale time in Ethiopia')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {localTime || '10:00 AM'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedTzObj.abbr}
                  </span>
                </div>
                <div className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTzDropdown ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Time Zone Dropdown Menu */}
            {showTzDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {TIME_ZONE_OPTIONS.map((opt) => {
                  const isCurrent = opt.tz === preferences.timeZone;
                  let optTime = '';
                  try {
                    optTime = new Intl.DateTimeFormat('en-US', {
                      timeZone: opt.tz,
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }).format(today);
                  } catch {
                    optTime = '10:00 AM';
                  }

                  return (
                    <button
                      key={opt.tz}
                      type="button"
                      onClick={() => handleTimeZoneSelect(opt.tz)}
                      className={`w-full p-3.5 flex items-center justify-between text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        isCurrent
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCurrent ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                        )}
                        <div>
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{opt.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{optTime}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {opt.abbr}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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

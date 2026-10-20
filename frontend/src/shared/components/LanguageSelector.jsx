import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';
import { useUpdateGeneralPreferences, SETTINGS_QUERY_KEY } from '@/features/settings/hooks/use-settings';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const updatePrefsMutation = useUpdateGeneralPreferences();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentCode = (i18n.language || localStorage.getItem('pharmacy_language') || 'en').slice(0, 2);
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    const normalized = (code || 'en').slice(0, 2);
    i18n.changeLanguage(normalized);
    localStorage.setItem('pharmacy_language', normalized);

    // Optimistically update React Query settings cache
    queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
      if (!old) return old;
      return {
        ...old,
        settings: {
          ...old.settings,
          language: normalized,
        },
      };
    });

    // Persist to backend database
    updatePrefsMutation.mutate({ language: normalized });

    // Notify other components reactively
    window.dispatchEvent(new Event('pharmacy_preferences_changed'));

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Select system language"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        
        <span className="text-xs font-bold tracking-tight select-none">
          {currentLang.badge}
        </span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden md:inline select-none">
          {currentLang.nativeName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Language Options Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
                    {lang.badge}
                  </span>
                  <div className="truncate">
                    <span className="block font-bold">{lang.nativeName}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">{lang.name}</span>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettingsApi,
  updatePharmacyApi,
  updateAccountApi,
  changePasswordApi,
  updateNotificationsApi,
  updateGeneralPreferencesApi,
} from '../api/settings.api';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/shared/hooks/use-theme';
import i18n from '@/shared/lib/i18n';

export const SETTINGS_QUERY_KEY = ['settings'];

/**
 * Hook to retrieve settings, user profile, and live alert metrics
 */
export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettingsApi,
    select: (res) => res.data,
  });
};

/**
 * Hook to update Pharmacy Information
 */
export const useUpdatePharmacy = () => {
  const queryClient = useQueryClient();
  const { setAuth, token, user } = useAuth();

  return useMutation({
    mutationFn: updatePharmacyApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      const updatedUser = res?.data?.user;
      if (updatedUser && setAuth) {
        setAuth({ ...user, ...updatedUser }, token);
      }
    },
  });
};

/**
 * Hook to update Owner's Account Details
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const { setAuth, token, user } = useAuth();

  return useMutation({
    mutationFn: updateAccountApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      // Update locally stored user profile in zustand store
      const updatedUser = res?.data?.user || (res?.data?.id ? res?.data : null);
      if (updatedUser && setAuth) {
        setAuth({ ...user, ...updatedUser }, token);
      }
    },
  });
};

/**
 * Hook to change Password with verification
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
  });
};

/**
 * Hook to update Notifications & Alerts preferences
 */
export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
};

/**
 * Hook to update General Preferences
 */
export const useUpdateGeneralPreferences = () => {
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: updateGeneralPreferencesApi,
    onSuccess: (res) => {
      const updated = res?.data;
      if (updated) {
        queryClient.setQueryData(SETTINGS_QUERY_KEY, (old) => {
          if (!old) return old;
          return {
            ...old,
            settings: {
              ...old.settings,
              ...updated,
            },
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });

      if (updated?.theme) {
        setTheme(updated.theme);
      }
      if (updated?.language) {
        i18n.changeLanguage(updated.language);
        localStorage.setItem('pharmacy_language', updated.language);
      }
      if (updated?.currency) {
        localStorage.setItem('pharmacy_currency', updated.currency);
      }
      if (updated?.tableRowsPerPage) {
        localStorage.setItem('pharmacy_page_size', String(updated.tableRowsPerPage));
      }
    },
  });
};


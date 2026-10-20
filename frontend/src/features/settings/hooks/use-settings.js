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
  return useMutation({
    mutationFn: updatePharmacyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
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
      if (res.data) {
        setAuth({ ...user, ...res.data }, token);
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
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      if (res.data?.theme) {
        setTheme(res.data.theme);
      }
      if (res.data?.currency) {
        localStorage.setItem('pharmacy_currency', res.data.currency);
      }
      if (res.data?.tableRowsPerPage) {
        localStorage.setItem('pharmacy_page_size', String(res.data.tableRowsPerPage));
      }
    },
  });
};


import { apiClient } from '@/shared/lib/api-client';

/**
 * 1. Fetch full settings, owner account info & live alert counts
 */
export const getSettingsApi = async () => {
  const res = await apiClient.get('/settings');
  return res.data;
};

/**
 * 2. Update Pharmacy Information (Name, Owner, Phone, Email, Address, Logo)
 */
export const updatePharmacyApi = async (pharmacyData) => {
  const res = await apiClient.put('/settings/pharmacy', pharmacyData);
  return res.data;
};

/**
 * 3. Update Account Information (Owner Name, Email, Phone, Session Timeout)
 */
export const updateAccountApi = async (accountData) => {
  const res = await apiClient.put('/settings/account', accountData);
  return res.data;
};

/**
 * 4. Change Password with Current Password Verification
 */
export const changePasswordApi = async (passwordData) => {
  const res = await apiClient.post('/settings/change-password', passwordData);
  return res.data;
};

/**
 * 5. Update Notifications & Alerts preferences
 */
export const updateNotificationsApi = async (notificationsData) => {
  const res = await apiClient.put('/settings/notifications', notificationsData);
  return res.data;
};

/**
 * 6. Update General Preferences (Currency ETB, Date format, Time zone, Theme, etc.)
 */
export const updateGeneralPreferencesApi = async (generalData) => {
  const res = await apiClient.put('/settings/general', generalData);
  return res.data;
};


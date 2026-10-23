import { apiClient } from '@/shared/lib/api-client';

/**
 * 1. Fetch staff accounts with optional search, role and status filter
 */
export const getUsersApi = async ({ search = '', role = '', status = '' } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (role && role !== 'ALL') params.role = role;
  if (status && status !== 'ALL') params.status = status;

  const res = await apiClient.get('/settings/users', { params });
  return res.data;
};

/**
 * 2. Create a new staff account
 */
export const createUserApi = async (userData) => {
  const res = await apiClient.post('/settings/users', userData);
  return res.data;
};

/**
 * 3. Update staff account details
 */
export const updateUserApi = async ({ id, ...userData }) => {
  const res = await apiClient.put(`/settings/users/${id}`, userData);
  return res.data;
};

/**
 * 4. Toggle account status (ACTIVE / INACTIVE)
 */
export const toggleUserStatusApi = async ({ id, status, isActive }) => {
  const res = await apiClient.patch(`/settings/users/${id}/status`, { status, isActive });
  return res.data;
};

/**
 * 5. Reset user password directly by Admin
 */
export const resetUserPasswordApi = async ({ id, newPassword }) => {
  const res = await apiClient.post(`/settings/users/${id}/reset-password`, { newPassword });
  return res.data;
};

/**
 * 6. Delete staff account
 */
export const deleteUserApi = async (id) => {
  const res = await apiClient.delete(`/settings/users/${id}`);
  return res.data;
};


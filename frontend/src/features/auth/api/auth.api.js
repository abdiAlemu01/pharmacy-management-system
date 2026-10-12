import { apiClient } from '@/shared/lib/api-client';

export const loginApi = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const registerApi = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

export const resetPasswordApi = async (data) => {
  const res = await apiClient.post('/auth/reset-password', data);
  return res.data;
};

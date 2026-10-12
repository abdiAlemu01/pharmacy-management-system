import { apiClient } from '@/shared/lib/api-client';

export const getPrescriptions = async () => {
  const res = await apiClient.get('/prescriptions');
  return res.data;
};

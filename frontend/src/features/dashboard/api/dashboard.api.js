import { apiClient } from '@/shared/lib/api-client';

export const getDashboardSummaryApi = async (params = {}) => {
  const res = await apiClient.get('/dashboard/summary', { params });
  return res.data?.data || res.data;
};


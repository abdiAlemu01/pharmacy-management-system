import { apiClient } from '@/shared/lib/api-client';

export const getReportsOverviewApi = async () => {
  const res = await apiClient.get('/reports/overview');
  return res.data?.data || res.data;
};

export const getSalesReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/sales', { params });
  return res.data?.data || res.data;
};

export const getFinancialReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/financial', { params });
  return res.data?.data || res.data;
};

export const getInventoryReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/inventory', { params });
  return res.data?.data || res.data;
};

export const getPurchaseReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/purchases', { params });
  return res.data?.data || res.data;
};

export const getExpenseReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/expenses', { params });
  return res.data?.data || res.data;
};

export const getMedicinePerformanceReportsApi = async (params = {}) => {
  const res = await apiClient.get('/reports/medicine-performance', { params });
  return res.data?.data || res.data;
};


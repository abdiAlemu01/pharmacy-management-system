import { apiClient } from '@/shared/lib/api-client';

export const getExpenseSummaryApi = async () => {
  const res = await apiClient.get('/expenses/summary');
  return res.data;
};

export const getExpensesApi = async (params = {}) => {
  const res = await apiClient.get('/expenses', { params });
  return res.data?.data || res.data;
};

export const getExpenseByIdApi = async (id) => {
  const res = await apiClient.get(`/expenses/${id}`);
  return res.data?.data || res.data;
};

export const createExpenseApi = async (data) => {
  const res = await apiClient.post('/expenses', data);
  return res.data;
};

export const updateExpenseApi = async ({ id, ...data }) => {
  const res = await apiClient.put(`/expenses/${id}`, data);
  return res.data;
};

export const recordExpensePaymentApi = async ({ id, ...data }) => {
  const res = await apiClient.post(`/expenses/${id}/payment`, data);
  return res.data;
};

export const voidExpenseApi = async ({ id, ...data }) => {
  const res = await apiClient.post(`/expenses/${id}/void`, data);
  return res.data;
};

export const getExpenseReportsApi = async (params = {}) => {
  const res = await apiClient.get('/expenses/reports', { params });
  return res.data?.data || res.data;
};


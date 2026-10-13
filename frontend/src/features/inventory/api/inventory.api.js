import { apiClient } from '@/shared/lib/api-client';

/**
 * Fetch inventory summary (whole investment cost, counts, etc.)
 */
export const getInventorySummaryApi = async () => {
  const res = await apiClient.get('/inventory/summary');
  return res.data;
};

/**
 * Fetch inventory items list with search and pagination
 */
export const getInventoryApi = async (params = {}) => {
  const res = await apiClient.get('/inventory', { params });
  return res.data;
};

/**
 * Add stock (+) - updates existing medicine quantity or registers new medicine
 */
export const addStockApi = async (payload) => {
  const res = await apiClient.post('/inventory/add', payload);
  return res.data;
};

/**
 * Reduce stock (-) - deducts stock, preventing negative inventory
 */
export const reduceStockApi = async (payload) => {
  const res = await apiClient.post('/inventory/reduce', payload);
  return res.data;
};

/**
 * Edit medicine information
 */
export const editMedicineInventoryApi = async (id, payload) => {
  const res = await apiClient.put(`/inventory/${id}`, payload);
  return res.data;
};

/**
 * Fetch recent inventory movements
 */
export const getInventoryMovementsApi = async (params = {}) => {
  const res = await apiClient.get('/inventory/movements', { params });
  return res.data;
};


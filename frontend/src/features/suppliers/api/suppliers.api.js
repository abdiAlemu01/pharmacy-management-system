import { apiClient } from '@/shared/lib/api-client';

/**
 * Fetch list of suppliers with search and filters
 */
export const getSuppliersApi = async (params = {}) => {
  const res = await apiClient.get('/suppliers', { params });
  return res.data;
};

/**
 * Fetch a single supplier by ID
 */
export const getSupplierByIdApi = async (id) => {
  const res = await apiClient.get(`/suppliers/${id}`);
  return res.data;
};

/**
 * Register a new supplier
 */
export const createSupplierApi = async (supplierData) => {
  const res = await apiClient.post('/suppliers', supplierData);
  return res.data;
};

/**
 * Update an existing supplier
 */
export const updateSupplierApi = async ({ id, ...supplierData }) => {
  const res = await apiClient.put(`/suppliers/${id}`, supplierData);
  return res.data;
};

/**
 * Delete or deactivate a supplier
 */
export const deleteSupplierApi = async (id) => {
  const res = await apiClient.delete(`/suppliers/${id}`);
  return res.data;
};

/**
 * Fetch purchase history for a particular supplier
 */
export const getSupplierPurchaseHistoryApi = async (id) => {
  const res = await apiClient.get(`/suppliers/${id}/purchases`);
  return res.data;
};

/**
 * Record a new purchase from a supplier
 */
export const createSupplierPurchaseApi = async ({ id, ...purchaseData }) => {
  const res = await apiClient.post(`/suppliers/${id}/purchases`, purchaseData);
  return res.data;
};


import { apiClient } from '@/shared/lib/api-client';

/**
 * Fetch available medicines for POS dispensary terminal
 */
export const getPOSMedicinesApi = async (params = {}) => {
  const res = await apiClient.get('/sales/medicines', { params });
  return res.data;
};

/**
 * Complete a new POS sale checkout
 */
export const createSaleApi = async (saleData) => {
  const res = await apiClient.post('/sales', saleData);
  return res.data;
};

/**
 * Fetch a specific sale receipt / record by ID
 */
export const getSaleByIdApi = async (id) => {
  const res = await apiClient.get(`/sales/${id}`);
  return res.data;
};


import { apiClient } from '@/shared/lib/api-client';

/**
 * Fetch daily & monthly sales analytics, top & least selling medicines
 */
export const getSalesAnalyticsApi = async () => {
  const res = await apiClient.get('/sales/analytics');
  return res.data;
};

/**
 * Fetch available medicines for POS terminal
 */
export const getPOSMedicinesApi = async (params = {}) => {
  const res = await apiClient.get('/sales/medicines', { params });
  return res.data;
};

/**
 * Fetch sales history with pagination
 */
export const getSalesHistoryApi = async (params = {}) => {
  const res = await apiClient.get('/sales', { params });
  return res.data;
};

/**
 * Process a new sale
 */
export const createSaleApi = async (saleData) => {
  const res = await apiClient.post('/sales', saleData);
  return res.data;
};


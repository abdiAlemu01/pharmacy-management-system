import { apiClient } from '@/shared/lib/api-client';

/**
 * Fetch purchases list with optional search and filters
 */
export const getPurchasesApi = async (params = {}) => {
  const res = await apiClient.get('/purchases', { params });
  return res.data;
};

/**
 * Fetch purchase summary, cash obligations, and supplier spending reports
 */
export const getPurchasesSummaryApi = async () => {
  const res = await apiClient.get('/purchases/summary');
  return res.data;
};

/**
 * Fetch details of a single purchase order
 */
export const getPurchaseByIdApi = async (id) => {
  const res = await apiClient.get(`/purchases/${id}`);
  return res.data;
};

/**
 * 1. Add Purchase Order
 */
export const createPurchaseApi = async (data) => {
  const res = await apiClient.post('/purchases', data);
  return res.data;
};

/**
 * 2. Receive Medicines (updates inventory for accepted quantities)
 */
export const receiveMedicinesApi = async ({ id, ...data }) => {
  const res = await apiClient.post(`/purchases/${id}/receive`, data);
  return res.data;
};

/**
 * 3. Record Supplier Payment
 */
export const recordPaymentApi = async ({ id, ...data }) => {
  const res = await apiClient.post(`/purchases/${id}/payments`, data);
  return res.data;
};

/**
 * 5. Return Medicines to Supplier
 */
export const returnMedicinesApi = async ({ id, ...data }) => {
  const res = await apiClient.post(`/purchases/${id}/returns`, data);
  return res.data;
};

/**
 * Delete a purchase order
 */
export const deletePurchaseApi = async (id) => {
  const res = await apiClient.delete(`/purchases/${id}`);
  return res.data;
};


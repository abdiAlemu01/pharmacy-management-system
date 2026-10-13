import { apiClient } from '@/shared/lib/api-client';

export const getMedicinesApi = async (params = {}) => {
  const res = await apiClient.get('/medicines', { params });
  return res.data;
};

export const getMedicineByIdApi = async (id) => {
  const res = await apiClient.get(`/medicines/${id}`);
  return res.data;
};

export const createMedicineApi = async (medicineData) => {
  const res = await apiClient.post('/medicines', medicineData);
  return res.data;
};

export const updateMedicineApi = async (id, medicineData) => {
  const res = await apiClient.put(`/medicines/${id}`, medicineData);
  return res.data;
};


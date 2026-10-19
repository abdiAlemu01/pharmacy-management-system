import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPurchasesApi,
  getPurchaseByIdApi,
  getPurchasesSummaryApi,
  createPurchaseApi,
  receiveMedicinesApi,
  recordPaymentApi,
  returnMedicinesApi,
  deletePurchaseApi,
} from '../api/purchases.api';

export const PURCHASES_KEY = ['purchases'];
export const PURCHASE_DETAILS_KEY = ['purchase-details'];
export const PURCHASES_SUMMARY_KEY = ['purchases-summary'];

/**
 * Hook to fetch purchases list
 */
export const usePurchases = (params = {}) => {
  return useQuery({
    queryKey: [...PURCHASES_KEY, params],
    queryFn: () => getPurchasesApi(params),
  });
};

/**
 * Hook to fetch single purchase order details
 */
export const usePurchaseDetails = (id, options = {}) => {
  return useQuery({
    queryKey: [...PURCHASE_DETAILS_KEY, id],
    queryFn: () => getPurchaseByIdApi(id),
    enabled: Boolean(id) && (options.enabled !== undefined ? options.enabled : true),
  });
};

/**
 * Hook to fetch purchase summary & reports
 */
export const usePurchasesSummary = () => {
  return useQuery({
    queryKey: PURCHASES_SUMMARY_KEY,
    queryFn: getPurchasesSummaryApi,
  });
};

/**
 * 1. Add Purchase Order mutation
 */
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

/**
 * 2. Receive Medicines mutation (updates inventory)
 */
export const useReceiveMedicines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: receiveMedicinesApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: [...PURCHASE_DETAILS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: PURCHASES_SUMMARY_KEY });
      // Invalidate inventory caches so received medicines appear immediately
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
};

/**
 * 3. Record Supplier Payment mutation
 */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordPaymentApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: [...PURCHASE_DETAILS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: PURCHASES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

/**
 * 5. Return Medicines mutation (adjusts inventory and finances)
 */
export const useReturnMedicines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnMedicinesApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: [...PURCHASE_DETAILS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: PURCHASES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

/**
 * Delete purchase order mutation
 */
export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchaseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASES_KEY });
      queryClient.invalidateQueries({ queryKey: PURCHASES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};


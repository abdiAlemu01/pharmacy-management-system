import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPOSMedicinesApi,
  createSaleApi,
  getSaleByIdApi,
} from '../api/pos.api';

export const POS_MEDICINES_KEY = ['pos-medicines'];
export const POS_SALE_KEY = ['pos-sale'];

/**
 * Hook to retrieve available dispensary medicines for POS terminal
 */
export const usePOSMedicines = (params = {}) => {
  return useQuery({
    queryKey: [...POS_MEDICINES_KEY, params],
    queryFn: () => getPOSMedicinesApi(params),
  });
};

/**
 * Hook to fetch a single completed sale
 */
export const usePOSSale = (id) => {
  return useQuery({
    queryKey: [...POS_SALE_KEY, id],
    queryFn: () => getSaleByIdApi(id),
    enabled: Boolean(id),
  });
};

/**
 * Hook to process POS sale checkout
 */
export const useCreatePOSSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaleApi,
    onSuccess: () => {
      // Refresh inventory, POS medicines, sales analytics, and dashboard stats
      queryClient.invalidateQueries({ queryKey: POS_MEDICINES_KEY });
      queryClient.invalidateQueries({ queryKey: ['sales-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
};


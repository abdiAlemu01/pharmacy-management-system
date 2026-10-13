import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSalesAnalyticsApi,
  getPOSMedicinesApi,
  getSalesHistoryApi,
  createSaleApi,
} from '../api/sales.api';

export const SALES_ANALYTICS_KEY = ['sales-analytics'];
export const POS_MEDICINES_KEY = ['pos-medicines'];
export const SALES_HISTORY_KEY = ['sales-history'];

export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: SALES_ANALYTICS_KEY,
    queryFn: getSalesAnalyticsApi,
    refetchInterval: 30000, // auto refresh every 30s
  });
};

export const usePOSMedicines = (params = {}) => {
  return useQuery({
    queryKey: [...POS_MEDICINES_KEY, params],
    queryFn: () => getPOSMedicinesApi(params),
  });
};

export const useSalesHistory = (params = {}) => {
  return useQuery({
    queryKey: [...SALES_HISTORY_KEY, params],
    queryFn: () => getSalesHistoryApi(params),
    keepPreviousData: true,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaleApi,
    onSuccess: () => {
      // Invalidate sales queries and inventory queries
      queryClient.invalidateQueries({ queryKey: SALES_ANALYTICS_KEY });
      queryClient.invalidateQueries({ queryKey: POS_MEDICINES_KEY });
      queryClient.invalidateQueries({ queryKey: SALES_HISTORY_KEY });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventorySummaryApi,
  getInventoryApi,
  addStockApi,
  reduceStockApi,
  editMedicineInventoryApi,
  getInventoryMovementsApi,
} from '../api/inventory.api';

export const INVENTORY_QUERY_KEY = ['inventory'];
export const INVENTORY_SUMMARY_KEY = ['inventory-summary'];
export const INVENTORY_MOVEMENTS_KEY = ['inventory-movements'];

export const useInventorySummary = () => {
  return useQuery({
    queryKey: INVENTORY_SUMMARY_KEY,
    queryFn: getInventorySummaryApi,
  });
};

export const useInventory = (params = {}) => {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, params],
    queryFn: () => getInventoryApi(params),
    keepPreviousData: true,
  });
};

export const useAddStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStockApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY });
    },
  });
};

export const useReduceStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reduceStockApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY });
    },
  });
};

export const useEditMedicineInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => editMedicineInventoryApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: INVENTORY_MOVEMENTS_KEY });
    },
  });
};

export const useInventoryMovements = (params = {}) => {
  return useQuery({
    queryKey: [...INVENTORY_MOVEMENTS_KEY, params],
    queryFn: () => getInventoryMovementsApi(params),
    keepPreviousData: true,
  });
};


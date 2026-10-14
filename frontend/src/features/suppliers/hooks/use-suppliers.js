import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSuppliersApi,
  getSupplierByIdApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
  getSupplierPurchaseHistoryApi,
  createSupplierPurchaseApi,
} from '../api/suppliers.api';

export const SUPPLIERS_KEY = ['suppliers'];
export const SUPPLIER_DETAILS_KEY = ['supplier-details'];
export const SUPPLIER_PURCHASES_KEY = ['supplier-purchases'];

/**
 * Hook to fetch suppliers with search and filters
 */
export const useSuppliers = (params = {}) => {
  return useQuery({
    queryKey: [...SUPPLIERS_KEY, params],
    queryFn: () => getSuppliersApi(params),
  });
};

/**
 * Hook to fetch a single supplier details by ID
 */
export const useSupplierDetails = (id, options = {}) => {
  return useQuery({
    queryKey: [...SUPPLIER_DETAILS_KEY, id],
    queryFn: () => getSupplierByIdApi(id),
    enabled: Boolean(id) && (options.enabled !== undefined ? options.enabled : true),
  });
};
export const useSupplier = useSupplierDetails;

/**
 * Hook to fetch supplier purchase history
 */
export const useSupplierPurchaseHistory = (id, options = {}) => {
  return useQuery({
    queryKey: [...SUPPLIER_PURCHASES_KEY, id],
    queryFn: () => getSupplierPurchaseHistoryApi(id),
    enabled: Boolean(id) && (options.enabled !== undefined ? options.enabled : true),
  });
};
export const useSupplierPurchases = useSupplierPurchaseHistory;

/**
 * Hook to register a new supplier
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
  });
};

/**
 * Hook to update an existing supplier
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSupplierApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...SUPPLIER_DETAILS_KEY, variables.id] });
    },
  });
};

/**
 * Hook to delete or deactivate a supplier
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplierApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
    },
  });
};

/**
 * Hook to record a new purchase from a supplier
 */
export const useCreateSupplierPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplierPurchaseApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      queryClient.invalidateQueries({ queryKey: [...SUPPLIER_PURCHASES_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [...SUPPLIER_DETAILS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};

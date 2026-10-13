import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMedicinesApi,
  getMedicineByIdApi,
  createMedicineApi,
  updateMedicineApi,
} from '../api/medicines.api';

export const MEDICINES_QUERY_KEY = ['medicines'];

export const useMedicines = (params) => {
  return useQuery({
    queryKey: [...MEDICINES_QUERY_KEY, params],
    queryFn: () => getMedicinesApi(params),
    keepPreviousData: true,
  });
};

export const useMedicine = (id) => {
  return useQuery({
    queryKey: [...MEDICINES_QUERY_KEY, id],
    queryFn: () => getMedicineByIdApi(id),
    enabled: Boolean(id),
  });
};

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMedicineApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateMedicineApi(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...MEDICINES_QUERY_KEY, variables.id] });
    },
  });
};


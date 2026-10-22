import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenseSummaryApi,
  getExpensesApi,
  getExpenseByIdApi,
  createExpenseApi,
  updateExpenseApi,
  recordExpensePaymentApi,
  voidExpenseApi,
  getExpenseReportsApi,
} from '../api/expenses.api';

export const EXPENSES_QUERY_KEY = ['expenses'];
export const EXPENSES_SUMMARY_KEY = ['expenses-summary'];
export const EXPENSE_DETAILS_KEY = ['expense-details'];
export const EXPENSES_REPORTS_KEY = ['expenses-reports'];

export const useExpenseSummary = () => {
  return useQuery({
    queryKey: EXPENSES_SUMMARY_KEY,
    queryFn: getExpenseSummaryApi,
    select: (res) => res?.data || res || {},
  });
};

export const useExpenses = (params = {}) => {
  return useQuery({
    queryKey: [...EXPENSES_QUERY_KEY, params],
    queryFn: () => getExpensesApi(params),
    keepPreviousData: true,
  });
};

export const useExpenseDetails = (id, options = {}) => {
  return useQuery({
    queryKey: [...EXPENSE_DETAILS_KEY, id],
    queryFn: () => getExpenseByIdApi(id),
    enabled: Boolean(id) && (options.enabled !== undefined ? options.enabled : true),
  });
};

export const useExpenseReports = (params = {}) => {
  return useQuery({
    queryKey: [...EXPENSES_REPORTS_KEY, params],
    queryFn: () => getExpenseReportsApi(params),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_REPORTS_KEY });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpenseApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_REPORTS_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: [...EXPENSE_DETAILS_KEY, variables.id] });
      }
    },
  });
};

export const useRecordExpensePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordExpensePaymentApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_REPORTS_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: [...EXPENSE_DETAILS_KEY, variables.id] });
      }
    },
  });
};

export const useVoidExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: voidExpenseApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: EXPENSES_REPORTS_KEY });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: [...EXPENSE_DETAILS_KEY, variables.id] });
      }
    },
  });
};


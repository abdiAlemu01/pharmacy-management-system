import { useQuery } from '@tanstack/react-query';
import {
  getReportsOverviewApi,
  getSalesReportsApi,
  getFinancialReportsApi,
  getInventoryReportsApi,
  getPurchaseReportsApi,
  getExpenseReportsApi,
  getMedicinePerformanceReportsApi,
} from '../api/reports.api';

export const REPORTS_OVERVIEW_KEY = ['reports-overview'];
export const REPORTS_SALES_KEY = ['reports-sales'];
export const REPORTS_FINANCIAL_KEY = ['reports-financial'];
export const REPORTS_INVENTORY_KEY = ['reports-inventory'];
export const REPORTS_PURCHASES_KEY = ['reports-purchases'];
export const REPORTS_EXPENSES_KEY = ['reports-expenses'];
export const REPORTS_PERFORMANCE_KEY = ['reports-performance'];

export const useReportsOverview = () => {
  return useQuery({
    queryKey: REPORTS_OVERVIEW_KEY,
    queryFn: getReportsOverviewApi,
    staleTime: 60 * 1000,
  });
};

export const useSalesReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_SALES_KEY, params],
    queryFn: () => getSalesReportsApi(params),
    staleTime: 30 * 1000,
  });
};

export const useFinancialReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_FINANCIAL_KEY, params],
    queryFn: () => getFinancialReportsApi(params),
    staleTime: 30 * 1000,
  });
};

export const useInventoryReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_INVENTORY_KEY, params],
    queryFn: () => getInventoryReportsApi(params),
    staleTime: 30 * 1000,
  });
};

export const usePurchaseReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_PURCHASES_KEY, params],
    queryFn: () => getPurchaseReportsApi(params),
    staleTime: 30 * 1000,
  });
};

export const useExpenseReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_EXPENSES_KEY, params],
    queryFn: () => getExpenseReportsApi(params),
    staleTime: 30 * 1000,
  });
};

export const useMedicinePerformanceReports = (params = {}) => {
  return useQuery({
    queryKey: [...REPORTS_PERFORMANCE_KEY, params],
    queryFn: () => getMedicinePerformanceReportsApi(params),
    staleTime: 30 * 1000,
  });
};


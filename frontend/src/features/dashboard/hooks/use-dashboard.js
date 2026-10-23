import { useQuery } from '@tanstack/react-query';
import { getDashboardSummaryApi } from '../api/dashboard.api';

export const useDashboardSummary = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'summary', params],
    queryFn: () => getDashboardSummaryApi(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
};


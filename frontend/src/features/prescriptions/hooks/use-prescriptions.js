import { useQuery } from '@tanstack/react-query';
import { getPrescriptions } from '../api/prescriptions.api';
import { queryKeys } from '@/shared/lib/query-keys';

export const usePrescriptions = () => {
  return useQuery({
    queryKey: queryKeys.prescriptions,
    queryFn: getPrescriptions,
  });
};

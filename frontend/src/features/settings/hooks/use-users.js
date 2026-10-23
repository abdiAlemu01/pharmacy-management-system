import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  toggleUserStatusApi,
  resetUserPasswordApi,
  deleteUserApi,
} from '../api/users.api';

export const USERS_QUERY_KEY = ['users'];

/**
 * Hook to fetch users list with filters
 */
export const useUsers = ({ search = '', role = '', status = '' } = {}) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, { search, role, status }],
    queryFn: () => getUsersApi({ search, role, status }),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => createUserApi(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * Hook to update user details
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData) => updateUserApi(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * Hook to toggle user status
 */
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, isActive }) => toggleUserStatusApi({ id, status, isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * Hook to reset a user's password
 */
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }) => resetUserPasswordApi({ id, newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUserApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};


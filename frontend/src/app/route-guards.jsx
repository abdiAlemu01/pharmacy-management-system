import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';

export const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const token = useAuth((state) => state.token);
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

export const GuestRoute = ({ redirectPath = '/dashboard' }) => {
  const token = useAuth((state) => state.token);
  if (token) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

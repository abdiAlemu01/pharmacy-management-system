import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';

/**
 * Returns the default home/landing route for each user role
 */
export const getDefaultHomeForRole = (role) => {
  const r = (role || 'ADMIN').toUpperCase();
  if (r === 'CASHIER' || r === 'CASHER') return '/sales';
  if (r === 'INVENTOR' || r === 'INVENTORY') return '/inventory';
  return '/dashboard';
};

/**
 * Ensures user is authenticated before accessing the app
 */
export const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const token = useAuth((state) => state.token);
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
};

/**
 * Prevents logged-in users from seeing login/register pages,
 * redirecting them to their role-specific home page.
 */
export const GuestRoute = () => {
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);

  if (token) {
    const home = getDefaultHomeForRole(user?.role);
    return <Navigate to={home} replace />;
  }
  return <Outlet />;
};

/**
 * Protects specific routes based on role permissions
 */
export const RoleRoute = ({ allowedRoles = [], fallbackPath }) => {
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || 'ADMIN').toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
  const hasAccess = normalizedAllowed.includes(role);

  if (!hasAccess) {
    const redirectTarget = fallbackPath || getDefaultHomeForRole(user?.role);
    return <Navigate to={redirectTarget} replace />;
  }

  return <Outlet />;
};

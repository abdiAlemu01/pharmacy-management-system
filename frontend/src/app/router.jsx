import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { ProtectedRoute, GuestRoute, RoleRoute, getDefaultHomeForRole } from './route-guards';
import { useAuth } from '@/features/auth';

// Features Pages
import { DashboardPage } from '@/features/dashboard';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@/features/auth';
import { MedicinesPage } from '@/features/medicines';
import { InventoryPage } from '@/features/inventory';
import { SalesPage } from '@/features/sales';
import { SuppliersPage, CreateSupplierPage, SupplierDetailsPage } from '@/features/suppliers';
import { PurchasesPage } from '@/features/purchases';
import { ExpensesPage } from '@/features/expenses';
import { SettingsPage } from '@/features/settings';
import { ReportsPage } from '@/features/reports';

/**
 * Redirects authenticated root visits to the user's role-appropriate home
 */
const RootRedirect = () => {
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultHomeForRole(user?.role)} replace />;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes: Unauthenticated users */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* 1. Admin-Only Features (Dashboard, Expenses, Reports, Settings) */}
            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 2. Inventory Features (Admin & Inventor) */}
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'INVENTOR']} />}>
              <Route path="/medicines" element={<MedicinesPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/new" element={<CreateSupplierPage />} />
              <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
            </Route>

            {/* 3. Sales Feature (Admin & Cashier) */}
            <Route element={<RoleRoute allowedRoles={['ADMIN', 'CASHIER']} />}>
              <Route path="/sales" element={<SalesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Root redirect: Takes authenticated user to their role home, or /login */}
        <Route path="/" element={<RootRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

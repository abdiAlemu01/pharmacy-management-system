import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/layouts/AppLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { ProtectedRoute, GuestRoute } from './route-guards';

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

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes: Default landing page is /login */}
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<CreateSupplierPage />} />
            <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Root redirect: Unauthenticated users land on /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

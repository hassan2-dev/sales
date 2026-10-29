import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { RouteTransition } from '@/components/PageTransition';
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
  AdminOrderDetailPage,
  AdminCustomersPage,
  AdminCustomerDetailPage,
  AdminQuotesPage,
  AdminQuoteDetailPage,
  AdminSupportPage,
  AdminSupportDetailPage,
  AdminServicesPage,
  AdminProjectsPage,
  AdminBrandsPage,
  AdminPagesPage,
  AdminOfficesPage,
  AdminUsersPage,
  AdminAuditPage,
  AdminSettingsPage,
} from '@/pages/admin/AdminPages';
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTransition>
        {(loc) => (
          <Routes location={loc}>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id" element={<AdminProductFormPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
              <Route path="quotes" element={<AdminQuotesPage />} />
              <Route path="quotes/:id" element={<AdminQuoteDetailPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="support/:id" element={<AdminSupportDetailPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="brands" element={<AdminBrandsPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="offices" element={<AdminOfficesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit-logs" element={<AdminAuditPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </RouteTransition>
    </BrowserRouter>
  );
}

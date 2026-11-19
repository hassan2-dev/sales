import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
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
import { AdminCategoryFormPage } from '@/pages/admin/AdminCategoryFormPage';
import { AdminBrandFormPage } from '@/pages/admin/AdminBrandFormPage';
import { AdminRolesPage } from '@/pages/admin/AdminRolesPage';
import { AdminServiceFormPage } from '@/pages/admin/AdminServiceFormPage';
import { adminPath } from '@/lib/urls';

function RedirectProductEdit() {
  const { id } = useParams();
  return <Navigate to={adminPath(`products/${id}/edit`)} replace />;
}

function RedirectCategoryEdit() {
  const { id } = useParams();
  return <Navigate to={adminPath(`categories/${id}/edit`)} replace />;
}

function RedirectBrandEdit() {
  const { id } = useParams();
  return <Navigate to={adminPath(`brands/${id}/edit`)} replace />;
}

function RedirectServiceEdit() {
  const { id } = useParams();
  return <Navigate to={adminPath(`services/${id}/edit`)} replace />;
}

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
              <Route path="products/new" element={<AdminProductFormPage mode="create" />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage mode="edit" />} />
              <Route path="products/:id" element={<RedirectProductEdit />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="categories/new" element={<AdminCategoryFormPage mode="create" />} />
              <Route path="categories/:id/edit" element={<AdminCategoryFormPage mode="edit" />} />
              <Route path="categories/:id" element={<RedirectCategoryEdit />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
              <Route path="quotes" element={<AdminQuotesPage />} />
              <Route path="quotes/:id" element={<AdminQuoteDetailPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="support/:id" element={<AdminSupportDetailPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="services/new" element={<AdminServiceFormPage mode="create" />} />
              <Route path="services/:id/edit" element={<AdminServiceFormPage mode="edit" />} />
              <Route path="services/:id" element={<RedirectServiceEdit />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="brands" element={<AdminBrandsPage />} />
              <Route path="brands/new" element={<AdminBrandFormPage mode="create" />} />
              <Route path="brands/:id/edit" element={<AdminBrandFormPage mode="edit" />} />
              <Route path="brands/:id" element={<RedirectBrandEdit />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="offices" element={<AdminOfficesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
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

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { StoreLayout } from '@/layouts/StoreLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState } from '@/components/ui/States';
import { ADMIN_URL, STORE_URL, getAppSurface } from '@/lib/urls';
import { HomePage } from '@/pages/corporate/HomePage';
import {
  AboutPage,
  ServicesPage,
  ServiceDetailPage,
  ContactPage,
  NewsPage,
  NewsDetailPage,
  BrandsPage,
  ProjectsPage,
} from '@/pages/corporate/CmsPages';
import {
  StoreProductsPage,
  StoreCategoriesPage,
  StoreCategoryPage,
  StoreBrandPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  StoreLoginPage,
  MyOrdersPage,
  MyOrderDetailPage,
} from '@/pages/store/StorePages';
import { StoreHomePage } from '@/pages/store/StoreHome';
import { FavoritesPage } from '@/pages/store/FavoritesPage';
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminProductsPage,
  AdminProductFormPage,
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
  AdminNewsPage,
  AdminBrandsPage,
  AdminPagesPage,
  AdminOfficesPage,
  AdminUsersPage,
  AdminAuditPage,
  AdminSettingsPage,
} from '@/pages/admin/AdminPages';

function ServiceDetailRoute() {
  const { slug = '' } = useParams();
  return <ServiceDetailPage slug={slug} />;
}

function NewsDetailRoute() {
  const { slug = '' } = useParams();
  return <NewsDetailPage slug={slug} />;
}

function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return <LoadingState variant="page" />;
}

function storeRoutes() {
  return (
    <Route element={<StoreLayout />}>
      <Route index element={<StoreHomePage />} />
      <Route path="products" element={<StoreProductsPage />} />
      <Route path="products/:slug" element={<ProductDetailPage />} />
      <Route path="categories" element={<StoreCategoriesPage />} />
      <Route path="categories/:slug" element={<StoreCategoryPage />} />
      <Route path="brands/:slug" element={<StoreBrandPage />} />
      <Route path="favorites" element={<FavoritesPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="account" element={<Navigate to="/account/orders" replace />} />
      <Route path="account/login" element={<StoreLoginPage />} />
      <Route path="account/orders" element={<MyOrdersPage />} />
      <Route path="account/orders/:id" element={<MyOrderDetailPage />} />
      <Route path="account/quotes" element={<Navigate to="/account/orders" replace />} />
      <Route path="account/support" element={<Navigate to="/account/orders" replace />} />
    </Route>
  );
}

function adminRoutes(prefix = '') {
  const loginPath = prefix ? `${prefix}/login` : '/login';
  const rootPath = prefix || '/';
  return (
    <>
      <Route path={loginPath} element={<AdminLoginPage />} />
      <Route path={rootPath} element={<AdminLayout />}>
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
        <Route path="news" element={<AdminNewsPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        <Route path="offices" element={<AdminOfficesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </>
  );
}

export function AppRouter() {
  const surface = getAppSurface();

  if (surface === 'store') {
    return (
      <BrowserRouter>
        <Routes>
          {storeRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (surface === 'admin') {
    return (
      <BrowserRouter>
        <Routes>
          {adminRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CorporateLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceDetailRoute />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:slug" element={<NewsDetailRoute />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route
          path="/store/*"
          element={
            <ExternalRedirect
              to={`${STORE_URL.replace(/\/$/, '')}${typeof window !== 'undefined' ? window.location.pathname.replace(/^\/store/, '') || '/' : '/'}`}
            />
          }
        />
        <Route
          path="/admin/*"
          element={
            <ExternalRedirect
              to={`${ADMIN_URL.replace(/\/$/, '')}${typeof window !== 'undefined' ? window.location.pathname.replace(/^\/admin/, '') || '/' : '/'}`}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreLayout } from '@/layouts/StoreLayout';
import { RouteTransition } from '@/components/PageTransition';
import {
  StoreProductsPage,
  StoreCategoriesPage,
  StoreCategoryPage,
  StoreBrandPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  StoreLoginPage,
  MyOrderDetailPage,
} from '@/pages/store/StorePages';
import { StoreHomePage } from '@/pages/store/StoreHome';
import { FavoritesPage } from '@/pages/store/FavoritesPage';
import { RequestQuotePage } from '@/pages/store/RequestQuotePage';
import { ComparePage } from '@/pages/store/ComparePage';
import {
  AccountShell,
  AccountProfilePage,
  AccountOrdersPage,
  AccountQuotesPage,
  AccountSupportPage,
  AccountNotificationsPage,
  AccountDocumentsPage,
} from '@/pages/store/AccountPages';

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTransition>
        {(loc) => (
          <Routes location={loc}>
            <Route element={<StoreLayout />}>
              <Route index element={<StoreHomePage />} />
              <Route path="products" element={<StoreProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="categories" element={<StoreCategoriesPage />} />
              <Route path="categories/:slug" element={<StoreCategoryPage />} />
              <Route path="brands/:slug" element={<StoreBrandPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="quote" element={<RequestQuotePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="account/login" element={<StoreLoginPage />} />
              <Route path="account" element={<AccountShell />}>
                <Route index element={<AccountProfilePage />} />
                <Route path="orders" element={<AccountOrdersPage />} />
                <Route path="quotes" element={<AccountQuotesPage />} />
                <Route path="support" element={<AccountSupportPage />} />
                <Route path="notifications" element={<AccountNotificationsPage />} />
                <Route path="documents" element={<AccountDocumentsPage />} />
              </Route>
              <Route path="account/orders/:id" element={<MyOrderDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </RouteTransition>
    </BrowserRouter>
  );
}

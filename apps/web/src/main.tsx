import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/stores/auth-context';
import { CartProvider } from '@/stores/cart-context';
import { FavoritesProvider } from '@/stores/favorites-context';
import { ThemeProvider } from '@/stores/theme-context';
import { I18nProvider } from '@/i18n/i18n-context';
import { AppToaster } from '@/components/AppToaster';
import { AppRouter } from '@/app/router';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <AppRouter />
                  <AppToaster />
                </CartProvider>
              </FavoritesProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);

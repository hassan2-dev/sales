import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/stores/auth-context';
import { ThemeProvider } from '@/stores/theme-context';
import { I18nProvider } from '@/i18n/i18n-context';
import { CommerceSettingsProvider } from '@/stores/commerce-settings-context';
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
            <CommerceSettingsProvider>
              <AuthProvider>
                <AppRouter />
                <AppToaster />
              </AuthProvider>
            </CommerceSettingsProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);

import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/services/endpoints';

export type CommerceSettings = {
  usdToIqdRate: number;
  enableIqdDisplay: boolean;
};

const defaults: CommerceSettings = {
  usdToIqdRate: 1310,
  enableIqdDisplay: true,
};

const CommerceSettingsContext = createContext<CommerceSettings>(defaults);

export function CommerceSettingsProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['commerce-settings'],
    queryFn: async () => (await settingsApi.commerce()).data,
    staleTime: 60_000,
  });

  const value: CommerceSettings = query.data ?? defaults;

  return (
    <CommerceSettingsContext.Provider value={value}>{children}</CommerceSettingsContext.Provider>
  );
}

export function useCommerceSettings() {
  return useContext(CommerceSettingsContext);
}

export function usdToIqd(usd: number, rate: number) {
  return usd * rate;
}

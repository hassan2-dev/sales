import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/services/api';
import { authApi } from '@/services/endpoints';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (data: {
    phone: string;
    code: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  requestOtp: (phone: string) => Promise<{ phone: string; devCode?: string }>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!access && !refresh) {
      setUser(null);
      return;
    }
    const { data } = await authApi.me();
    setUser(data);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshUser();
      } catch {
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    const { data } = await authApi.requestOtp(phone);
    return { phone: data.phone, devCode: data.devCode };
  }, []);

  const loginWithOtp = useCallback(
    async (payload: {
      phone: string;
      code: string;
      firstName: string;
      lastName: string;
    }) => {
      const { data } = await authApi.verifyOtp(payload);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (code: string) => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      return user.permissions?.includes(code) ?? false;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      loginWithOtp,
      requestOtp,
      logout,
      hasPermission,
      refreshUser,
    }),
    [user, loading, login, loginWithOtp, requestOtp, logout, hasPermission, refreshUser],
  );

  // Keep axios aware when tokens cleared elsewhere
  void api;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

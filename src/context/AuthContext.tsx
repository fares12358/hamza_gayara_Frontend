import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { ApiRequestError, UNAUTHORIZED_EVENT } from '../api/client';
import type { User } from '../types';

interface AuthValue {
  user: User | null;
  status: 'loading' | 'ready' | 'offline';
  isOwner: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthValue['status']>('loading');

  const check = useCallback(() => {
    setStatus('loading');
    authApi
      .me()
      .then((me) => {
        setUser(me);
        setStatus('ready');
      })
      .catch((error: ApiRequestError) => {
        setUser(null);
        setStatus(error.status === 401 ? 'ready' : 'offline');
      });
  }, []);

  useEffect(() => {
    check();
    const onExpired = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onExpired);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onExpired);
  }, [check]);

  // The same object until the user or status changes, so readers do not re-render for nothing.
  const value = useMemo<AuthValue>(
    () => ({
      user,
      status,
      isOwner: user?.role === 'owner',
      retry: check,
      login: async (username, password) => setUser(await authApi.login(username, password)),
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, status, check],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

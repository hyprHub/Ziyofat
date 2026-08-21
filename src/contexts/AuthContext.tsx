import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { getToken, clearToken } from '../lib/apiClient';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; regKey: string }) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'rayhon_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Har bir rol dashboardga qaysi manzilga yo'naltirilishini shu yerda belgilaymiz
export const roleToPath: Record<UserRole, string> = {
  'super-admin': '/super-admin',
  admin: '/admin',
  kitchen: '/kitchen',
  waiter: '/waiter',
  cashier: '/cashier',
  ceo: '/ceo',
  customer: '/menu/rayhon/demo-table',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sahifa yangilanganda saqlangan sessiyani (JWT token) tekshirib, tiklaymiz
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      // Avval localStorage'dagi keshlangan userni ko'rsatamiz (tezroq UI), keyin serverdan tasdiqlaymiz
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setCurrentUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }

      const freshUser = await authService.me();
      if (freshUser) {
        setCurrentUser(freshUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
      } else {
        // Token yaroqsiz — sessiyani tozalaymiz
        clearToken();
        localStorage.removeItem(STORAGE_KEY);
        setCurrentUser(null);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await authService.login(email, password);

    if (!result) {
      setError('auth.invalidCredentials');
      return false;
    }

    setCurrentUser(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    return true;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; regKey: string }) => {
      setError(null);
      const result = await authService.register(data);
      if (!result.ok) {
        setError(result.message ?? 'auth.registerFailed');
        return false;
      }
      // Ro'yxatdan o'tgandan so'ng avtomatik login qilamiz
      return login(data.email, data.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

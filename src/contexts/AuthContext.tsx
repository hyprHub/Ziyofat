import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  // Sahifa yangilanganda saqlangan sessiyani tiklash
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCurrentUser(JSON.parse(raw));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);

    // Servis qatlami orqali autentifikatsiya (hozircha localStorage "backend",
    // kelajakda userService ichini fetch('/api/auth/login')ga almashtirish kifoya).
    const found = await userService.authenticate(email, password);

    if (!found) {
      setError('auth.invalidCredentials');
      return false;
    }

    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

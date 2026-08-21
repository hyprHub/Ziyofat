import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Restaurant, User } from '../types';
import { restaurantService, userService } from '../services';
import { useAuth } from './AuthContext';

interface PlatformContextType {
  restaurants: Restaurant[];
  users: User[];
  isLoading: boolean;
  error: string | null;
  createRestaurant: (data: Omit<Restaurant, 'id'>) => Promise<Restaurant>;
  updateRestaurant: (id: string, patch: Partial<Restaurant>) => Promise<void>;
  removeRestaurant: (id: string) => Promise<void>;
  createUser: (data: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, patch: Partial<User>) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  getRestaurantById: (id: string) => Restaurant | undefined;
  refresh: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
};

// Kassir, ofitsiant va oshpazga backend /restaurants va /users endpointlariga ruxsat bermaydi
// (401 qaytaradi). Shu rollar uchun bu so'rovlarni umuman yubormaymiz — aks holda har sahifada
// keraksiz 401 xatolar va sekinlik yuzaga keladi.
const ROLES_NEEDING_RESTAURANTS = ['super-admin', 'ceo', 'admin', 'customer'];
const ROLES_NEEDING_USERS = ['super-admin'];

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Foydalanuvchi hali aniqlanmagan bo'lsa (masalan ochiq mijoz menyusi), ehtiyot bo'lib
  // restoranlar ro'yxatini yuklashga urinamiz — lekin login qilingan holatda faqat ruxsati
  // bor rollar uchun so'rov yuboramiz.
  const role = currentUser?.role;
  const needsRestaurants = !role || ROLES_NEEDING_RESTAURANTS.includes(role);
  const needsUsers = !!role && ROLES_NEEDING_USERS.includes(role);

  const loadAll = useCallback(async () => {
    // Auth holati hali tasdiqlanmagan bo'lsa, kesh orqali vaqtincha ko'rsatilgan
    // (noaniq rolli) foydalanuvchi bilan keraksiz so'rov yubormaymiz.
    if (isAuthLoading) return;
    if (!needsRestaurants && !needsUsers) {
      setRestaurants([]);
      setUsers([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [restaurantsData, usersData] = await Promise.all([
        needsRestaurants ? restaurantService.list() : Promise.resolve([]),
        needsUsers ? userService.list() : Promise.resolve([]),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData);
    } catch {
      setError('common.loadError');
    } finally {
      setIsLoading(false);
    }
  }, [needsRestaurants, needsUsers, isAuthLoading]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createRestaurant = useCallback(async (data: Omit<Restaurant, 'id'>) => {
    const created = await restaurantService.create(data);
    setRestaurants((prev) => [...prev, created]);
    return created;
  }, []);

  const updateRestaurant = useCallback(async (id: string, patch: Partial<Restaurant>) => {
    const updated = await restaurantService.update(id, patch);
    if (updated) {
      setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  }, []);

  const removeRestaurant = useCallback(async (id: string) => {
    const ok = await restaurantService.remove(id);
    if (ok) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  const createUser = useCallback(async (data: Omit<User, 'id'>) => {
    const created = await userService.create(data);
    setUsers((prev) => [...prev, created]);
    return created;
  }, []);

  const updateUser = useCallback(async (id: string, patch: Partial<User>) => {
    const updated = await userService.update(id, patch);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    }
  }, []);

  const removeUser = useCallback(async (id: string) => {
    const ok = await userService.remove(id);
    if (ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }, []);

  const getRestaurantById = useCallback(
    (id: string) => restaurants.find((r) => r.id === id),
    [restaurants]
  );

  const value: PlatformContextType = {
    restaurants,
    users,
    isLoading,
    error,
    createRestaurant,
    updateRestaurant,
    removeRestaurant,
    createUser,
    updateUser,
    removeUser,
    getRestaurantById,
    refresh: loadAll,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

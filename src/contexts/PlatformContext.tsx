import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Restaurant, User } from '../types';
import { restaurantService, userService } from '../services';

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

export const PlatformProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [restaurantsData, usersData] = await Promise.all([
        restaurantService.list(),
        userService.list(),
      ]);
      setRestaurants(restaurantsData);
      setUsers(usersData);
    } catch {
      setError('common.loadError');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

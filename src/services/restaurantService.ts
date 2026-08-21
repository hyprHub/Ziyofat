import type { Restaurant } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

function mapRestaurant(raw: Record<string, unknown>): Restaurant {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: (n.name as string) ?? '',
    slug: (n.slug as string) ?? '',
    address: (n.address as string) ?? '',
    phone: (n.phone as string) ?? '',
    email: (n.email as string) ?? '',
    active: (n.active as boolean) ?? true,
  };
}

export const restaurantService = {
  async list(): Promise<Restaurant[]> {
    const raw = await api.get<Record<string, unknown>[]>('/restaurants');
    return (raw ?? []).map(mapRestaurant);
  },

  async getById(id: string): Promise<Restaurant | undefined> {
    const all = await restaurantService.list();
    return all.find((r) => r.id === id);
  },

  async getBySlug(slug: string): Promise<Restaurant | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/restaurants/slug/${slug}`);
      return mapRestaurant(raw);
    } catch {
      return undefined;
    }
  },

  async create(data: Omit<Restaurant, 'id'>): Promise<Restaurant> {
    const raw = await api.post<Record<string, unknown>>('/restaurants', data);
    return mapRestaurant(raw);
  },

  // ⚠️ Swagger'da PATCH/DELETE /restaurants hujjatlashtirilmagan — best-effort.
  async update(id: string, patch: Partial<Restaurant>): Promise<Restaurant | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/restaurants/${id}`, patch);
      return mapRestaurant(raw);
    } catch (err) {
      console.error('Restoranni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/restaurants/${id}`);
      return true;
    } catch (err) {
      console.error('Restoranni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

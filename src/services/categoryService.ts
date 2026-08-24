import type { Category } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toMultilingual, fromMultilingual } from '../lib/normalize';

function mapCategory(raw: Record<string, unknown>): Category {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: toMultilingual(n.name),
    slug: (n.slug as string) ?? '',
  };
}

export const categoryService = {
  async list(restaurantId?: string): Promise<Category[]> {
    const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
    const raw = await api.get<Record<string, unknown>[]>(`/categories${query}`);
    return (raw ?? []).map(mapCategory);
  },

  async getById(id: string): Promise<Category | undefined> {
    const all = await categoryService.list();
    return all.find((c) => c.id === id);
  },

  async create(data: Omit<Category, 'id'>): Promise<Category> {
    const raw = await api.post<Record<string, unknown>>('/categories', {
      name: fromMultilingual(data.name),
      slug: data.slug,
    });
    return mapCategory(raw);
  },

  async update(id: string, patch: Partial<Category>): Promise<Category | undefined> {
    try {
      const body: Record<string, unknown> = { ...patch };
      if (patch.name) body.name = fromMultilingual(patch.name);
      const raw = await api.patch<Record<string, unknown>>(`/categories/${id}`, body);
      return mapCategory(raw);
    } catch (err) {
      console.error('Kategoriyani yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/categories/${id}`);
      return true;
    } catch (err) {
      console.error('Kategoriyani o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

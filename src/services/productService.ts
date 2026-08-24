import type { Product } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toMultilingual, fromMultilingual } from '../lib/normalize';

function mapProduct(raw: Record<string, unknown>): Product {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: toMultilingual(n.name),
    description: toMultilingual(n.description),
    price: Number(n.price) || 0,
    categoryId: (n.categoryId as string) ?? (n.category_id as string) ?? '',
    image: (n.image as string) ?? (n.imageUrl as string) ?? '',
    available: n.available !== undefined ? Boolean(n.available) : true,
    prepTime: Number(n.prepTime) || 0,
  };
}

export const productService = {
  async list(restaurantId?: string): Promise<Product[]> {
    const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
    const raw = await api.get<Record<string, unknown>[]>(`/products${query}`);
    return (raw ?? []).map(mapProduct);
  },

  async getById(id: string): Promise<Product | undefined> {
    const all = await productService.list();
    return all.find((p) => p.id === id);
  },

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const raw = await api.post<Record<string, unknown>>('/products', {
      name: fromMultilingual(data.name),
      description: fromMultilingual(data.description),
      price: data.price,
      categoryId: data.categoryId,
      image: data.image,
      available: data.available,
      prepTime: data.prepTime,
    });
    return mapProduct(raw);
  },

  async update(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    try {
      const body: Record<string, unknown> = { ...patch };
      if (patch.name) body.name = fromMultilingual(patch.name);
      if (patch.description) body.description = fromMultilingual(patch.description);
      const raw = await api.patch<Record<string, unknown>>(`/products/${id}`, body);
      return mapProduct(raw);
    } catch (err) {
      console.error('Mahsulotni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (err) {
      console.error('Mahsulotni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },

  /** Mahsulot rasmini yuklash (multipart/form-data, field nomi "image") */
  async uploadImage(id: string, file: File): Promise<Product | undefined> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const raw = await api.upload<Record<string, unknown>>(`/products/${id}/image`, formData);
      return mapProduct(raw);
    } catch (err) {
      console.error('Rasmni yuklab bo\'lmadi:', err);
      return undefined;
    }
  },
};

import type { User } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

function mapUser(raw: Record<string, unknown>): User {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: (n.name as string) ?? '',
    email: (n.email as string) ?? '',
    password: '',
    role: n.role as User['role'],
    restaurantId: (n.restaurantId as string) ?? undefined,
  };
}

export const userService = {
  // Faqat super-admin uchun ruxsat etilgan (backend tomonidan cheklangan)
  async list(): Promise<User[]> {
    const raw = await api.get<Record<string, unknown>[]>('/users');
    return (raw ?? []).map(mapUser);
  },

  async getById(id: string): Promise<User | undefined> {
    const all = await userService.list();
    return all.find((u) => u.id === id);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const raw = await api.post<Record<string, unknown>>('/users', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      restaurantId: data.restaurantId,
    });
    return mapUser(raw);
  },

<<<<<<< HEAD
  // ⚠️ Swagger'da /users uchun PATCH/DELETE hujjatlashtirilmagan. Backend qo'llab-quvvatlamasa,
  // bu chaqiruvlar xatolik qaytaradi — chaqiruvchi joyda try/catch bilan ushlanadi.
=======
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  async update(id: string, patch: Partial<User>): Promise<User | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/users/${id}`, patch);
      return mapUser(raw);
    } catch (err) {
<<<<<<< HEAD
      console.error('Foydalanuvchini yangilab bo\'lmadi (backend PATCH /users/:id ni qo\'llamasligi mumkin):', err);
=======
      console.error('Foydalanuvchini yangilab bo\'lmadi:', err);
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (err) {
<<<<<<< HEAD
      console.error('Foydalanuvchini o\'chirib bo\'lmadi (backend DELETE /users/:id ni qo\'llamasligi mumkin):', err);
=======
      console.error('Foydalanuvchini o\'chirib bo\'lmadi:', err);
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
      return false;
    }
  },
};

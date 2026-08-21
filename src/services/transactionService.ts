import type { Transaction } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate } from '../lib/normalize';

function mapTransaction(raw: Record<string, unknown>): Transaction {
  const n = normalizeId(raw);
  return {
    id: n.id,
    restaurantId: (n.restaurantId as string) ?? '',
    type: (n.type as Transaction['type']) ?? 'expense',
    category: (n.category as string) ?? '',
    description: (n.description as string) ?? '',
    amount: Number(n.amount) || 0,
    createdAt: toDate(n.createdAt),
    createdBy: (n.createdBy as string) ?? '',
  };
}

export const transactionService = {
  /** restaurantId berilmasa, barcha restoranlar bo'yicha (CEO ko'rinishi uchun) */
  async list(restaurantId?: string): Promise<Transaction[]> {
    const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
    const raw = await api.get<Record<string, unknown>[]>(`/transactions${query}`);
    return (raw ?? []).map(mapTransaction);
  },

  async getById(id: string, restaurantId?: string): Promise<Transaction | undefined> {
    const all = await transactionService.list(restaurantId);
    return all.find((t) => t.id === id);
  },

  /** Kassir tomonidan qo'lda kiritilgan kirim/chiqim — restoranga bog'liq */
  async create(
    restaurantId: string,
    data: Omit<Transaction, 'id' | 'restaurantId' | 'createdAt'>
  ): Promise<Transaction> {
    const raw = await api.post<Record<string, unknown>>(`/restaurants/${restaurantId}/transactions`, {
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      createdBy: data.createdBy,
    });
    return mapTransaction(raw);
  },

  async update(id: string, patch: Partial<Transaction>): Promise<Transaction | undefined> {
    try {
      // Swagger: PATCH /transactions (id bodyda beriladi, pathda emas)
      const raw = await api.patch<Record<string, unknown>>('/transactions', { id, ...patch });
      return mapTransaction(raw);
    } catch (err) {
      console.error('Tranzaksiyani yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  // ⚠️ Swagger'da DELETE /transactions hujjatlashtirilmagan — best-effort.
  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/transactions/${id}`);
      return true;
    } catch (err) {
      console.error('Tranzaksiyani o\'chirib bo\'lmadi (backend bu amalni qo\'llamasligi mumkin):', err);
      return false;
    }
  },
};

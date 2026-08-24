<<<<<<< HEAD
import type { PlatformPayment, PlatformPaymentStats, PlatformPaymentStatus } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate } from '../lib/normalize';

function mapPayment(raw: Record<string, unknown>): PlatformPayment {
  const n = normalizeId(raw);
  return {
    id: n.id,
    restaurantId: (n.restaurantId as string) ?? '',
    amount: Number(n.amount ?? 0),
    status: (n.status as PlatformPaymentStatus) ?? 'pending',
    createdAt: toDate(n.createdAt),
  };
=======
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

export type PlatformPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/**
 * Diqqat: bular restoran ichidagi buyurtma/kassir tranzaksiyalari EMAS —
 * bu "platforma billing" to'lovlari (restoranlarning Rayhon platformasiga
 * to'lagan obuna to'lovlari). Backend: GET/POST /payments, /payments/{id}, /payments/stats.
 */
export interface PlatformPayment {
  id: string;
  [key: string]: unknown;
}

export interface PlatformPaymentStats {
  [key: string]: unknown;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
}

export interface PlatformPaymentFilters {
  status?: PlatformPaymentStatus;
  restaurantId?: string;
<<<<<<< HEAD
  from?: string; // ISO date
  to?: string; // ISO date
=======
  from?: string;
  to?: string;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
}

function buildQuery(filters?: PlatformPaymentFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.restaurantId) params.set('restaurantId', filters.restaurantId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const platformPaymentService = {
<<<<<<< HEAD
  async list(filters?: PlatformPaymentFilters): Promise<PlatformPayment[]> {
    const raw = await api.get<Record<string, unknown>[]>(`/payments${buildQuery(filters)}`);
    return (raw ?? []).map(mapPayment);
  },

  async stats(): Promise<PlatformPaymentStats> {
    const raw = await api.get<Record<string, unknown>>('/payments/stats');
    return {
      totalPaid: Number(raw?.totalPaid ?? 0),
      pendingCount: Number(raw?.pendingCount ?? 0),
      monthlyRevenue: Number(raw?.monthlyRevenue ?? 0),
    };
=======
  /** GET /payments (super-admin, ceo) — platforma billing to'lovlari ro'yxati */
  async list(filters?: PlatformPaymentFilters): Promise<PlatformPayment[]> {
    const raw = await api.get<Record<string, unknown>[]>(`/payments${buildQuery(filters)}`);
    return (raw ?? []).map((r) => normalizeId(r) as PlatformPayment);
  },

  /** GET /payments/stats — totalPaid, pendingCount, monthlyRevenue */
  async stats(): Promise<PlatformPaymentStats | null> {
    try {
      return await api.get<PlatformPaymentStats>('/payments/stats');
    } catch (err) {
      console.error('To\'lovlar statistikasi olinmadi:', err);
      return null;
    }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  },

  async getById(id: string): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/payments/${id}`);
<<<<<<< HEAD
      return mapPayment(raw);
=======
      return normalizeId(raw) as PlatformPayment;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    } catch {
      return undefined;
    }
  },

<<<<<<< HEAD
  async create(data: Omit<PlatformPayment, 'id' | 'createdAt'>): Promise<PlatformPayment> {
    const raw = await api.post<Record<string, unknown>>('/payments', data);
    return mapPayment(raw);
  },

  async update(id: string, patch: Partial<PlatformPayment>): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/payments/${id}`, patch);
      return mapPayment(raw);
=======
  async create(data: Record<string, unknown>): Promise<PlatformPayment> {
    const raw = await api.post<Record<string, unknown>>('/payments', data);
    return normalizeId(raw) as PlatformPayment;
  },

  async update(id: string, patch: Record<string, unknown>): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/payments/${id}`, patch);
      return normalizeId(raw) as PlatformPayment;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    } catch (err) {
      console.error('To\'lovni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/payments/${id}`);
      return true;
    } catch (err) {
      console.error('To\'lovni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

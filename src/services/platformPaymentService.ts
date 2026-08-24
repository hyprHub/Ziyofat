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
}

export interface PlatformPaymentFilters {
  status?: PlatformPaymentStatus;
  restaurantId?: string;
  from?: string;
  to?: string;
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
  },

  async getById(id: string): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/payments/${id}`);
      return normalizeId(raw) as PlatformPayment;
    } catch {
      return undefined;
    }
  },

  async create(data: Record<string, unknown>): Promise<PlatformPayment> {
    const raw = await api.post<Record<string, unknown>>('/payments', data);
    return normalizeId(raw) as PlatformPayment;
  },

  async update(id: string, patch: Record<string, unknown>): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/payments/${id}`, patch);
      return normalizeId(raw) as PlatformPayment;
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

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
}

export interface PlatformPaymentFilters {
  status?: PlatformPaymentStatus;
  restaurantId?: string;
  from?: string; // ISO date
  to?: string; // ISO date
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
  },

  async getById(id: string): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/payments/${id}`);
      return mapPayment(raw);
    } catch {
      return undefined;
    }
  },

  async create(data: Omit<PlatformPayment, 'id' | 'createdAt'>): Promise<PlatformPayment> {
    const raw = await api.post<Record<string, unknown>>('/payments', data);
    return mapPayment(raw);
  },

  async update(id: string, patch: Partial<PlatformPayment>): Promise<PlatformPayment | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/payments/${id}`, patch);
      return mapPayment(raw);
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

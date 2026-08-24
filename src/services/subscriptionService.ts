<<<<<<< HEAD
import type { Subscription, SubscriptionStats, SubscriptionPlan, SubscriptionStatus } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate } from '../lib/normalize';

function mapSubscription(raw: Record<string, unknown>): Subscription {
  const n = normalizeId(raw);
  return {
    id: n.id,
    restaurantId: (n.restaurantId as string) ?? '',
    plan: (n.plan as SubscriptionPlan) ?? 'basic',
    status: (n.status as SubscriptionStatus) ?? 'trial',
    price: Number(n.price ?? 0),
    startDate: toDate(n.startDate),
    renewalDate: toDate(n.renewalDate),
  };
=======
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'basic' | 'standard' | 'premium';

/**
 * Backend javobining aniq shakli Swagger'da to'liq berilmagan (schema yo'q),
 * shuning uchun keng qamrovli interfeys ishlatamiz — mavjud maydonlar qanday
 * nomlangan bo'lishidan qat'iy nazar UI kerakli qiymatlarni topib oladi.
 */
export interface Subscription {
  id: string;
  [key: string]: unknown;
}

export interface SubscriptionStats {
  [key: string]: unknown;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  restaurantId?: string;
}

function buildQuery(filters?: SubscriptionFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.plan) params.set('plan', filters.plan);
  if (filters.restaurantId) params.set('restaurantId', filters.restaurantId);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const subscriptionService = {
<<<<<<< HEAD
  async list(filters?: SubscriptionFilters): Promise<Subscription[]> {
    const raw = await api.get<Record<string, unknown>[]>(`/subscriptions${buildQuery(filters)}`);
    return (raw ?? []).map(mapSubscription);
  },

  async stats(): Promise<SubscriptionStats> {
    const raw = await api.get<Record<string, unknown>>('/subscriptions/stats');
    return {
      activeCount: Number(raw?.activeCount ?? 0),
      trialCount: Number(raw?.trialCount ?? 0),
      byPlan: (raw?.byPlan as Record<string, number>) ?? {},
      expiringSoon: Number(raw?.expiringSoon ?? 0),
    };
=======
  /** GET /subscriptions (super-admin, ceo) — ?status=&plan=&restaurantId= */
  async list(filters?: SubscriptionFilters): Promise<Subscription[]> {
    const raw = await api.get<Record<string, unknown>[]>(`/subscriptions${buildQuery(filters)}`);
    return (raw ?? []).map((r) => normalizeId(r) as Subscription);
  },

  /** GET /subscriptions/stats — activeCount, trialCount, byPlan, expiringSoon */
  async stats(): Promise<SubscriptionStats | null> {
    try {
      return await api.get<SubscriptionStats>('/subscriptions/stats');
    } catch (err) {
      console.error('Obuna statistikasi olinmadi:', err);
      return null;
    }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  },

  async getById(id: string): Promise<Subscription | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/subscriptions/${id}`);
<<<<<<< HEAD
      return mapSubscription(raw);
=======
      return normalizeId(raw) as Subscription;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    } catch {
      return undefined;
    }
  },

<<<<<<< HEAD
  async create(data: Omit<Subscription, 'id'>): Promise<Subscription> {
    const raw = await api.post<Record<string, unknown>>('/subscriptions', data);
    return mapSubscription(raw);
  },

  async update(id: string, patch: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/subscriptions/${id}`, patch);
      return mapSubscription(raw);
=======
  async create(data: Record<string, unknown>): Promise<Subscription> {
    const raw = await api.post<Record<string, unknown>>('/subscriptions', data);
    return normalizeId(raw) as Subscription;
  },

  async update(id: string, patch: Record<string, unknown>): Promise<Subscription | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/subscriptions/${id}`, patch);
      return normalizeId(raw) as Subscription;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    } catch (err) {
      console.error('Obunani yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/subscriptions/${id}`);
      return true;
    } catch (err) {
      console.error('Obunani o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

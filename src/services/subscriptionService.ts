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
  },

  async getById(id: string): Promise<Subscription | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/subscriptions/${id}`);
      return mapSubscription(raw);
    } catch {
      return undefined;
    }
  },

  async create(data: Omit<Subscription, 'id'>): Promise<Subscription> {
    const raw = await api.post<Record<string, unknown>>('/subscriptions', data);
    return mapSubscription(raw);
  },

  async update(id: string, patch: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/subscriptions/${id}`, patch);
      return mapSubscription(raw);
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

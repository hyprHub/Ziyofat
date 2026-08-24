import { api } from '../lib/apiClient';

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'year';

/**
 * Backend javobining aniq shakli Swagger'da berilmagan (faqat "Dashboard overview" deb yozilgan),
 * shuning uchun keng qamrovli/moslashuvchan interfeys ishlatamiz — mavjud maydonlar qanday nomlangan
 * bo'lishidan qat'iy nazar CEO sahifasi kerakli qiymatlarni topib oladi.
 */
export interface AnalyticsOverview {
  [key: string]: unknown;
}

export interface RestaurantComparisonEntry {
  [key: string]: unknown;
}

export const analyticsService = {
  async overview(period: AnalyticsPeriod, restaurantId?: string): Promise<AnalyticsOverview | null> {
    try {
      const params = new URLSearchParams({ period });
      if (restaurantId) params.set('restaurantId', restaurantId);
      return await api.get<AnalyticsOverview>(`/analytics/overview?${params.toString()}`);
    } catch (err) {
      console.error('Analytics overview olinmadi:', err);
      return null;
    }
  },

  /** CEO uchun — barcha restoranlar bo'yicha taqqoslash */
  async restaurantsComparison(): Promise<RestaurantComparisonEntry[]> {
    try {
      const raw = await api.get<RestaurantComparisonEntry[]>('/analytics/restaurants');
      return raw ?? [];
    } catch (err) {
      console.error('Restoranlar taqqoslash ma\'lumoti olinmadi:', err);
      return [];
    }
  },
};

/** Turli mumkin bo'lgan maydon nomlaridan birinchi topilganini raqam sifatida qaytaradi */
export function pickNumber(obj: Record<string, unknown> | null | undefined, keys: string[]): number {
  if (!obj) return 0;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
}

export function pickValue<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  keys: string[]
): T | undefined {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key] as T;
  }
  return undefined;
}

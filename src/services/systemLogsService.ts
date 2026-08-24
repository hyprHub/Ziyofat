import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

export interface SystemLog {
  id: string;
  [key: string]: unknown;
}

export interface SystemLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
}

function buildQuery(filters?: SystemLogFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.action) params.set('action', filters.action);
  if (filters.entity) params.set('entity', filters.entity);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const systemLogsService = {
  /** GET /system-logs (super-admin, ceo) — sahifalash va filtrlar bilan */
  async list(filters?: SystemLogFilters): Promise<SystemLog[]> {
    const raw = await api.get<unknown>(`/system-logs${buildQuery(filters)}`);
    // Backend sahifalangan { data, total, page } yoki to'g'ridan-to'g'ri massiv qaytarishi mumkin
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>)?.items)
        ? (raw as Record<string, unknown>).items
        : Array.isArray((raw as Record<string, unknown>)?.logs)
          ? (raw as Record<string, unknown>).logs
          : [];
    return (items as Record<string, unknown>[]).map((r) => normalizeId(r) as SystemLog);
  },

  async getById(id: string): Promise<SystemLog | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/system-logs/${id}`);
      return normalizeId(raw) as SystemLog;
    } catch {
      return undefined;
    }
  },
};

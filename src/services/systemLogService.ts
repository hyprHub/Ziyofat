import type { SystemLog, SystemLogsPage } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate } from '../lib/normalize';

function mapLog(raw: Record<string, unknown>): SystemLog {
  const n = normalizeId(raw);
  return {
    ...n,
    id: n.id,
    userId: (n.userId as string) ?? undefined,
    action: (n.action as string) ?? '',
    entity: (n.entity as string) ?? undefined,
    createdAt: toDate(n.createdAt),
  };
}

export interface SystemLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string; // ISO date
  to?: string; // ISO date
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

export const systemLogService = {
  /**
   * Backend ba'zan { logs, total, page, limit } shaklida, ba'zan to'g'ridan-to'g'ri
   * massiv qaytarishi mumkin — ikkalasini ham qo'llab-quvvatlaymiz.
   */
  async list(filters?: SystemLogFilters): Promise<SystemLogsPage> {
    const raw = await api.get<Record<string, unknown>[] | Record<string, unknown>>(
      `/system-logs${buildQuery(filters)}`
    );
    if (Array.isArray(raw)) {
      return { logs: raw.map(mapLog) };
    }
    const obj = (raw ?? {}) as Record<string, unknown>;
    const logsRaw = (obj.logs as Record<string, unknown>[]) ?? [];
    return {
      logs: logsRaw.map(mapLog),
      total: obj.total as number | undefined,
      page: obj.page as number | undefined,
      limit: obj.limit as number | undefined,
    };
  },

  async getById(id: string): Promise<SystemLog | undefined> {
    try {
      const raw = await api.get<Record<string, unknown>>(`/system-logs/${id}`);
      return mapLog(raw);
    } catch {
      return undefined;
    }
  },
};

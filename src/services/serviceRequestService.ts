import type { ServiceRequest } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate } from '../lib/normalize';

function mapServiceRequest(raw: Record<string, unknown>): ServiceRequest {
  const n = normalizeId(raw);
  return {
    id: n.id,
    tableId: (n.tableId as string) ?? '',
    type: (n.type as ServiceRequest['type']) ?? 'waiter',
    status: (n.status as ServiceRequest['status']) ?? 'pending',
    createdAt: toDate(n.createdAt),
  };
}

export const serviceRequestService = {
  async list(): Promise<ServiceRequest[]> {
    const raw = await api.get<Record<string, unknown>[]>('/service-requests');
    return (raw ?? []).map(mapServiceRequest);
  },

  async create(data: Omit<ServiceRequest, 'id'>): Promise<ServiceRequest> {
    const raw = await api.post<Record<string, unknown>>('/service-requests', {
      tableId: data.tableId,
      type: data.type,
    });
    return mapServiceRequest(raw);
  },

  async update(id: string, patch: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/service-requests/${id}`, patch);
      return mapServiceRequest(raw);
    } catch (err) {
      console.error('So\'rovni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/service-requests/${id}`);
      return true;
    } catch (err) {
      console.error('So\'rovni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

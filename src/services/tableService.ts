import type { Table } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

function mapTable(raw: Record<string, unknown>): Table {
  const n = normalizeId(raw);
  return {
    id: n.id,
    number: Number(n.number) || 0,
    seats: Number(n.seats) || 0,
    status: (n.status as Table['status']) ?? 'available',
    currentOrderId: (n.currentOrderId as string) ?? undefined,
  };
}

export const tableService = {
  async list(): Promise<Table[]> {
    const raw = await api.get<Record<string, unknown>[]>('/tables');
    return (raw ?? []).map(mapTable);
  },

  async getById(id: string): Promise<Table | undefined> {
    const all = await tableService.list();
    return all.find((t) => t.id === id);
  },

  async create(data: Omit<Table, 'id'>): Promise<Table> {
    const raw = await api.post<Record<string, unknown>>('/tables', data);
    return mapTable(raw);
  },

  async update(id: string, patch: Partial<Table>): Promise<Table | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/tables/${id}`, patch);
      return mapTable(raw);
    } catch (err) {
      console.error('Stolni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/tables/${id}`);
      return true;
    } catch (err) {
      console.error('Stolni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

import type { Customer } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId } from '../lib/normalize';

function mapCustomer(raw: Record<string, unknown>): Customer {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: (n.name as string) ?? '',
    phone: (n.phone as string) ?? undefined,
    email: (n.email as string) ?? undefined,
  };
}

export const customerService = {
  async list(): Promise<Customer[]> {
    const raw = await api.get<Record<string, unknown>[]>('/customers');
    return (raw ?? []).map(mapCustomer);
  },

  async getById(id: string): Promise<Customer | undefined> {
    const all = await customerService.list();
    return all.find((c) => c.id === id);
  },

  async create(data: Omit<Customer, 'id'>): Promise<Customer> {
    const raw = await api.post<Record<string, unknown>>('/customers', data);
    return mapCustomer(raw);
  },

  async update(id: string, patch: Partial<Customer>): Promise<Customer | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/customers/${id}`, patch);
      return mapCustomer(raw);
    } catch (err) {
      console.error('Mijozni yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/customers/${id}`);
      return true;
    } catch (err) {
      console.error('Mijozni o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

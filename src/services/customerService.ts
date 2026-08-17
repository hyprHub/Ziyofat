import type { Customer } from '../types';
import { collection } from '../lib/db';
import { seedCustomers } from '../data/seed/customers.seed';

const table = collection<Customer>('customers', seedCustomers);

export const customerService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Omit<Customer, 'id'>) => table.create({ ...data, id: `customer-${Date.now()}` }),
  update: (id: string, patch: Partial<Customer>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

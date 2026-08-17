import type { Order } from '../types';
import { collection } from '../lib/db';
import { seedOrders } from '../data/seed/orders.seed';

const table = collection<Order>('orders', seedOrders);

export const orderService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Order) => table.create(data),
  update: (id: string, patch: Partial<Order>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
  peekAll: () => table.peekAll(),
};

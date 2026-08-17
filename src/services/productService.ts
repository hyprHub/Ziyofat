import type { Product } from '../types';
import { collection } from '../lib/db';
import { seedProducts } from '../data/seed/products.seed';

const table = collection<Product>('products', seedProducts);

export const productService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Omit<Product, 'id'>) => table.create({ ...data, id: `prod-${Date.now()}` }),
  update: (id: string, patch: Partial<Product>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

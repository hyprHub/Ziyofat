import type { Category } from '../types';
import { collection } from '../lib/db';
import { seedCategories } from '../data/seed/categories.seed';

const table = collection<Category>('categories', seedCategories);

export const categoryService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Omit<Category, 'id'>) => table.create({ ...data, id: `cat-${Date.now()}` }),
  update: (id: string, patch: Partial<Category>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

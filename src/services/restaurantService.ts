import type { Restaurant } from '../types';
import { collection } from '../lib/db';
import { seedRestaurants } from '../data/seed/restaurants.seed';

const table = collection<Restaurant>('restaurants', seedRestaurants);

export const restaurantService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  getBySlug: async (slug: string) => {
    const all = await table.getAll();
    return all.find((r) => r.slug === slug);
  },
  create: (data: Omit<Restaurant, 'id'>) =>
    table.create({ ...data, id: `rest-${Date.now()}` }),
  update: (id: string, patch: Partial<Restaurant>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

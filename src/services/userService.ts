import type { User } from '../types';
import { collection, delay } from '../lib/db';
import { seedUsers } from '../data/seed/users.seed';

const table = collection<User>('users', seedUsers);

export const userService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Omit<User, 'id'>) => table.create({ ...data, id: `user-${Date.now()}` }),
  update: (id: string, patch: Partial<User>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),

  async authenticate(email: string, password: string): Promise<User | null> {
    const all = await table.getAll();
    const found = all.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    return delay(found ?? null);
  },
};

import type { User } from '../../types';

// NOTE: Bu login/parol ma'lumotlari faqat LOKAL TEST uchun.
// Kelajakda bu qism real backend (API) bilan almashtiriladi.
// Barcha demo akkauntlar uchun parol: demo123
export const seedUsers: User[] = [
  {
    id: 'user-1',
    name: 'Super Admin',
    email: 'super@rayhon.uz',
    password: 'demo123',
    role: 'super-admin',
  },
  {
    id: 'user-2',
    name: 'Aziz',
    email: 'aziz@rayhon.uz',
    password: 'demo123',
    role: 'admin',
    restaurantId: 'rest-1',
  },
  {
    id: 'user-3',
    name: 'Kitchen Staff',
    email: 'kitchen@rayhon.uz',
    password: 'demo123',
    role: 'kitchen',
    restaurantId: 'rest-1',
  },
  {
    id: 'user-4',
    name: 'Waiter',
    email: 'waiter@rayhon.uz',
    password: 'demo123',
    role: 'waiter',
    restaurantId: 'rest-1',
  },
  {
    id: 'user-5',
    name: 'Malika',
    email: 'cashier@rayhon.uz',
    password: 'demo123',
    role: 'cashier',
    restaurantId: 'rest-1',
  },
  {
    id: 'user-6',
    name: 'Sardor',
    email: 'ceo@rayhon.uz',
    password: 'demo123',
    role: 'ceo',
    restaurantId: 'rest-1',
  },
];

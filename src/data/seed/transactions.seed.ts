import type { Transaction } from '../../types';

const now = new Date('2026-08-11T11:00:00.000Z');

// Kassa orqali qo'lda kiritilgan kirim/chiqim operatsiyalari (masalan naqd kirim, ta'minotchiga
// to'lov, kommunal xarajatlar). Buyurtma to'lovlari bundan mustasno — ular `orders` orqali hisoblanadi.
export const seedTransactions: Transaction[] = [
  {
    id: 'txn-1',
    restaurantId: 'rest-1',
    type: 'expense',
    category: "Ta'minot",
    description: 'Sabzavot va go\'sht yetkazib berish',
    amount: 850000,
    createdAt: new Date(now.getTime() - 3 * 24 * 3600000),
    createdBy: 'user-cashier-1',
  },
  {
    id: 'txn-2',
    restaurantId: 'rest-1',
    type: 'expense',
    category: 'Kommunal',
    description: "Svet va gaz to'lovi",
    amount: 420000,
    createdAt: new Date(now.getTime() - 2 * 24 * 3600000),
    createdBy: 'user-cashier-1',
  },
  {
    id: 'txn-3',
    restaurantId: 'rest-1',
    type: 'income',
    category: 'Boshqa',
    description: "Ijaraga berilgan zal uchun kirim",
    amount: 300000,
    createdAt: new Date(now.getTime() - 1 * 24 * 3600000),
    createdBy: 'user-cashier-1',
  },
  {
    id: 'txn-4',
    restaurantId: 'rest-1',
    type: 'expense',
    category: 'Xodimlar maoshi',
    description: "Ish haqi avans to'lovi",
    amount: 1200000,
    createdAt: new Date(now.getTime() - 5 * 3600000),
    createdBy: 'user-cashier-1',
  },
];

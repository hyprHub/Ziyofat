import type { Transaction } from '../types';
import { collection } from '../lib/db';
import { seedTransactions } from '../data/seed/transactions.seed';

// ⚠️ BACKEND OGOHLANTIRISHI:
// Hozircha bu servis `collection()` orqali localStorage'da ishlaydi (demo/frontend-only rejim).
// Real backend tayyor bo'lganda, quyidagi metodlarni mos API endpointlarga almashtiring, masalan:
//   list()   -> GET    /api/restaurants/:id/transactions
//   create() -> POST   /api/restaurants/:id/transactions
//   remove() -> DELETE /api/transactions/:id
// Boshqa hech narsa (context, komponentlar) o'zgarishi shart emas — chunki ular shu servis
// interfeysi orqali ishlaydi.
const table = collection<Transaction>('transactions', seedTransactions);

export const transactionService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Transaction) => table.create(data),
  update: (id: string, patch: Partial<Transaction>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
  peekAll: () => table.peekAll(),
};

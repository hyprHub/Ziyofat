import type { Table } from '../types';
import { collection } from '../lib/db';
import { seedTables } from '../data/seed/tables.seed';

const table = collection<Table>('tables', seedTables);

export const tableService = {
  list: () => table.getAll(),
  getById: (id: string) => table.getById(id),
  create: (data: Omit<Table, 'id'>) => table.create({ ...data, id: `table-${Date.now()}` }),
  update: (id: string, patch: Partial<Table>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

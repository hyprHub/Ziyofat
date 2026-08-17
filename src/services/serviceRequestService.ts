import type { ServiceRequest } from '../types';
import { collection } from '../lib/db';

const table = collection<ServiceRequest>('service_requests', []);

export const serviceRequestService = {
  list: () => table.getAll(),
  create: (data: Omit<ServiceRequest, 'id'>) =>
    table.create({ ...data, id: `request-${Date.now()}` }),
  update: (id: string, patch: Partial<ServiceRequest>) => table.update(id, patch),
  remove: (id: string) => table.remove(id),
};

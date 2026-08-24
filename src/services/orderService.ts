import type { Order, OrderStatus, PaymentMethod } from '../types';
import { api } from '../lib/apiClient';
import { normalizeId, toDate, toDateOrUndefined } from '../lib/normalize';

function mapOrder(raw: Record<string, unknown>): Order {
  const n = normalizeId(raw);
  const items = Array.isArray(n.items)
    ? (n.items as Record<string, unknown>[]).map((it) => ({
        productId: (it.productId as string) ?? '',
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
      }))
    : [];
  return {
    id: n.id,
    orderNumber: Number(n.orderNumber) || 0,
    restaurantId: (n.restaurantId as string) ?? '',
    tableId: (n.tableId as string) ?? '',
    customerId: (n.customerId as string) ?? undefined,
    items,
    subtotal: Number(n.subtotal) || 0,
    tax: Number(n.tax) || 0,
    total: Number(n.total) || 0,
    status: (n.status as OrderStatus) ?? 'pending',
    createdAt: toDate(n.createdAt),
    updatedAt: toDate(n.updatedAt),
    paymentMethod: (n.paymentMethod as PaymentMethod) ?? undefined,
    paidAt: toDateOrUndefined(n.paidAt),
  };
}

export const orderService = {
  /** restaurantId berilmasa, ruxsat doirasidagi barcha buyurtmalar qaytadi */
  async list(restaurantId?: string): Promise<Order[]> {
    const query = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
    const raw = await api.get<Record<string, unknown>[]>(`/orders${query}`);
    return (raw ?? []).map(mapOrder);
  },

  async getById(id: string): Promise<Order | undefined> {
    const all = await orderService.list();
    return all.find((o) => o.id === id);
  },

  /** Yangi buyurtma yaratish — narx/soliq/order raqamini backend hisoblaydi */
  async create(data: {
    tableId: string;
    restaurantId?: string;
    customerId?: string;
    items: { productId: string; quantity: number }[];
  }): Promise<Order> {
    const raw = await api.post<Record<string, unknown>>('/orders', data);
    return mapOrder(raw);
  },

  /** Buyurtmani to'lash (kassir) */
  async pay(id: string, paymentMethod: PaymentMethod): Promise<Order | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/orders/${id}/pay`, { paymentMethod });
      return mapOrder(raw);
    } catch (err) {
      console.error('Buyurtmani to\'lab bo\'lmadi:', err);
      throw err;
    }
  },

  /** Buyurtma holatini yangilash (oshxona/ofitsiant) */
  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    try {
      const raw = await api.patch<Record<string, unknown>>(`/orders/${id}/status`, { status });
      return mapOrder(raw);
    } catch (err) {
      console.error('Buyurtma holatini yangilab bo\'lmadi:', err);
      return undefined;
    }
  },

  /**
   * Umumiy patch — asosan status o'zgarishi uchun ishlatiladi (backward-compat).
   * Item ro'yxatini o'zgartirish uchun maxsus endpoint hujjatlashtirilmagan, shu sabab
   * bu holatda best-effort umumiy PATCH /orders/:id chaqiramiz.
   */
  async update(id: string, patch: Partial<Order>): Promise<Order | undefined> {
    if (patch.status && Object.keys(patch).every((k) => k === 'status' || k === 'updatedAt')) {
      return orderService.updateStatus(id, patch.status);
    }
    if (patch.paymentMethod && patch.status === 'completed') {
      return orderService.pay(id, patch.paymentMethod);
    }
    try {
      const raw = await api.patch<Record<string, unknown>>(`/orders/${id}`, patch);
      return mapOrder(raw);
    } catch (err) {
      console.error('Buyurtmani yangilab bo\'lmadi (backend bu amalni qo\'llamasligi mumkin):', err);
      return undefined;
    }
  },

  async remove(id: string): Promise<boolean> {
    try {
      await api.delete(`/orders/${id}`);
      return true;
    } catch (err) {
      console.error('Buyurtmani o\'chirib bo\'lmadi:', err);
      return false;
    }
  },
};

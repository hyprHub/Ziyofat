/**
 * Haqiqiy mijoz oqimi uchun — QR kodni skanerlagan mijoz HECH QACHON login qilmaydi.
 * Shu sabab bu servis faqat backend'ning "public" (tokensiz, security: []) endpointlarini ishlatadi:
 *   GET  /public/restaurants/{slug}/menu
 *   POST /public/restaurants/{slug}/tables/{tableId}/orders
 *   POST /public/restaurants/{slug}/tables/{tableId}/service-requests
 *
 * Muhim: bu servis `RestaurantContext`dan MUSTAQIL ishlaydi, chunki RestaurantContext
 * faqat login qilgan xodimlar (kassir/ofitsiant/oshpaz va h.k.) uchun mo'ljallangan va
 * `currentUser` bo'lmasa hech narsa yuklamaydi.
 */
import { api } from '../lib/apiClient';
import { normalizeId, toMultilingual } from '../lib/normalize';
import type { Category, Product, Order } from '../types';

function mapCategory(raw: Record<string, unknown>): Category {
  const n = normalizeId(raw);
  return { id: n.id, name: toMultilingual(n.name), slug: (n.slug as string) ?? '' };
}

function mapProduct(raw: Record<string, unknown>): Product {
  const n = normalizeId(raw);
  return {
    id: n.id,
    name: toMultilingual(n.name),
    description: toMultilingual(n.description),
    price: Number(n.price) || 0,
    categoryId: (n.categoryId as string) ?? (n.category_id as string) ?? '',
    image: (n.image as string) ?? (n.imageUrl as string) ?? '',
    available: n.available !== undefined ? Boolean(n.available) : true,
    prepTime: Number(n.prepTime) || 0,
  };
}

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
    status: (n.status as Order['status']) ?? 'pending',
    createdAt: new Date(n.createdAt as string) || new Date(),
    updatedAt: new Date(n.updatedAt as string) || new Date(),
  };
}

export const publicService = {
  /** Restoran menyusini (kategoriya + mahsulotlar) tokensiz oladi — QR sahifasi uchun */
  async getMenu(slug: string): Promise<{ categories: Category[]; products: Product[] }> {
    const raw = await api.get<Record<string, unknown>>(`/public/restaurants/${encodeURIComponent(slug)}/menu`);
    // Backend har xil shaklda qaytarishi mumkin: { categories, products } yoki to'g'ridan-to'g'ri massiv sifatida
    const categoriesRaw = Array.isArray(raw?.categories) ? raw.categories : [];
    const productsRaw = Array.isArray(raw?.products) ? raw.products : [];
    return {
      categories: (categoriesRaw as Record<string, unknown>[]).map(mapCategory),
      products: (productsRaw as Record<string, unknown>[]).map(mapProduct),
    };
  },

  /** Mijoz stoldan buyurtma beradi — login talab qilinmaydi */
  async placeOrder(
    slug: string,
    tableId: string,
    items: { productId: string; quantity: number }[]
  ): Promise<Order> {
    const raw = await api.post<Record<string, unknown>>(
      `/public/restaurants/${encodeURIComponent(slug)}/tables/${encodeURIComponent(tableId)}/orders`,
      { items }
    );
    return mapOrder(raw);
  },

  /** Mijoz xizmat so'rovi (ofitsiant chaqirish / hisob so'rash / suv so'rash) — login talab qilinmaydi */
  async createServiceRequest(
    slug: string,
    tableId: string,
    type: 'waiter' | 'bill' | 'water'
  ): Promise<void> {
    await api.post(
      `/public/restaurants/${encodeURIComponent(slug)}/tables/${encodeURIComponent(tableId)}/service-requests`,
      { type }
    );
  },
};

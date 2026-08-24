export interface MultilingualText {
  uz: string;
  ru: string;
  en: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type TableStatus = 'available' | 'occupied' | 'waiting' | 'cleaning' | 'reserved';
export type UserRole = 'super-admin' | 'admin' | 'kitchen' | 'waiter' | 'customer' | 'cashier' | 'ceo';
export type PaymentMethod = 'cash' | 'card' | 'click' | 'payme';

export interface Product {
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  price: number;
  categoryId: string;
  image: string;
  available: boolean;
  prepTime: number; // in minutes
}

export interface Category {
  id: string;
  name: MultilingualText;
  slug: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  restaurantId: string;
  tableId: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: PaymentMethod;
  paidAt?: Date;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  restaurantId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface ServiceRequest {
  id: string;
  tableId: string;
  type: 'waiter' | 'bill' | 'water';
  status: 'pending' | 'completed';
  createdAt: Date;
}

// Kassadagi qo'lda kiritiladigan kirim/chiqim operatsiyalari (order to'lovlaridan tashqari)
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  restaurantId: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  createdAt: Date;
  createdBy: string; // user id (odatda kassir)
}
<<<<<<< HEAD

// ==================== Platform: Subscriptions / Payments / System Logs / Settings ====================
// Bu 4 tasi platforma (super-admin) darajasidagi — restoran to'lash uchun ishlatadigan obuna va billing.
// Kassadagi order to'lovlari (Transaction) bilan aralashtirmang.

export type SubscriptionPlan = 'basic' | 'standard' | 'premium';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';

export interface Subscription {
  id: string;
  restaurantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number;
  startDate: Date;
  renewalDate: Date;
}

export interface SubscriptionStats {
  activeCount: number;
  trialCount: number;
  byPlan: Record<string, number>;
  expiringSoon: number;
}

export type PlatformPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PlatformPayment {
  id: string;
  restaurantId: string;
  amount: number;
  status: PlatformPaymentStatus;
  createdAt: Date;
}

export interface PlatformPaymentStats {
  totalPaid: number;
  pendingCount: number;
  monthlyRevenue: number;
}

export interface SystemLog {
  id: string;
  userId?: string;
  action: string;
  entity?: string;
  createdAt: Date;
  [key: string]: unknown;
}

export interface SystemLogsPage {
  logs: SystemLog[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface PlatformSettings {
  [key: string]: unknown;
}
=======
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da

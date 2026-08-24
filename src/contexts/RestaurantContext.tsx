import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Order,
  Table,
  Product,
  Category,
  OrderStatus,
  TableStatus,
  ServiceRequest,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types';
import {
  orderService,
  tableService,
  productService,
  categoryService,
  serviceRequestService,
  transactionService,
} from '../services';
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  orders: Order[];
  tables: Table[];
  products: Product[];
  categories: Category[];
  serviceRequests: ServiceRequest[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateTableStatus: (tableId: string, status: TableStatus) => Promise<void>;
<<<<<<< HEAD
=======
  createTable: (data: { number: number; seats: number }) => Promise<Table>;
  removeTable: (tableId: string) => Promise<boolean>;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  createOrder: (order: {
    tableId: string;
    customerId?: string;
    items: { productId: string; quantity: number }[];
  }) => Promise<Order | undefined>;
  addOrderItem: (orderId: string, productId: string, quantity: number) => Promise<void>;
  updateProductAvailability: (productId: string, available: boolean) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (productId: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
<<<<<<< HEAD
=======
  createCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  createServiceRequest: (tableId: string, type: 'waiter' | 'bill' | 'water') => Promise<void>;
  completeServiceRequest: (requestId: string) => Promise<void>;
  payOrder: (orderId: string, paymentMethod: PaymentMethod) => Promise<void>;
  addTransaction: (data: {
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    createdBy: string;
  }) => Promise<void>;
  removeTransaction: (transactionId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getTableById: (tableId: string) => Table | undefined;
  getProductById: (productId: string) => Product | undefined;
  refresh: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  // CEO va super-admin barcha restoranlarni ko'radi (restaurantId cheklovisiz),
  // boshqa rollar (kassir, ofitsiant, oshpaz, admin) faqat o'z restoraniga tegishli ma'lumotni ko'radi.
  const restaurantId =
    currentUser && !['ceo', 'super-admin'].includes(currentUser.role) ? currentUser.restaurantId : undefined;

  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    // Auth holati hali tasdiqlanmagan bo'lsa (masalan sahifa yangilangan payt, kesh
    // orqali vaqtincha ko'rsatilgan foydalanuvchi bilan) — bu yerda so'rov yubormaymiz.
    // Aks holda eski/nomukammal restaurantId bilan backendga so'rov ketib,
    // "restaurantId is required" kabi keraksiz xato chiqishi mumkin.
    if (isAuthLoading) return;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    // Promise.all o'rniga Promise.allSettled ishlatamiz: agar bitta endpoint
    // (masalan service-requests) foydalanuvchi roli uchun 403/ruxsatsiz bo'lsa,
    // bu qolgan barcha ma'lumotlarni (orders, tables, products...) ham
    // butunlay bloklab qo'ymasligi kerak. Promise.all bilan birinchi xato
    // hammasini rad etib, sahifa "bo'sh/muzlagan" ko'rinishda qolar edi.
<<<<<<< HEAD
    const results = await Promise.allSettled([
      orderService.list(restaurantId),
      tableService.list(),
      productService.list(),
      categoryService.list(),
      serviceRequestService.list(),
      transactionService.list(restaurantId),
=======
    // Tranzaksiyalar (moliyaviy hisobot) faqat kassir/admin/CEO/super-admin uchun kerak —
    // backend boshqa rollar (ofitsiant, oshpaz) uchun 403 qaytaradi, shuning uchun
    // ularga bu so'rovni umuman yubormaymiz (keraksiz xato va tarmoq so'rovining oldini olamiz).
    const canViewTransactions = !!currentUser && ['cashier', 'admin', 'ceo', 'super-admin'].includes(currentUser.role);

    const results = await Promise.allSettled([
      orderService.list(restaurantId),
      tableService.list(),
      productService.list(restaurantId),
      categoryService.list(restaurantId),
      serviceRequestService.list(),
      canViewTransactions ? transactionService.list(restaurantId) : Promise.resolve([]),
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    ]);

    const [ordersRes, tablesRes, productsRes, categoriesRes, requestsRes, transactionsRes] = results;

    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
    if (tablesRes.status === 'fulfilled') setTables(tablesRes.value);
    if (productsRes.status === 'fulfilled') setProducts(productsRes.value);
    if (categoriesRes.status === 'fulfilled') setCategories(categoriesRes.value);
    if (requestsRes.status === 'fulfilled') setServiceRequests(requestsRes.value);
    if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value);

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      failed.forEach((r) => {
        if (r.status === 'rejected') console.error('Ma\'lumot yuklashda xatolik:', r.reason);
      });
      // Faqat HAMMASI muvaffaqiyatsiz bo'lsa, umumiy xato ko'rsatamiz.
      // Qisman xato (masalan faqat service-requests) sahifani butunlay bloklamasligi kerak.
      if (failed.length === results.length) {
        setError('common.loadError');
      }
    }

    setIsLoading(false);
  }, [currentUser, restaurantId, isAuthLoading]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const updated = await orderService.updateStatus(orderId, status);
    if (updated) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)));
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: TableStatus) => {
    const updated = await tableService.update(tableId, { status });
    if (updated) {
      setTables((prev) => prev.map((table) => (table.id === tableId ? updated : table)));
    }
  }, []);

<<<<<<< HEAD
=======
  const createTable = useCallback(async (data: { number: number; seats: number }) => {
    const created = await tableService.create({ number: data.number, seats: data.seats, status: 'available' });
    setTables((prev) => [...prev, created].sort((a, b) => a.number - b.number));
    return created;
  }, []);

  const removeTable = useCallback(async (tableId: string) => {
    const ok = await tableService.remove(tableId);
    if (ok) {
      setTables((prev) => prev.filter((table) => table.id !== tableId));
    }
    return ok;
  }, []);

>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  const createOrder = useCallback(
    async (orderData: { tableId: string; customerId?: string; items: { productId: string; quantity: number }[] }) => {
      try {
        const created = await orderService.create({
          tableId: orderData.tableId,
          customerId: orderData.customerId,
          restaurantId,
          items: orderData.items,
        });
        setOrders((prev) => [...prev, created]);

        const updatedTable = await tableService.update(created.tableId, {
          status: 'occupied',
          currentOrderId: created.id,
        });
        if (updatedTable) {
          setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
        }

        return created;
      } catch (err) {
        console.error('Buyurtma yaratib bo\'lmadi:', err);
        return undefined;
      }
    },
    [restaurantId]
  );

  const addOrderItem = useCallback(
    async (orderId: string, productId: string, quantity: number) => {
      const order = orders.find((o) => o.id === orderId);
      const product = products.find((p) => p.id === productId);
      if (!order || !product) return;

      const existingItemIndex = order.items.findIndex((item) => item.productId === productId);
      const newItems = [...order.items];

      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        newItems.push({ productId, quantity, price: product.price });
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const updated = await orderService.update(orderId, {
        items: newItems,
        subtotal,
        tax,
        total,
        updatedAt: new Date(),
      });
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      }
    },
    [orders, products]
  );

  const updateProductAvailability = useCallback(async (productId: string, available: boolean) => {
    const updated = await productService.update(productId, { available });
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    }
  }, []);

  const createProduct = useCallback(async (data: Omit<Product, 'id'>) => {
    const created = await productService.create(data);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(async (productId: string, patch: Partial<Product>) => {
    const updated = await productService.update(productId, patch);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    }
  }, []);

  const removeProduct = useCallback(async (productId: string) => {
    const ok = await productService.remove(productId);
    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }, []);

<<<<<<< HEAD
=======
  const createCategory = useCallback(async (data: Omit<Category, 'id'>) => {
    const created = await categoryService.create(data);
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  const createServiceRequest = useCallback(
    async (tableId: string, type: 'waiter' | 'bill' | 'water') => {
      const created = await serviceRequestService.create({
        tableId,
        type,
        status: 'pending',
        createdAt: new Date(),
      });
      setServiceRequests((prev) => [...prev, created]);
    },
    []
  );

  const completeServiceRequest = useCallback(async (requestId: string) => {
    const updated = await serviceRequestService.update(requestId, { status: 'completed' });
    if (updated) {
      setServiceRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
    }
  }, []);

  const payOrder = useCallback(
    async (orderId: string, paymentMethod: PaymentMethod) => {
      const order = orders.find((o) => o.id === orderId);
      try {
        const updatedOrder = await orderService.pay(orderId, paymentMethod);
        if (updatedOrder) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        }
        if (order) {
          const updatedTable = await tableService.update(order.tableId, {
            status: 'cleaning',
            currentOrderId: undefined,
          });
          if (updatedTable) {
            setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
          }
        }
      } catch (err) {
        console.error('To\'lovni amalga oshirib bo\'lmadi:', err);
        setError('common.actionError');
      }
    },
    [orders]
  );

  const addTransaction = useCallback(
    async (data: {
      type: TransactionType;
      category: string;
      description: string;
      amount: number;
      createdBy: string;
    }) => {
      if (!restaurantId && currentUser?.role !== 'ceo') {
        console.error('Tranzaksiya yaratish uchun restaurantId aniqlanmadi (currentUser.restaurantId bo\'sh)');
        setError('common.actionError');
        return;
      }
      try {
        const created = await transactionService.create(restaurantId!, data);
        setTransactions((prev) => [...prev, created]);
      } catch (err) {
        console.error('Tranzaksiya yaratib bo\'lmadi:', err);
        setError('common.actionError');
      }
    },
    [restaurantId, currentUser]
  );

  const removeTransaction = useCallback(async (transactionId: string) => {
    const ok = await transactionService.remove(transactionId);
    if (ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    }
  }, []);

  const getOrderById = useCallback(
    (orderId: string) => orders.find((order) => order.id === orderId),
    [orders]
  );

  const getTableById = useCallback(
    (tableId: string) => tables.find((table) => table.id === tableId),
    [tables]
  );

  const getProductById = useCallback(
    (productId: string) => products.find((product) => product.id === productId),
    [products]
  );

  const value: RestaurantContextType = {
    orders,
    tables,
    products,
    categories,
    serviceRequests,
    transactions,
    isLoading,
    error,
    updateOrderStatus,
    updateTableStatus,
<<<<<<< HEAD
=======
    createTable,
    removeTable,
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    createOrder,
    addOrderItem,
    updateProductAvailability,
    createProduct,
    updateProduct,
    removeProduct,
<<<<<<< HEAD
=======
    createCategory,
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
    createServiceRequest,
    completeServiceRequest,
    payOrder,
    addTransaction,
    removeTransaction,
    getOrderById,
    getTableById,
    getProductById,
    refresh: loadAll,
  };

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
};

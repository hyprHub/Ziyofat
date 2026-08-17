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
  createOrder: (
    order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'restaurantId'>
  ) => Promise<Order>;
  addOrderItem: (orderId: string, productId: string, quantity: number) => Promise<void>;
  updateProductAvailability: (productId: string, available: boolean) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (productId: string, patch: Partial<Product>) => Promise<void>;
  removeProduct: (productId: string) => Promise<void>;
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

const DEFAULT_RESTAURANT_ID = 'rest-1';

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersData, tablesData, productsData, categoriesData, requestsData, transactionsData] =
        await Promise.all([
          orderService.list(),
          tableService.list(),
          productService.list(),
          categoryService.list(),
          serviceRequestService.list(),
          transactionService.list(),
        ]);
      setOrders(ordersData);
      setTables(tablesData);
      setProducts(productsData);
      setCategories(categoriesData);
      setServiceRequests(requestsData);
      setTransactions(transactionsData);
    } catch {
      setError('common.loadError');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const updated = await orderService.update(orderId, { status, updatedAt: new Date() });
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

  const createOrder = useCallback(
    async (
      orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'restaurantId'>
    ) => {
      const existing = orderService.peekAll();
      const nextNumber =
        existing.length > 0 ? Math.max(...existing.map((o) => o.orderNumber)) + 1 : 101;

      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        orderNumber: nextNumber,
        restaurantId: DEFAULT_RESTAURANT_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await orderService.create(newOrder);
      setOrders((prev) => [...prev, created]);

      const updatedTable = await tableService.update(created.tableId, {
        status: 'occupied',
        currentOrderId: created.id,
      });
      if (updatedTable) {
        setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
      }

      return created;
    },
    []
  );

  const addOrderItem = useCallback(
    async (orderId: string, productId: string, quantity: number) => {
      const order = orders.find((o) => o.id === orderId);
      const product = products.find((p) => p.id === productId);
      if (!order || !product) return;

      const existingItemIndex = order.items.findIndex((item) => item.productId === productId);
      let newItems = [...order.items];

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
      const updatedOrder = await orderService.update(orderId, {
        status: 'completed',
        paymentMethod,
        paidAt: new Date(),
        updatedAt: new Date(),
      });
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
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        restaurantId: DEFAULT_RESTAURANT_ID,
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        createdAt: new Date(),
        createdBy: data.createdBy,
      };
      const created = await transactionService.create(newTransaction);
      setTransactions((prev) => [...prev, created]);
    },
    []
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
    createOrder,
    addOrderItem,
    updateProductAvailability,
    createProduct,
    updateProduct,
    removeProduct,
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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { usePlatform } from '../../contexts/PlatformContext';
import { formatCurrency } from '../../utils/helpers';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  ChefHat,
  Activity,
  ArrowUp,
  BarChart3,
  UserPlus,
  X,
  Copy,
  Check,
  Smile,
  Settings as SettingsIcon,
  Save,
} from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import type { User, UserRole, Customer, OrderStatus, TableStatus } from '../../types';

const STAFF_ROLES: UserRole[] = ['cashier', 'ceo', 'waiter', 'kitchen'];
const emptyStaff = { name: '', email: '', password: '', role: 'cashier' as UserRole };

type AdminTab = 'dashboard' | 'orders' | 'tables' | 'menu' | 'kitchen' | 'customers' | 'reports' | 'settings';

const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-danger/10 text-danger',
  confirmed: 'bg-muted-gold/10 text-muted-gold',
  preparing: 'bg-terracotta/10 text-terracotta',
  ready: 'bg-success/10 text-success',
  served: 'bg-sage/10 text-sage',
  completed: 'bg-espresso/10 text-espresso',
  cancelled: 'bg-taupe/10 text-taupe',
};

const tableStatusColors: Record<TableStatus, string> = {
  available: 'bg-success/10 text-success',
  occupied: 'bg-danger/10 text-danger',
  waiting: 'bg-muted-gold/10 text-muted-gold',
  cleaning: 'bg-sage/10 text-sage',
  reserved: 'bg-taupe/10 text-taupe',
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const {
    orders,
    tables,
    products,
    categories,
    isLoading,
    updateProductAvailability,
    updateTableStatus,
  } = useRestaurant();
  const { currentUser } = useAuth();
  const { createUser, restaurants, updateRestaurant } = usePlatform();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<{ user: User; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Customers tab uchun alohida yuklanadi (RestaurantContext'da yo'q)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'customers') return;
    let cancelled = false;
    setCustomersLoading(true);
    setCustomersError(null);
    customerService
      .list()
      .then((data) => {
        if (!cancelled) setCustomers(data);
      })
      .catch(() => {
        if (!cancelled) setCustomersError('Mijozlar ro\'yxatini yuklab bo\'lmadi.');
      })
      .finally(() => {
        if (!cancelled) setCustomersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Settings tab uchun restoran ma'lumotlari formasi
  const myRestaurant = restaurants.find((r) => r.id === currentUser?.restaurantId) ?? restaurants[0];
  const [settingsForm, setSettingsForm] = useState({ name: '', address: '', phone: '', email: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (myRestaurant) {
      setSettingsForm({
        name: myRestaurant.name ?? '',
        address: myRestaurant.address ?? '',
        phone: myRestaurant.phone ?? '',
        email: myRestaurant.email ?? '',
      });
    }
  }, [myRestaurant?.id]);

  const handleSaveSettings = async () => {
    if (!myRestaurant) return;
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      await updateRestaurant(myRestaurant.id, settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } finally {
      setSettingsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  const closeStaffModal = () => {
    setShowStaffModal(false);
    setStaffForm(emptyStaff);
    setSaveError(null);
    setCreatedStaff(null);
    setCopied(false);
  };

  const handleCreateStaff = async () => {
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password.trim()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const created = await createUser({
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        password: staffForm.password,
        role: staffForm.role,
        restaurantId: currentUser?.restaurantId,
      });
      setCreatedStaff({ user: created, password: staffForm.password });
    } catch (err) {
      // Backend ushbu rolni yaratishga ruxsat bermasligi mumkin (masalan CEO — super-admin talab qilishi mumkin)
      setSaveError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStaff) return;
    const text = `Email: ${createdStaff.user.email}\nParol: ${createdStaff.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  // Calculate KPIs
  const todayRevenue = orders
    .filter(o => o.status === 'completed' || o.status === 'served')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? todayRevenue / totalOrders : 0;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;

  // Top products
  const productStats = orders
    .flatMap(o => o.items)
    .reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

  const topProducts = Object.entries(productStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([productId, quantity]) => ({
      product: products.find(p => p.id === productId),
      quantity
    }));

  // Recent activity
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-espresso to-deep-brown text-white shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <ChefHat className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rayhon</h1>
              <p className="text-sm text-latte">Restaurant Admin</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {(
            [
              { id: 'dashboard', label: t('navigation.dashboard'), icon: '📊' },
              { id: 'orders', label: t('navigation.orders'), icon: '🛒' },
              { id: 'tables', label: t('navigation.tables'), icon: '🪑' },
              { id: 'menu', label: t('navigation.menu'), icon: '📋' },
              { id: 'kitchen', label: t('navigation.kitchen'), icon: '👨\u200d🍳' },
              { id: 'staff', label: t('navigation.staff'), icon: '👥', onClick: () => setShowStaffModal(true) },
              { id: 'customers', label: t('navigation.customers'), icon: '😊' },
              { id: 'reports', label: t('navigation.reports'), icon: '📈' },
              { id: 'settings', label: t('navigation.settings'), icon: '⚙️' },
            ] as { id: AdminTab | 'staff'; label: string; icon: string; onClick?: () => void }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={item.onClick ?? (() => setActiveTab(item.id as AdminTab))}
              className={`w-full text-left px-4 py-3 rounded-button transition-all flex items-center gap-3 ${
                activeTab === item.id
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-latte hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-button bg-white/5">
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center font-bold">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{currentUser?.name}</div>
              <div className="text-xs text-latte">Administrator</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {/* Header */}
        <header className="bg-white border-b border-soft-sand shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-espresso mb-1">
                  {t('dashboard.greeting')} {currentUser?.name} 👋
                </h2>
                <p className="text-taupe">{t('dashboard.performance')}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Xodim qo'shish
                </button>
                <LanguageSwitcher />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {activeTab === 'dashboard' && (
        <div className="p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-terracotta to-danger text-white rounded-card p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-button">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-semibold">12%</span>
                </div>
              </div>
              <div className="text-sm opacity-90 mb-2">{t('dashboard.todayRevenue')}</div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(todayRevenue)}
              </div>
              <div className="text-xs opacity-75">vs yesterday +850,000 UZS</div>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-success flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success bg-success/10 px-2 py-1 rounded-button">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-semibold">8</span>
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('dashboard.totalOrders')}</div>
              <div className="text-3xl font-bold text-espresso mb-1">{totalOrders}</div>
              <div className="text-xs text-taupe">+8 since yesterday</div>
            </div>

            {/* Average Order */}
            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted-gold to-latte flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success bg-success/10 px-2 py-1 rounded-button">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-semibold">5%</span>
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('dashboard.avgOrder')}</div>
              <div className="text-3xl font-bold text-espresso mb-1">
                {formatCurrency(avgOrder)}
              </div>
              <div className="text-xs text-taupe">Per transaction</div>
            </div>

            {/* Tables */}
            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-espresso to-deep-brown flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-button ${
                  occupiedTables > tables.length * 0.7
                    ? 'text-danger bg-danger/10'
                    : 'text-success bg-success/10'
                }`}>
                  <Activity className="w-4 h-4" />
                  <span className="font-semibold">
                    {Math.round((occupiedTables / tables.length) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('dashboard.occupiedTables')}</div>
              <div className="text-3xl font-bold text-espresso mb-1">
                {occupiedTables} / {tables.length}
              </div>
              <div className="text-xs text-taupe">Tables occupied</div>
            </div>
          </div>

          {/* Charts & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Status */}
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <Clock className="w-5 h-5 text-terracotta" />
                  Order Status
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-danger"></div>
                    <span className="text-taupe">Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-espresso text-lg">{pendingOrders}</span>
                    <div className="w-24 h-2 bg-soft-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-danger rounded-full"
                        style={{ width: `${(pendingOrders / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-terracotta"></div>
                    <span className="text-taupe">Preparing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-espresso text-lg">{preparingOrders}</span>
                    <div className="w-24 h-2 bg-soft-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta rounded-full"
                        style={{ width: `${(preparingOrders / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-taupe">Ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-espresso text-lg">{readyOrders}</span>
                    <div className="w-24 h-2 bg-soft-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${(readyOrders / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-terracotta" />
                  Top Dishes Today
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topProducts.map((item, idx) => {
                    const product = item.product;
                    if (!product) return null;
                    const maxQty = topProducts[0]?.quantity || 1;
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-button bg-gradient-to-br from-terracotta to-danger text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="w-16 h-16 rounded-button overflow-hidden bg-soft-sand flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name.en}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-espresso mb-1">
                            {product.name.en}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-soft-sand rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-terracotta to-danger rounded-full transition-all duration-500"
                                style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-terracotta">
                              {item.quantity} sold
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
            <div className="p-6 border-b border-soft-sand flex items-center justify-between">
              <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                <Activity className="w-5 h-5 text-terracotta" />
                Recent Orders
              </h3>
              <button className="text-terracotta hover:text-danger font-semibold text-sm transition-colors">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft-sand">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Table
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => {
                    const table = tables.find(t => t.id === order.tableId);
                    const statusColors = {
                      pending: 'bg-danger/10 text-danger',
                      confirmed: 'bg-muted-gold/10 text-muted-gold',
                      preparing: 'bg-terracotta/10 text-terracotta',
                      ready: 'bg-success/10 text-success',
                      served: 'bg-sage/10 text-sage',
                      completed: 'bg-espresso/10 text-espresso',
                      cancelled: 'bg-taupe/10 text-taupe'
                    };
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-soft-sand hover:bg-cream transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-warm-white'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-espresso">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-taupe">
                          Table {table?.number}
                        </td>
                        <td className="px-6 py-4 text-taupe">
                          {order.items.length} items
                        </td>
                        <td className="px-6 py-4 font-semibold text-espresso">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-button text-xs font-bold ${statusColors[order.status]}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-taupe">
                          {order.createdAt.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-8">
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-terracotta" />
                  {t('navigation.orders')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft-sand">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Order</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Table</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-taupe text-sm">
                          Hozircha buyurtmalar yo'q
                        </td>
                      </tr>
                    )}
                    {[...orders]
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((order, idx) => {
                        const table = tables.find((t) => t.id === order.tableId);
                        return (
                          <tr
                            key={order.id}
                            className={`border-b border-soft-sand hover:bg-cream transition-colors ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-warm-white'
                            }`}
                          >
                            <td className="px-6 py-4 font-bold text-espresso">#{order.orderNumber}</td>
                            <td className="px-6 py-4 text-taupe">Table {table?.number ?? '-'}</td>
                            <td className="px-6 py-4 text-taupe">{order.items.length} items</td>
                            <td className="px-6 py-4 font-semibold text-espresso">{formatCurrency(order.total)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-button text-xs font-bold ${orderStatusColors[order.status]}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-taupe">
                              {order.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              🪑 {t('navigation.tables')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="bg-white rounded-card p-5 shadow-sm border-2 border-soft-sand text-center">
                  <div className="text-2xl font-bold text-espresso mb-1">#{table.number}</div>
                  <div className="text-xs text-taupe mb-3">{table.seats} o'rin</div>
                  <select
                    value={table.status}
                    onChange={(e) => updateTableStatus(table.id, e.target.value as TableStatus)}
                    className={`w-full text-xs font-bold rounded-button px-2 py-2 border-none outline-none ${tableStatusColors[table.status]}`}
                  >
                    <option value="available">available</option>
                    <option value="occupied">occupied</option>
                    <option value="waiting">waiting</option>
                    <option value="cleaning">cleaning</option>
                    <option value="reserved">reserved</option>
                  </select>
                </div>
              ))}
              {tables.length === 0 && (
                <div className="col-span-full text-center text-taupe py-8">Stollar topilmadi</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              📋 {t('navigation.menu')}
            </h3>
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} className="mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-taupe mb-3">{cat.name.uz || cat.name.en}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catProducts.map((product) => (
                      <div key={product.id} className="bg-white rounded-card p-4 shadow-sm border-2 border-soft-sand flex items-center gap-4">
                        <img src={product.image} alt={product.name.en} className="w-16 h-16 rounded-button object-cover bg-soft-sand flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-espresso truncate">{product.name.uz || product.name.en}</div>
                          <div className="text-sm text-taupe">{formatCurrency(product.price)}</div>
                        </div>
                        <button
                          onClick={() => updateProductAvailability(product.id, !product.available)}
                          className={`px-3 py-1.5 rounded-button text-xs font-bold flex-shrink-0 ${
                            product.available ? 'bg-success/10 text-success' : 'bg-taupe/10 text-taupe'
                          }`}
                        >
                          {product.available ? 'Mavjud' : 'Tugagan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {products.length === 0 && <div className="text-center text-taupe py-8">Menyu bo'sh</div>}
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-terracotta" /> {t('navigation.kitchen')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['pending', 'preparing', 'ready'] as OrderStatus[]).map((status) => (
                <div key={status} className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
                  <div className={`px-4 py-3 font-bold text-sm uppercase ${orderStatusColors[status]}`}>{status}</div>
                  <div className="p-4 space-y-3">
                    {orders.filter((o) => o.status === status).map((order) => {
                      const table = tables.find((t) => t.id === order.tableId);
                      return (
                        <div key={order.id} className="border border-soft-sand rounded-button p-3">
                          <div className="flex justify-between text-sm font-semibold text-espresso mb-1">
                            <span>#{order.orderNumber}</span>
                            <span>Stol {table?.number ?? '-'}</span>
                          </div>
                          <div className="text-xs text-taupe">{order.items.length} ta mahsulot</div>
                        </div>
                      );
                    })}
                    {orders.filter((o) => o.status === status).length === 0 && (
                      <div className="text-xs text-taupe text-center py-4">Bo'sh</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="p-8">
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <Smile className="w-5 h-5 text-terracotta" /> {t('navigation.customers')}
                </h3>
              </div>
              {customersLoading ? (
                <div className="p-8 text-center text-taupe text-sm">Yuklanmoqda...</div>
              ) : customersError ? (
                <div className="p-8 text-center text-danger text-sm">{customersError}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-soft-sand">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Ism</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Telefon</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-taupe">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-taupe text-sm">Mijozlar topilmadi</td>
                        </tr>
                      )}
                      {customers.map((c) => (
                        <tr key={c.id} className="border-b border-soft-sand hover:bg-cream transition-colors">
                          <td className="px-6 py-4 font-semibold text-espresso">{c.name}</td>
                          <td className="px-6 py-4 text-taupe">{c.phone ?? '-'}</td>
                          <td className="px-6 py-4 text-taupe">{c.email ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-8">
            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-terracotta" /> {t('navigation.reports')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-card p-6 shadow-sm border-2 border-soft-sand">
                <div className="text-sm text-taupe mb-2">Jami tushum</div>
                <div className="text-2xl font-bold text-espresso">{formatCurrency(todayRevenue)}</div>
              </div>
              <div className="bg-white rounded-card p-6 shadow-sm border-2 border-soft-sand">
                <div className="text-sm text-taupe mb-2">Jami buyurtmalar</div>
                <div className="text-2xl font-bold text-espresso">{totalOrders}</div>
              </div>
              <div className="bg-white rounded-card p-6 shadow-sm border-2 border-soft-sand">
                <div className="text-sm text-taupe mb-2">O'rtacha chek</div>
                <div className="text-2xl font-bold text-espresso">{formatCurrency(avgOrder)}</div>
              </div>
            </div>
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h4 className="text-lg font-bold text-espresso flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-terracotta" /> Eng ko'p sotilgan taomlar
                </h4>
              </div>
              <div className="p-6 space-y-4">
                {topProducts.map((item, idx) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-espresso font-medium">{product.name.uz || product.name.en}</span>
                      <span className="font-bold text-terracotta">{item.quantity} dona</span>
                    </div>
                  );
                })}
                {topProducts.length === 0 && <div className="text-center text-taupe text-sm">Ma'lumot yo'q</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 max-w-xl">
            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-terracotta" /> {t('navigation.settings')}
            </h3>
            {!myRestaurant ? (
              <div className="text-taupe text-sm">Restoran topilmadi.</div>
            ) : (
              <div className="bg-white rounded-card p-6 shadow-sm border-2 border-soft-sand space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Restoran nomi</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Manzil</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Telefon</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                {settingsSaved && (
                  <div className="text-sm text-success bg-success/10 rounded-button px-4 py-3">Saqlandi!</div>
                )}
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="w-full py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {settingsSaving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Saqlash
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staff creation modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-espresso/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-soft-sand">
              <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-terracotta" />
                Yangi xodim qo'shish
              </h3>
              <button onClick={closeStaffModal} className="text-taupe hover:text-espresso transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdStaff ? (
              <div className="p-6 space-y-4">
                <div className="bg-success/10 text-success rounded-button px-4 py-3 text-sm font-semibold">
                  Xodim muvaffaqiyatli yaratildi!
                </div>
                <div className="bg-cream rounded-button p-4 space-y-2 border-2 border-soft-sand">
                  <div>
                    <div className="text-xs text-taupe">Ism</div>
                    <div className="font-semibold text-espresso">{createdStaff.user.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-taupe">Rol</div>
                    <div className="font-semibold text-espresso capitalize">{createdStaff.user.role}</div>
                  </div>
                  <div>
                    <div className="text-xs text-taupe">Email (login)</div>
                    <div className="font-semibold text-espresso">{createdStaff.user.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-taupe">Parol</div>
                    <div className="font-semibold text-espresso">{createdStaff.password}</div>
                  </div>
                </div>
                <p className="text-xs text-taupe">
                  Bu email va parolni xodimga bering — u shu ma'lumotlar bilan login sahifasidan kira oladi.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyCredentials}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-button border-2 border-soft-sand text-espresso font-semibold hover:border-terracotta transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Nusxalandi' : 'Nusxalash'}
                  </button>
                  <button
                    onClick={closeStaffModal}
                    className="flex-1 py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Ism</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="Ism Familiya"
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Email</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="kassir@rayhon.uz"
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Parol</label>
                  <input
                    type="text"
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Kamida 6 belgi"
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">Rol</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                  >
                    {STAFF_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {staffForm.role === 'ceo' && (
                    <p className="text-xs text-taupe mt-1.5">
                      Eslatma: CEO hisobini yaratish backend tomonidan super-admin darajasini talab qilishi mumkin.
                    </p>
                  )}
                </div>

                {saveError && (
                  <div className="text-sm text-danger bg-danger/10 rounded-button px-4 py-3">{saveError}</div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeStaffModal}
                    className="flex-1 py-3 rounded-button border-2 border-soft-sand text-espresso font-semibold hover:border-terracotta transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleCreateStaff}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Yaratish"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

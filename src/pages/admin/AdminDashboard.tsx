import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
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
  BarChart3
} from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { orders, tables, products, isLoading } = useRestaurant();
  const { currentUser } = useAuth();

  if (isLoading) return <PageLoader />;

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
          {[
            { label: t('navigation.dashboard'), icon: '📊', active: true },
            { label: t('navigation.orders'), icon: '🛒' },
            { label: t('navigation.tables'), icon: '🪑' },
            { label: t('navigation.menu'), icon: '📋' },
            { label: t('navigation.kitchen'), icon: '👨‍🍳' },
            { label: t('navigation.staff'), icon: '👥' },
            { label: t('navigation.customers'), icon: '😊' },
            { label: t('navigation.reports'), icon: '📈' },
            { label: t('navigation.settings'), icon: '⚙️' },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-4 py-3 rounded-button transition-all flex items-center gap-3 ${
                item.active
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
                <div className="text-right">
                  <div className="text-2xl font-bold text-espresso">15:30</div>
                  <div className="text-sm text-taupe">11 Aug 2026</div>
                </div>
                <LanguageSwitcher />
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
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
      </div>
    </div>
  );
}

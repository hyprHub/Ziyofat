import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { usePlatform } from '../../contexts/PlatformContext';
import { formatCurrency } from '../../utils/helpers';
import PageLoader from '../../components/common/PageLoader';
import {
  LineChart,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  Building2,
  Users,
  Wallet,
  Receipt,
  Grid3x3,
  Plus,
  Trash2,
} from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import { useAuth } from '../../contexts/AuthContext';

const periods = ['today', 'week', 'month', 'year'] as const;

export default function CEODashboard() {
  const { t } = useTranslation();
  const {
    orders,
    tables,
    products,
    transactions,
    isLoading: restaurantLoading,
    createTable,
    removeTable,
  } = useRestaurant();
  const { restaurants, isLoading: platformLoading } = usePlatform();
  const { currentUser } = useAuth();
  const [period, setPeriod] = useState<(typeof periods)[number]>('month');
  const [view, setView] = useState<'analytics' | 'tables'>('analytics');

  // Yangi stol qo'shish formasi
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('4');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  const handleAddTable = async () => {
    const number = parseInt(newTableNumber, 10);
    const seats = parseInt(newTableSeats, 10);
    if (!number || number <= 0) {
      setTableError("Stol raqamini to'g'ri kiriting.");
      return;
    }
    if (tables.some((tb) => tb.number === number)) {
      setTableError(`#${number} raqamli stol allaqachon mavjud.`);
      return;
    }
    setTableError(null);
    setIsAddingTable(true);
    try {
      await createTable({ number, seats: seats > 0 ? seats : 4 });
      setNewTableNumber('');
      setNewTableSeats('4');
    } catch {
      setTableError("Stol qo'shib bo'lmadi. Qaytadan urinib ko'ring.");
    } finally {
      setIsAddingTable(false);
    }
  };

  const handleRemoveTable = async (tableId: string, tableNumber: number) => {
    if (!window.confirm(`#${tableNumber} raqamli stolni o'chirmoqchimisiz?`)) return;
    await removeTable(tableId);
  };

  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed' || o.status === 'served'),
    [orders]
  );

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Qo'lda kiritilgan kirim/chiqimlar (kassa orqali) — real hisob-kitob uchun
  const manualIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const manualExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Sof foyda = buyurtmalar daromadi + qo'lda kiritilgan kirimlar - qo'lda kiritilgan chiqimlar
  const netProfit = totalRevenue + manualIncome - manualExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const paymentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders
      .filter((o) => o.paymentMethod)
      .forEach((o) => {
        counts[o.paymentMethod!] = (counts[o.paymentMethod!] || 0) + 1;
      });
    return counts;
  }, [orders]);

  // Har bir restoran bo'yicha real ko'rsatkichlar — buyurtmalarning restaurantId maydoni bo'yicha hisoblanadi
  const restaurantPerformance = useMemo(
    () =>
      restaurants.map((r) => {
        const restaurantOrders = orders.filter((o) => o.restaurantId === r.id);
        const revenue = restaurantOrders
          .filter((o) => o.status === 'completed' || o.status === 'served')
          .reduce((sum, o) => sum + o.total, 0);
        return {
          restaurant: r,
          revenue,
          orders: restaurantOrders.length,
        };
      }),
    [restaurants, orders]
  );

  const maxRestaurantRevenue = Math.max(...restaurantPerformance.map((r) => r.revenue), 1);

  // Tanlangan davr (bugun/hafta/oy/yil) bo'yicha real foyda-zarar hisoboti
  const periodStart = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      start.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      start.setMonth(now.getMonth() - 1);
    } else {
      start.setFullYear(now.getFullYear() - 1);
    }
    return start;
  }, [period]);

  const periodOrders = useMemo(
    () => completedOrders.filter((o) => o.createdAt >= periodStart),
    [completedOrders, periodStart]
  );
  const periodTransactions = useMemo(
    () => transactions.filter((tx) => tx.createdAt >= periodStart),
    [transactions, periodStart]
  );

  const periodOrdersRevenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
  const periodManualIncome = periodTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const periodExpenses = periodTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const periodTotalIncome = periodOrdersRevenue + periodManualIncome;
  const periodNet = periodTotalIncome - periodExpenses;

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodTransactions]);
  const maxExpenseCategory = Math.max(...expensesByCategory.map(([, v]) => v), 1);

  // Simple 6-point revenue trend derived from order totals (demo visualization)
  const trendPoints = useMemo(() => {
    const sorted = [...orders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const bucketSize = Math.max(1, Math.ceil(sorted.length / 6));
    const buckets: number[] = [];
    for (let i = 0; i < sorted.length; i += bucketSize) {
      const chunk = sorted.slice(i, i + bucketSize);
      buckets.push(chunk.reduce((sum, o) => sum + o.total, 0));
    }
    while (buckets.length < 6) buckets.push(0);
    return buckets.slice(0, 6);
  }, [orders]);

  if (restaurantLoading || platformLoading) return <PageLoader />;

  const maxTrend = Math.max(...trendPoints, 1);

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-espresso to-deep-brown text-white shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <LineChart className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rayhon</h1>
              <p className="text-sm text-latte">{t('ceo.title')}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setView('analytics')}
            className={`w-full text-left px-4 py-3 rounded-button transition-all flex items-center gap-2 ${
              view === 'analytics'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-latte hover:bg-white/5 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Analitika
          </button>
          <button
            onClick={() => setView('tables')}
            className={`w-full text-left px-4 py-3 rounded-button transition-all flex items-center gap-2 ${
              view === 'tables'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-latte hover:bg-white/5 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-4 h-4" /> Stollar
          </button>

          {view === 'analytics' && (
            <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`w-full text-left px-4 py-3 rounded-button transition-all flex items-center justify-between ${
                    period === p
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-latte hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{t(`ceo.${p}`)}</span>
                  {period === p && <div className="w-2 h-2 rounded-full bg-terracotta" />}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-button bg-white/5">
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center font-bold">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{currentUser?.name}</div>
              <div className="text-xs text-latte">{t('ceo.title')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-72">
        <header className="bg-white border-b border-soft-sand shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-espresso mb-1">
                {t('ceo.greeting')}, {currentUser?.name} 👋
              </h2>
              <p className="text-taupe">{t('ceo.overview')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>

        {view === 'analytics' && (
        <div className="p-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-terracotta to-danger text-white rounded-card p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-button">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-semibold">14%</span>
                </div>
              </div>
              <div className="text-sm opacity-90 mb-2">{t('ceo.totalRevenue')}</div>
              <div className="text-3xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs opacity-75">
                {t(`ceo.${period}`)} · {t('ceo.growth')}
              </div>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-success flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success bg-success/10 px-2 py-1 rounded-button">
                  <ArrowUp className="w-4 h-4" />
                  <span className="font-semibold">9%</span>
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('ceo.netProfit')}</div>
              <div className={`text-3xl font-bold mb-1 ${netProfit >= 0 ? 'text-espresso' : 'text-danger'}`}>
                {formatCurrency(Math.round(netProfit))}
              </div>
              <div className="text-xs text-taupe">
                {profitMargin >= 0 ? profitMargin.toFixed(0) : 0}% margin
              </div>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted-gold to-latte flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('ceo.totalOrders')}</div>
              <div className="text-3xl font-bold text-espresso mb-1">{totalOrders}</div>
              <div className="text-xs text-taupe">{occupiedTables} tables occupied now</div>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm hover:shadow-lg transition-all border-2 border-soft-sand">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-espresso to-deep-brown flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-taupe mb-2">{t('ceo.avgOrderValue')}</div>
              <div className="text-3xl font-bold text-espresso mb-1">
                {formatCurrency(Math.round(avgOrderValue))}
              </div>
              <div className="text-xs text-taupe">{products.length} menu items</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue trend */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand p-6">
              <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-terracotta" />
                {t('ceo.revenueTrend')}
              </h3>
              <div className="flex items-end gap-4 h-48">
                {trendPoints.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end h-40">
                      <div
                        className="w-full bg-gradient-to-t from-terracotta to-danger rounded-t-button transition-all duration-500"
                        style={{ height: `${(val / maxTrend) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-taupe">P{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order status breakdown */}
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand p-6">
              <h3 className="text-xl font-bold text-espresso mb-6">
                {t('ceo.orderStatusBreakdown')}
              </h3>
              <div className="space-y-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-taupe text-sm capitalize">{status}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-espresso">{count}</span>
                      <div className="w-20 h-2 bg-soft-sand rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terracotta rounded-full"
                          style={{ width: `${(count / totalOrders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Restaurant performance */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-terracotta" />
                  {t('ceo.restaurantPerformance')}
                </h3>
              </div>
              <div className="p-6 space-y-5">
                {restaurantPerformance.map((rp, idx) => (
                  <div key={rp.restaurant.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-button bg-gradient-to-br from-terracotta to-danger text-white flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-espresso">{rp.restaurant.name}</span>
                        <span className="text-sm font-bold text-terracotta">
                          {formatCurrency(Math.round(rp.revenue))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-soft-sand rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-terracotta to-danger rounded-full transition-all duration-500"
                            style={{ width: `${(rp.revenue / maxRestaurantRevenue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-taupe mt-1">{rp.orders} orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment breakdown + staff */}
            <div className="space-y-6">
              <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand p-6">
                <h3 className="text-lg font-bold text-espresso mb-4">
                  {t('ceo.paymentBreakdown')}
                </h3>
                <div className="space-y-3">
                  {Object.keys(paymentCounts).length === 0 && (
                    <p className="text-sm text-taupe">—</p>
                  )}
                  {Object.entries(paymentCounts).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between text-sm">
                      <span className="text-taupe capitalize">{method}</span>
                      <span className="font-bold text-espresso">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand p-6">
                <h3 className="text-lg font-bold text-espresso mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-terracotta" />
                  {t('ceo.staffOverview')}
                </h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-taupe">{t('dashboard.occupiedTables')}</span>
                  <span className="font-bold text-espresso">
                    {occupiedTables} / {tables.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-taupe">{t('menu.availableItems')}</span>
                  <span className="font-bold text-success">
                    {products.filter((p) => p.available).length} / {products.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly / period profit & loss */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-1 bg-white rounded-card shadow-sm border-2 border-soft-sand p-6">
              <h3 className="text-lg font-bold text-espresso mb-1 flex items-center gap-2">
                {periodNet >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-danger" />
                )}
                {t('ceo.monthlyPL')}
              </h3>
              <p className="text-xs text-taupe mb-5">{t(`ceo.${period}`)}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-taupe">{t('ceo.ordersRevenue')}</span>
                  <span className="font-semibold text-espresso">
                    {formatCurrency(Math.round(periodOrdersRevenue))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-taupe">{t('ceo.manualTransactions')}</span>
                  <span className="font-semibold text-success">
                    +{formatCurrency(Math.round(periodManualIncome))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-taupe">{t('ceo.monthlyExpenses')}</span>
                  <span className="font-semibold text-danger">
                    -{formatCurrency(Math.round(periodExpenses))}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-soft-sand">
                  <span className="font-semibold text-espresso">{t('ceo.monthlyNet')}</span>
                  <span
                    className={`text-xl font-bold ${periodNet >= 0 ? 'text-success' : 'text-danger'}`}
                  >
                    {periodNet >= 0 ? '+' : ''}
                    {formatCurrency(Math.round(periodNet))}
                  </span>
                </div>
                <div
                  className={`text-xs font-semibold px-3 py-2 rounded-button text-center ${
                    periodNet >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {periodNet >= 0 ? t('ceo.profit') : t('ceo.loss')}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-terracotta" />
                  {t('ceo.expensesByCategory')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {expensesByCategory.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-6">{t('ceo.noExpenses')}</p>
                ) : (
                  expensesByCategory.map(([category, amount]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-espresso">{category}</span>
                        <span className="text-sm font-bold text-danger">
                          {formatCurrency(Math.round(amount))}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-soft-sand rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-danger to-terracotta rounded-full transition-all duration-500"
                          style={{ width: `${(amount / maxExpenseCategory) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {view === 'tables' && (
          <div className="p-8">
            <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand p-6 mb-8 max-w-xl">
              <h3 className="text-lg font-bold text-espresso mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-terracotta" /> Yangi stol qo'shish
              </h3>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-semibold text-taupe mb-1">Stol raqami</label>
                  <input
                    type="number"
                    min={1}
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="Masalan: 9"
                    className="w-32 px-3 py-2 rounded-button border-2 border-soft-sand focus:border-terracotta outline-none text-espresso"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-taupe mb-1">O'rinlar soni</label>
                  <input
                    type="number"
                    min={1}
                    value={newTableSeats}
                    onChange={(e) => setNewTableSeats(e.target.value)}
                    className="w-28 px-3 py-2 rounded-button border-2 border-soft-sand focus:border-terracotta outline-none text-espresso"
                  />
                </div>
                <button
                  onClick={handleAddTable}
                  disabled={isAddingTable}
                  className="px-5 py-2.5 rounded-button bg-gradient-to-r from-terracotta to-danger text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {isAddingTable ? "Qo'shilmoqda..." : "Qo'shish"}
                </button>
              </div>
              {tableError && (
                <div className="mt-3 text-sm text-danger bg-danger/10 rounded-button px-4 py-2">{tableError}</div>
              )}
            </div>

            <h3 className="text-xl font-bold text-espresso mb-6 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-terracotta" /> Barcha stollar ({tables.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...tables]
                .sort((a, b) => a.number - b.number)
                .map((table) => (
                  <div
                    key={table.id}
                    className="bg-white rounded-card p-5 shadow-sm border-2 border-soft-sand text-center relative group"
                  >
                    <button
                      onClick={() => handleRemoveTable(table.id, table.number)}
                      title="Stolni o'chirish"
                      className="absolute top-2 right-2 w-7 h-7 rounded-button bg-danger/10 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-2xl font-bold text-espresso mb-1">#{table.number}</div>
                    <div className="text-xs text-taupe mb-1">{table.seats} o'rin</div>
                    <div className="text-xs font-semibold text-taupe capitalize">{table.status}</div>
                  </div>
                ))}
              {tables.length === 0 && (
                <div className="col-span-full text-center text-taupe py-8">
                  Hozircha stollar yo'q — yuqoridagi formadan qo'shing.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

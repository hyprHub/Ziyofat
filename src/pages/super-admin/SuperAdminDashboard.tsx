import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '../../contexts/PlatformContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';
import { Building2, Users, TrendingUp, DollarSign, Plus, Trash2, X, Bell, CreditCard, BarChart3, FileText } from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import PageLoader from '../../components/common/PageLoader';
import { analyticsService, pickNumber, type RestaurantComparisonEntry } from '../../services/analyticsService';
import { subscriptionService } from '../../services/subscriptionService';
import { platformPaymentService } from '../../services/platformPaymentService';
import { systemLogService } from '../../services/systemLogService';
import { settingsService } from '../../services/settingsService';
import type {
  Restaurant,
  User,
  UserRole,
  Subscription,
  SubscriptionStats,
  PlatformPayment,
  PlatformPaymentStats,
  SystemLog,
  PlatformSettings,
} from '../../types';

type ModalMode = null | 'restaurant' | 'user';
type SuperAdminTab =
  | 'overview'
  | 'restaurants'
  | 'users'
  | 'subscriptions'
  | 'payments'
  | 'analytics'
  | 'systemLogs'
  | 'settings';

const emptyRestaurant = { name: '', slug: '', address: '', phone: '', email: '', active: true };
const emptyUser = { name: '', email: '', password: '', role: 'admin' as UserRole, restaurantId: '' };

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const {
    restaurants,
    users,
    isLoading,
    createRestaurant,
    removeRestaurant,
    createUser,
    removeUser,
  } = usePlatform();
  const { orders } = useRestaurant();

  const [modal, setModal] = useState<ModalMode>(null);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [userForm, setUserForm] = useState(emptyUser);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');
  const [comparison, setComparison] = useState<RestaurantComparisonEntry[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    let cancelled = false;
    setAnalyticsLoading(true);
    analyticsService
      .restaurantsComparison()
      .then((data) => {
        if (!cancelled) setComparison(data);
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // ------- Subscriptions -------
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subStats, setSubStats] = useState<SubscriptionStats | null>(null);
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'subscriptions') return;
    let cancelled = false;
    setSubsLoading(true);
    Promise.all([subscriptionService.list(), subscriptionService.stats()])
      .then(([list, stats]) => {
        if (!cancelled) {
          setSubscriptions(list);
          setSubStats(stats);
        }
      })
      .catch((err) => console.error('Obunalarni yuklab bo\'lmadi:', err))
      .finally(() => {
        if (!cancelled) setSubsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // ------- Platform Payments -------
  const [platformPayments, setPlatformPayments] = useState<PlatformPayment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PlatformPaymentStats | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'payments') return;
    let cancelled = false;
    setPaymentsLoading(true);
    Promise.all([platformPaymentService.list(), platformPaymentService.stats()])
      .then(([list, stats]) => {
        if (!cancelled) {
          setPlatformPayments(list);
          setPaymentStats(stats);
        }
      })
      .catch((err) => console.error('To\'lovlarni yuklab bo\'lmadi:', err))
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // ------- System Logs -------
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'systemLogs') return;
    let cancelled = false;
    setLogsLoading(true);
    systemLogService
      .list({ limit: 50 })
      .then((page) => {
        if (!cancelled) setSystemLogs(page.logs);
      })
      .catch((err) => console.error('Tizim jurnalini yuklab bo\'lmadi:', err))
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // ------- Platform Settings -------
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    let cancelled = false;
    setSettingsLoading(true);
    setSettingsError(false);
    settingsService
      .get()
      .then((data) => {
        if (!cancelled) setSettingsForm(data);
      })
      .catch((err) => {
        console.error('Sozlamalarni yuklab bo\'lmadi:', err);
        if (!cancelled) setSettingsError(true);
      })
      .finally(() => {
        if (!cancelled) setSettingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      const updated = await settingsService.update(settingsForm);
      setSettingsForm(updated);
      setSettingsSaved(true);
    } catch (err) {
      console.error('Sozlamalarni saqlab bo\'lmadi:', err);
    } finally {
      setSettingsSaving(false);
    }
  };

  const restaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name ?? '—';

  const dateFmt = (d: Date) =>
    new Intl.DateTimeFormat('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  const dateTimeFmt = (d: Date) =>
    new Intl.DateTimeFormat('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);

  const subStatusStyle: Record<string, string> = {
    active: 'bg-success/10 text-success',
    trial: 'bg-muted-gold/10 text-muted-gold',
    expired: 'bg-danger/10 text-danger',
    cancelled: 'bg-taupe/10 text-taupe',
  };
  const paymentStatusStyle: Record<string, string> = {
    paid: 'bg-success/10 text-success',
    pending: 'bg-muted-gold/10 text-muted-gold',
    failed: 'bg-danger/10 text-danger',
    refunded: 'bg-taupe/10 text-taupe',
  };

  if (isLoading) return <PageLoader />;

  const activeRestaurants = restaurants.filter((r) => r.active).length;
  const totalUsers = users.length;
  // Oylik daromad haqiqiy buyurtmalardan hisoblanadi (mock son emas)
  const monthlyRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'served')
    .reduce((sum, o) => sum + o.total, 0);

  const closeModal = () => {
    setModal(null);
    setRestaurantForm(emptyRestaurant);
    setUserForm(emptyUser);
  };

  const handleCreateRestaurant = async () => {
    if (!restaurantForm.name.trim() || !restaurantForm.slug.trim()) return;
    setIsSaving(true);
    await createRestaurant(restaurantForm as Omit<Restaurant, 'id'>);
    setIsSaving(false);
    closeModal();
  };

  const handleCreateUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim()) return;
    setIsSaving(true);
    const payload: Omit<User, 'id'> = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      ...(userForm.restaurantId ? { restaurantId: userForm.restaurantId } : {}),
    };
    await createUser(payload);
    setIsSaving(false);
    closeModal();
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (window.confirm(t('superAdmin.confirmDeleteRestaurant'))) {
      await removeRestaurant(id);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm(t('superAdmin.confirmDeleteUser'))) {
      await removeUser(id);
    }
  };

  return (
    <div className="min-h-screen bg-soft-sand animate-in fade-in duration-300">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-latte shadow-sm">
        <div className="p-6 border-b border-latte">
          <h1 className="text-2xl font-bold text-espresso">Super Admin</h1>
          <p className="text-sm text-taupe mt-1">System Management</p>
        </div>

        <nav className="p-4 space-y-2">
          {(
            [
              { id: 'overview', label: t('navigation.overview'), icon: '📊' },
              { id: 'restaurants', label: t('navigation.restaurants'), icon: '🏪' },
              { id: 'users', label: t('navigation.users'), icon: '👥' },
              { id: 'subscriptions', label: t('navigation.subscriptions'), icon: '🔔' },
              { id: 'payments', label: t('navigation.payments'), icon: '💳' },
              { id: 'analytics', label: t('navigation.analytics'), icon: '📈' },
              { id: 'systemLogs', label: t('navigation.systemLogs'), icon: '📝' },
              { id: 'settings', label: t('navigation.settings'), icon: '⚙️' },
            ] as { id: SuperAdminTab; label: string; icon: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-button transition-colors ${
                activeTab === item.id ? 'bg-espresso text-white' : 'text-espresso hover:bg-soft-sand'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-latte shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-espresso">System Overview</h2>
              <p className="text-taupe text-sm">Manage all restaurants and users</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
        {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-card p-6 shadow-sm border border-latte hover:border-espresso transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-taupe font-medium text-sm">{t('dashboard.totalRestaurants')}</h3>
                <Building2 className="w-5 h-5 text-espresso" />
              </div>
              <div className="text-3xl font-bold text-espresso">{restaurants.length}</div>
              <p className="text-xs text-sage mt-2">{activeRestaurants} active</p>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm border border-latte hover:border-espresso transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-taupe font-medium text-sm">{t('dashboard.activeRestaurants')}</h3>
                <TrendingUp className="w-5 h-5 text-espresso" />
              </div>
              <div className="text-3xl font-bold text-espresso">{activeRestaurants}</div>
              <p className="text-xs text-sage mt-2">of {restaurants.length} total</p>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm border border-latte hover:border-espresso transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-taupe font-medium text-sm">{t('dashboard.totalUsers')}</h3>
                <Users className="w-5 h-5 text-espresso" />
              </div>
              <div className="text-3xl font-bold text-espresso">{totalUsers}</div>
              <p className="text-xs text-sage mt-2">Active users</p>
            </div>

            <div className="bg-white rounded-card p-6 shadow-sm border border-latte hover:border-espresso transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-taupe font-medium text-sm">{t('dashboard.monthlyRevenue')}</h3>
                <DollarSign className="w-5 h-5 text-espresso" />
              </div>
              <div className="text-3xl font-bold text-espresso">{formatCurrency(monthlyRevenue)}</div>
              <p className="text-xs text-sage mt-2">from completed orders</p>
            </div>
          </div>

        </>
        )}

        {(activeTab === 'overview' || activeTab === 'restaurants') && (
          <div className={`bg-white rounded-card shadow-sm border border-latte overflow-hidden ${activeTab === 'overview' ? 'mb-8' : ''}`}>
            <div className="p-6 border-b border-latte flex items-center justify-between">
              <h3 className="text-xl font-bold text-espresso">{t('navigation.restaurants')}</h3>
              <button
                onClick={() => setModal('restaurant')}
                className="flex items-center gap-2 px-4 py-2 rounded-button bg-espresso text-white text-sm font-semibold hover:bg-deep-brown transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('superAdmin.addRestaurant')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft-sand border-b border-latte">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe" />
                  </tr>
                </thead>
                <tbody>
                  {restaurants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-taupe text-sm">
                        {t('superAdmin.noRestaurants')}
                      </td>
                    </tr>
                  )}
                  {restaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="border-b border-soft-sand hover:bg-cream transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-espresso">{restaurant.name}</td>
                      <td className="px-6 py-4 text-taupe text-sm">{restaurant.address}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-button text-xs font-semibold ${
                            restaurant.active
                              ? 'bg-success/10 text-success'
                              : 'bg-taupe/10 text-taupe'
                          }`}
                        >
                          {restaurant.active ? t('superAdmin.active') : t('superAdmin.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-taupe text-sm">{restaurant.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteRestaurant(restaurant.id)}
                          className="p-2 rounded-button text-taupe hover:text-danger hover:bg-danger/10 transition-colors"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'users') && (
          <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden">
            <div className="p-6 border-b border-latte flex items-center justify-between">
              <h3 className="text-xl font-bold text-espresso">{t('navigation.users')}</h3>
              <button
                onClick={() => setModal('user')}
                className="flex items-center gap-2 px-4 py-2 rounded-button bg-espresso text-white text-sm font-semibold hover:bg-deep-brown transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('superAdmin.addUser')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-soft-sand border-b border-latte">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Restaurant</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-taupe" />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-taupe text-sm">
                        {t('superAdmin.noUsers')}
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-soft-sand hover:bg-cream transition-colors">
                      <td className="px-6 py-4 font-semibold text-espresso">{user.name}</td>
                      <td className="px-6 py-4 text-taupe text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-button text-xs font-semibold bg-latte/50 text-espresso">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-taupe text-sm">
                        {user.restaurantId
                          ? restaurants.find((r) => r.id === user.restaurantId)?.name ?? '—'
                          : t('superAdmin.system')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-button text-taupe hover:text-danger hover:bg-danger/10 transition-colors"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden">
            <div className="p-6 border-b border-latte flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-espresso" />
              <h3 className="text-xl font-bold text-espresso">{t('navigation.analytics')}</h3>
            </div>
            {analyticsLoading ? (
              <div className="p-8 text-center text-taupe text-sm">Yuklanmoqda...</div>
            ) : comparison.length === 0 ? (
              <div className="p-8 text-center text-taupe text-sm">
                Backend hozircha restoranlar taqqoslash ma'lumotini qaytarmadi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft-sand border-b border-latte">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Restoran</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Daromad</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">Buyurtmalar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((entry, idx) => (
                      <tr key={idx} className="border-b border-soft-sand hover:bg-cream transition-colors">
                        <td className="px-6 py-4 font-semibold text-espresso">
                          {String(entry.name ?? entry.restaurantName ?? '—')}
                        </td>
                        <td className="px-6 py-4 text-taupe text-sm">
                          {formatCurrency(pickNumber(entry, ['revenue', 'totalRevenue', 'income']))}
                        </td>
                        <td className="px-6 py-4 text-taupe text-sm">
                          {pickNumber(entry, ['orders', 'totalOrders', 'ordersCount'])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {subStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.activeCount')}</h3>
                  <div className="text-3xl font-bold text-espresso">{subStats.activeCount}</div>
                </div>
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.trialCount')}</h3>
                  <div className="text-3xl font-bold text-espresso">{subStats.trialCount}</div>
                </div>
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.expiringSoon')}</h3>
                  <div className="text-3xl font-bold text-espresso">{subStats.expiringSoon}</div>
                </div>
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.plan')}</h3>
                  <div className="text-sm text-espresso space-y-1">
                    {Object.entries(subStats.byPlan).map(([plan, count]) => (
                      <div key={plan} className="flex justify-between">
                        <span className="capitalize">{plan}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden">
              <div className="p-6 border-b border-latte flex items-center gap-2">
                <Bell className="w-5 h-5 text-espresso" />
                <h3 className="text-xl font-bold text-espresso">{t('navigation.subscriptions')}</h3>
              </div>
              {subsLoading ? (
                <div className="p-8 text-center text-taupe text-sm">{t('common.loading')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-soft-sand border-b border-latte">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.restaurant')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.plan')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.price')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.startDate')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.renewalDate')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-taupe text-sm">
                            {t('superAdmin.noSubscriptions')}
                          </td>
                        </tr>
                      )}
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-soft-sand hover:bg-cream transition-colors">
                          <td className="px-6 py-4 font-semibold text-espresso">{restaurantName(sub.restaurantId)}</td>
                          <td className="px-6 py-4 text-taupe text-sm capitalize">{t(`superAdmin.plan${sub.plan.charAt(0).toUpperCase()}${sub.plan.slice(1)}`)}</td>
                          <td className="px-6 py-4 text-taupe text-sm">{formatCurrency(sub.price)}</td>
                          <td className="px-6 py-4 text-taupe text-sm">{dateFmt(sub.startDate)}</td>
                          <td className="px-6 py-4 text-taupe text-sm">{dateFmt(sub.renewalDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-button text-xs font-semibold ${subStatusStyle[sub.status] ?? ''}`}>
                              {sub.status === 'active' ? t('superAdmin.active') : t(`superAdmin.status${sub.status.charAt(0).toUpperCase()}${sub.status.slice(1)}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            {paymentStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.totalPaid')}</h3>
                  <div className="text-3xl font-bold text-espresso">{formatCurrency(paymentStats.totalPaid)}</div>
                </div>
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.pendingCount')}</h3>
                  <div className="text-3xl font-bold text-espresso">{paymentStats.pendingCount}</div>
                </div>
                <div className="bg-white rounded-card p-6 shadow-sm border border-latte">
                  <h3 className="text-taupe font-medium text-sm mb-2">{t('superAdmin.monthlyRevenue')}</h3>
                  <div className="text-3xl font-bold text-espresso">{formatCurrency(paymentStats.monthlyRevenue)}</div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden">
              <div className="p-6 border-b border-latte flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-espresso" />
                <h3 className="text-xl font-bold text-espresso">{t('navigation.payments')}</h3>
              </div>
              {paymentsLoading ? (
                <div className="p-8 text-center text-taupe text-sm">{t('common.loading')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-soft-sand border-b border-latte">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.restaurant')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.amount')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.date')}</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformPayments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-taupe text-sm">
                            {t('superAdmin.noPayments')}
                          </td>
                        </tr>
                      )}
                      {platformPayments.map((pay) => (
                        <tr key={pay.id} className="border-b border-soft-sand hover:bg-cream transition-colors">
                          <td className="px-6 py-4 font-semibold text-espresso">{restaurantName(pay.restaurantId)}</td>
                          <td className="px-6 py-4 text-taupe text-sm">{formatCurrency(pay.amount)}</td>
                          <td className="px-6 py-4 text-taupe text-sm">{dateFmt(pay.createdAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-button text-xs font-semibold ${paymentStatusStyle[pay.status] ?? ''}`}>
                              {t(`superAdmin.payment${pay.status.charAt(0).toUpperCase()}${pay.status.slice(1)}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'systemLogs' && (
          <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden">
            <div className="p-6 border-b border-latte flex items-center gap-2">
              <FileText className="w-5 h-5 text-espresso" />
              <h3 className="text-xl font-bold text-espresso">{t('navigation.systemLogs')}</h3>
            </div>
            {logsLoading ? (
              <div className="p-8 text-center text-taupe text-sm">{t('common.loading')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft-sand border-b border-latte">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.actor')}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.action')}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.entity')}</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-taupe">{t('superAdmin.time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-taupe text-sm">
                          {t('superAdmin.noLogs')}
                        </td>
                      </tr>
                    )}
                    {systemLogs.map((log) => (
                      <tr key={log.id} className="border-b border-soft-sand hover:bg-cream transition-colors">
                        <td className="px-6 py-4 font-semibold text-espresso">
                          {log.userId ? users.find((u) => u.id === log.userId)?.name ?? log.userId : t('superAdmin.system')}
                        </td>
                        <td className="px-6 py-4 text-taupe text-sm">{log.action}</td>
                        <td className="px-6 py-4 text-taupe text-sm">{log.entity ?? '—'}</td>
                        <td className="px-6 py-4 text-taupe text-sm">{dateTimeFmt(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-card p-8 shadow-sm border border-latte max-w-2xl">
            {settingsLoading ? (
              <div className="text-center text-taupe text-sm py-8">{t('common.loading')}</div>
            ) : settingsError ? (
              <div className="text-center text-danger text-sm py-8">{t('superAdmin.settingsLoadError')}</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">
                    {t('superAdmin.platformName')}
                  </label>
                  <input
                    type="text"
                    value={(settingsForm.platformName as string) ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border border-latte focus:outline-none focus:border-espresso text-espresso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">
                    {t('superAdmin.defaultCurrency')}
                  </label>
                  <input
                    type="text"
                    value={(settingsForm.defaultCurrency as string) ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultCurrency: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border border-latte focus:outline-none focus:border-espresso text-espresso"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-espresso mb-2">
                    {t('superAdmin.supportEmail')}
                  </label>
                  <input
                    type="email"
                    value={(settingsForm.supportEmail as string) ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-button border border-latte focus:outline-none focus:border-espresso text-espresso"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="px-6 py-3 rounded-button bg-espresso text-white font-semibold hover:bg-deep-brown transition-colors disabled:opacity-50"
                  >
                    {settingsSaving ? t('common.loading') : t('superAdmin.saveSettings')}
                  </button>
                  {settingsSaved && (
                    <span className="text-success text-sm font-semibold">{t('superAdmin.settingsSaved')}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Add Restaurant Modal */}
      {modal === 'restaurant' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-dialog max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-espresso">{t('superAdmin.addRestaurant')}</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-soft-sand">
                <X className="w-5 h-5 text-taupe" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.restaurantName')}
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.slug')}
                value={restaurantForm.slug}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, slug: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.address')}
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.phone')}
                value={restaurantForm.phone}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.email')}
                value={restaurantForm.email}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-button border border-latte text-espresso font-semibold hover:bg-soft-sand transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateRestaurant}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-button bg-espresso text-white font-semibold hover:bg-deep-brown transition-colors disabled:opacity-50"
              >
                {isSaving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {modal === 'user' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-dialog max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-espresso">{t('superAdmin.addUser')}</h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-soft-sand">
                <X className="w-5 h-5 text-taupe" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.userName')}
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.email')}
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
              <input
                type="password"
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                placeholder={t('superAdmin.password')}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
              <select
                className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
              >
                {(['admin', 'kitchen', 'waiter', 'cashier', 'ceo', 'super-admin'] as UserRole[]).map(
                  (role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  )
                )}
              </select>
              {userForm.role !== 'super-admin' && (
                <select
                  className="w-full px-4 py-3 rounded-button border border-latte focus:border-espresso focus:outline-none"
                  value={userForm.restaurantId}
                  onChange={(e) => setUserForm({ ...userForm, restaurantId: e.target.value })}
                >
                  <option value="">{t('superAdmin.restaurant')}</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 rounded-button border border-latte text-espresso font-semibold hover:bg-soft-sand transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-button bg-espresso text-white font-semibold hover:bg-deep-brown transition-colors disabled:opacity-50"
              >
                {isSaving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

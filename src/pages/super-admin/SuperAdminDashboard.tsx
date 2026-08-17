import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '../../contexts/PlatformContext';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';
import { Building2, Users, TrendingUp, DollarSign, Plus, Trash2, X } from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import PageLoader from '../../components/common/PageLoader';
import type { Restaurant, User, UserRole } from '../../types';

type ModalMode = null | 'restaurant' | 'user';

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
          {[
            { label: t('navigation.overview'), icon: '📊' },
            { label: t('navigation.restaurants'), icon: '🏪' },
            { label: t('navigation.users'), icon: '👥' },
            { label: t('navigation.subscriptions'), icon: '🔔' },
            { label: t('navigation.payments'), icon: '💳' },
            { label: t('navigation.analytics'), icon: '📈' },
            { label: t('navigation.systemLogs'), icon: '📝' },
            { label: t('navigation.settings'), icon: '⚙️' },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`w-full text-left px-4 py-3 rounded-button transition-colors ${
                idx === 0 ? 'bg-espresso text-white' : 'text-espresso hover:bg-soft-sand'
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

          {/* Restaurants Table */}
          <div className="bg-white rounded-card shadow-sm border border-latte overflow-hidden mb-8">
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

          {/* Users Table */}
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

import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatTime } from '../../utils/helpers';
import { Clock, Flame, CheckCircle, ChefHat, Bell, LogOut } from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import PageLoader from '../../components/common/PageLoader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function KitchenDisplay() {
  const { t, i18n } = useTranslation();
  const { orders, tables, products, updateOrderStatus, isLoading } = useRestaurant();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const newOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.number : '?';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Unknown';
    return product.name[i18n.language as keyof typeof product.name];
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    return diff;
  };

  const handleStatusChange = (orderId: string, newStatus: 'preparing' | 'ready' | 'served') => {
    updateOrderStatus(orderId, newStatus);
  };

  if (isLoading) return <PageLoader />;

  const renderOrderTicket = (order: any, column: 'new' | 'preparing' | 'ready') => {
    const tableNumber = getTableNumber(order.tableId);
    const timeSince = getTimeSince(order.createdAt);
    const isUrgent = timeSince > 10;

    const columnColors = {
      new: 'from-red-500 to-red-600',
      preparing: 'from-blue-500 to-blue-600',
      ready: 'from-green-500 to-green-600'
    };

    return (
      <div
        key={order.id}
        className={`relative bg-gradient-to-br ${columnColors[column]} rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform duration-200 ${
          isUrgent && column !== 'ready' ? 'animate-pulse' : ''
        }`}
      >
        {/* Urgent Badge */}
        {isUrgent && column !== 'ready' && (
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-lg animate-bounce">
            <Bell className="w-3 h-3" />
            Urgent!
          </div>
        )}

        {/* Order Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-white/30">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-5xl font-black text-white">
                #{order.orderNumber}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">
                STOL {tableNumber}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">
                  {formatTime(order.createdAt)}
                </span>
                <span className="text-sm">({timeSince} min oldin)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3 mb-6">
          {order.items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4"
            >
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-4xl font-black text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-black text-white uppercase tracking-wide">
                  {getProductName(item.productId)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {column === 'new' && (
          <button
            onClick={() => handleStatusChange(order.id, 'preparing')}
            className="w-full bg-white text-blue-600 font-black py-5 rounded-xl text-2xl uppercase tracking-wide hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <ChefHat className="w-7 h-7" />
            BOSHLASH
          </button>
        )}
        {column === 'preparing' && (
          <button
            onClick={() => handleStatusChange(order.id, 'ready')}
            className="w-full bg-white text-green-600 font-black py-5 rounded-xl text-2xl uppercase tracking-wide hover:bg-green-50 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <CheckCircle className="w-7 h-7" />
            TAYYOR
          </button>
        )}
        {column === 'ready' && (
          <button
            onClick={() => handleStatusChange(order.id, 'served')}
            className="w-full bg-white text-gray-800 font-black py-5 rounded-xl text-2xl uppercase tracking-wide hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <CheckCircle className="w-7 h-7" />
            BERILDI
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-4 border-terracotta sticky top-0 z-10 shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta to-danger flex items-center justify-center">
                <Flame className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-wide">
                  OSHXONA
                </h1>
                <p className="text-xl text-gray-400 font-semibold">Rayhon Restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right bg-white/5 backdrop-blur rounded-2xl px-6 py-3">
                <div className="text-4xl font-black text-white">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
                <div className="text-sm text-gray-400 font-semibold">
                  {currentTime.toLocaleDateString('uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                title={t('auth.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Kitchen Board */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NEW Column */}
          <div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Bell className="w-8 h-8" />
                  YANGI
                </h2>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{newOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {newOrders.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center border-4 border-dashed border-gray-700">
                  <div className="text-6xl mb-4">😌</div>
                  <div className="text-2xl text-gray-500 font-bold">Yangi buyurtma yo'q</div>
                </div>
              ) : (
                newOrders.map(order => renderOrderTicket(order, 'new'))
              )}
            </div>
          </div>

          {/* PREPARING Column */}
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <Flame className="w-8 h-8" />
                  TAYYORLANMOQDA
                </h2>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{preparingOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {preparingOrders.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center border-4 border-dashed border-gray-700">
                  <div className="text-6xl mb-4">🍳</div>
                  <div className="text-2xl text-gray-500 font-bold">Tayyorlanayotgan yo'q</div>
                </div>
              ) : (
                preparingOrders.map(order => renderOrderTicket(order, 'preparing'))
              )}
            </div>
          </div>

          {/* READY Column */}
          <div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  TAYYOR
                </h2>
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{readyOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {readyOrders.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-12 text-center border-4 border-dashed border-gray-700">
                  <div className="text-6xl mb-4">✅</div>
                  <div className="text-2xl text-gray-500 font-bold">Tayyor buyurtma yo'q</div>
                </div>
              ) : (
                readyOrders.map(order => renderOrderTicket(order, 'ready'))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t-4 border-terracotta p-4">
        <div className="flex items-center justify-center gap-12">
          <div className="text-center">
            <div className="text-3xl font-black text-red-500">{newOrders.length}</div>
            <div className="text-sm text-gray-400 font-semibold">YANGI</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-500">{preparingOrders.length}</div>
            <div className="text-sm text-gray-400 font-semibold">JARAYONDA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-500">{readyOrders.length}</div>
            <div className="text-sm text-gray-400 font-semibold">TAYYOR</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">{orders.length}</div>
            <div className="text-sm text-gray-400 font-semibold">JAMI BUGUN</div>
          </div>
        </div>
      </div>
    </div>
  );
}

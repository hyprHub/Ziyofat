import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Minus, Search, Grid3x3, ShoppingBag, LogOut } from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import PageLoader from '../../components/common/PageLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function WaiterInterface() {
  const { t, i18n } = useTranslation();
  const { tables, products, categories, createOrder, isLoading } = useRestaurant();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const [selectedTab, setSelectedTab] = useState<'tables' | 'orders'>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <PageLoader />;

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const searchMatch = searchQuery === '' ||
      p.name[i18n.language as keyof typeof p.name].toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleAddToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, change: number) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handlePlaceOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    createOrder({
      tableId: selectedTable,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: products.find(p => p.id === item.productId)?.price || 0,
      })),
      subtotal,
      tax,
      total,
      status: 'pending',
    });

    setCart([]);
    setSelectedTable(null);
    setSelectedTab('tables');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-gradient-to-br from-success to-sage text-white';
      case 'occupied': return 'bg-gradient-to-br from-terracotta to-danger text-white';
      case 'cleaning': return 'bg-gradient-to-br from-taupe to-gray-500 text-white';
      case 'reserved': return 'bg-gradient-to-br from-muted-gold to-latte text-white';
      default: return 'bg-white border-2 border-soft-sand text-espresso';
    }
  };

  if (selectedTab === 'tables') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-soft-sand pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Grid3x3 className="w-6 h-6" />
                  {t('tables.myTables')}
                </h1>
                <p className="text-sm text-latte mt-1">Rayhon Restaurant</p>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-button bg-white/10 hover:bg-white/20 transition-colors"
                  title={t('auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 backdrop-blur rounded-button p-2 text-center">
                <div className="text-2xl font-bold">{tables.filter(t => t.status === 'available').length}</div>
                <div className="text-xs text-latte">Bo'sh</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-button p-2 text-center">
                <div className="text-2xl font-bold">{tables.filter(t => t.status === 'occupied').length}</div>
                <div className="text-xs text-latte">Band</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-button p-2 text-center">
                <div className="text-2xl font-bold">{tables.length}</div>
                <div className="text-xs text-latte">Jami</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tables Grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {tables.map(table => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table.id);
                  setSelectedTab('orders');
                }}
                className={`aspect-square rounded-2xl font-bold transition-all hover:scale-105 shadow-lg ${getStatusColor(table.status)}`}
              >
                <div className="flex flex-col items-center justify-center h-full p-3">
                  <div className="text-3xl font-black mb-1">#{table.number}</div>
                  <div className="text-xs opacity-90">{table.seats} o'rin</div>
                  <div className="text-xs font-semibold mt-2 px-2 py-1 bg-white/20 rounded-button">
                    {table.status === 'available' ? "Bo'sh" :
                     table.status === 'occupied' ? 'Band' :
                     table.status === 'cleaning' ? 'Tozalanmoqda' :
                     'Bron'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-terracotta shadow-2xl">
          <div className="grid grid-cols-4 gap-1 p-2">
            {[
              { label: 'Stollar', tab: 'tables', icon: '🪑' },
              { label: 'Buyurtmalar', tab: 'orders', icon: '🛒' },
              { label: "So'rovlar", tab: 'requests', icon: '🔔' },
              { label: 'Boshqa', tab: 'more', icon: '⋮' },
            ].map((item: any) => (
              <button
                key={item.tab}
                onClick={() => setSelectedTab(item.tab)}
                className={`py-3 rounded-button transition-all ${
                  selectedTab === item.tab
                    ? 'bg-gradient-to-r from-terracotta to-danger text-white font-bold shadow-lg'
                    : 'text-taupe hover:bg-soft-sand'
                }`}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs font-semibold">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedTab === 'orders' && selectedTable) {
    const tableNum = tables.find(t => t.id === selectedTable)?.number;

    return (
      <div className="min-h-screen bg-cream pb-40">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl">
          <div className="px-4 py-4">
            <button
              onClick={() => {
                setSelectedTab('tables');
                setCart([]);
              }}
              className="text-latte hover:text-white font-semibold mb-2 flex items-center gap-2"
            >
              ← Orqaga
            </button>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Stol #{tableNum}
              </h1>
              {cart.length > 0 && (
                <div className="bg-white/10 backdrop-blur px-3 py-1 rounded-button">
                  <span className="font-bold">{cart.length} mahsulot</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="sticky top-[105px] z-9 bg-white border-b border-soft-sand p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-taupe" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full pl-12 pr-4 py-3 rounded-button border-2 border-soft-sand focus:border-terracotta outline-none text-espresso font-medium"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="sticky top-[185px] z-8 bg-white border-b border-soft-sand overflow-x-auto p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-button whitespace-nowrap font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-terracotta to-danger text-white shadow-lg'
                  : 'bg-soft-sand text-taupe hover:bg-latte'
              }`}
            >
              Barchasi
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-button whitespace-nowrap font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-terracotta to-danger text-white shadow-lg'
                    : 'bg-soft-sand text-taupe hover:bg-latte'
                }`}
              >
                {cat.name[i18n.language as keyof typeof cat.name]}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="p-4 space-y-3">
          {filteredProducts.map(product => {
            const inCart = cart.find(item => item.productId === product.id);
            return (
              <div
                key={product.id}
                className="bg-white p-4 rounded-card flex items-center gap-4 border-2 border-soft-sand hover:border-terracotta transition-all shadow-sm"
              >
                <div className="w-20 h-20 rounded-button overflow-hidden bg-soft-sand flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name[i18n.language as keyof typeof product.name]}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-espresso truncate">
                    {product.name[i18n.language as keyof typeof product.name]}
                  </h3>
                  <p className="text-lg font-bold text-terracotta">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                {inCart ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(product.id, -1)}
                      className="w-10 h-10 rounded-button bg-soft-sand hover:bg-latte flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-5 h-5 text-espresso" />
                    </button>
                    <span className="w-10 text-center font-bold text-xl text-espresso">
                      {inCart.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(product.id, 1)}
                      className="w-10 h-10 rounded-button bg-terracotta hover:bg-danger text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-12 h-12 rounded-button bg-gradient-to-br from-terracotta to-danger text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-terracotta p-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-taupe">Jami:</div>
                <div className="text-2xl font-bold text-espresso">
                  {formatCurrency(cartTotal)}
                </div>
                <div className="text-xs text-taupe">{cart.length} mahsulot</div>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 bg-gradient-to-r from-terracotta to-danger text-white py-4 rounded-button font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Buyurtma berish
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center pb-24">
      <div className="text-center">
        <div className="text-6xl mb-4">🤷</div>
        <p className="text-2xl text-taupe font-bold">Sahifa topilmadi</p>
      </div>
    </div>
  );
}

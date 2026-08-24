import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';
<<<<<<< HEAD
import { Plus, Minus, Search, Grid3x3, ShoppingBag, LogOut } from 'lucide-react';
=======
import { Plus, Minus, Search, Grid3x3, ShoppingBag, LogOut, Bell, User, Check, MoreVertical, X } from 'lucide-react';
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import PageLoader from '../../components/common/PageLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD

export default function WaiterInterface() {
  const { t, i18n } = useTranslation();
  const { tables, products, categories, createOrder, isLoading } = useRestaurant();
  const { logout } = useAuth();
=======
import type { TableStatus } from '../../types';

export default function WaiterInterface() {
  const { t, i18n } = useTranslation();
  const { tables, products, categories, orders, serviceRequests, createOrder, addOrderItem, completeServiceRequest, updateOrderStatus, updateTableStatus, isLoading } =
    useRestaurant();
  const { logout, currentUser } = useAuth();
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

<<<<<<< HEAD
  const [selectedTab, setSelectedTab] = useState<'tables' | 'orders'>('tables');
=======
  const [selectedTab, setSelectedTab] = useState<'tables' | 'orders' | 'requests' | 'more'>('tables');
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
=======
  // Stol statusini o'zgartirish oynasi uchun: qaysi stol tanlangani (null = yopiq)
  const [statusModalTable, setStatusModalTable] = useState<string | null>(null);
  // Stolda faol buyurtma bo'lsa, avval "stol tafsiloti" ko'rsatiladi (menyu emas).
  // Ofitsiant "Ovqat qo'shish" tugmasini bosgandagina menyu ochiladi.
  const [addingItems, setAddingItems] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Pastki navigatsiyadan bosilganda har doim "toza" holatdan boshlanadi —
  // aks holda eski tanlangan stol/savat holati boshqa bo'limlarga "sizib chiqib"
  // mantiqsiz ko'rinishlarga olib kelardi (masalan "Buyurtmalar" bo'limi
  // umumiy ro'yxat o'rniga eski stolning menyusini ko'rsatib yuborardi).
  const handleNavTab = (tab: 'tables' | 'orders' | 'requests' | 'more') => {
    setSelectedTable(null);
    setAddingItems(false);
    setCart([]);
    setSelectedTab(tab);
  };

  // Berilgan stol uchun hozirgi faol buyurtmani topadi (to'lanmagan/yakunlanmagan)
  const getActiveOrderForTable = (tableId: string) =>
    orders
      .filter((o) => o.tableId === tableId && !['completed', 'cancelled'].includes(o.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const TABLE_STATUS_OPTIONS: { value: TableStatus; label: string; emoji: string }[] = [
    { value: 'available', label: "Bo'sh", emoji: '🟢' },
    { value: 'occupied', label: 'Band', emoji: '🔴' },
    { value: 'cleaning', label: 'Tozalanmoqda', emoji: '🧹' },
    { value: 'reserved', label: 'Bron', emoji: '📌' },
  ];

  const handleChangeTableStatus = async (tableId: string, status: TableStatus) => {
    await updateTableStatus(tableId, status);
    setStatusModalTable(null);
  };
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da

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

<<<<<<< HEAD
  const handlePlaceOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    createOrder({
      tableId: selectedTable,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    setCart([]);
    setSelectedTable(null);
    setSelectedTab('tables');
=======
  const handlePlaceOrder = async () => {
    if (!selectedTable || cart.length === 0 || isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    try {
      const activeOrder = getActiveOrderForTable(selectedTable);

      if (activeOrder && addingItems) {
        // Stolda faol buyurtma bor — yangisini yaratmasdan, mavjudiga mahsulot qo'shamiz
        for (const item of cart) {
          await addOrderItem(activeOrder.id, item.productId, item.quantity);
        }
        setCart([]);
        setAddingItems(false);
        // Stol tafsiloti ekraniga qaytamiz (yangilangan buyurtma bilan)
      } else {
        await createOrder({
          tableId: selectedTable,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
        setCart([]);
        setSelectedTable(null);
        setSelectedTab('tables');
      }
    } finally {
      setIsSubmittingOrder(false);
    }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
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
<<<<<<< HEAD
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
=======
              <div key={table.id} className="relative">
                <button
                  onClick={() => {
                    setSelectedTable(table.id);
                    setAddingItems(false);
                    setCart([]);
                    setSelectedTab('orders');
                  }}
                  className={`aspect-square w-full rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg ${getStatusColor(table.status)}`}
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
                {/* Statusni qo'lda o'zgartirish tugmasi */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusModalTable(table.id);
                  }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur flex items-center justify-center transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </button>
              </div>
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
            ))}
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Stol statusini o'zgartirish oynasi */}
        {statusModalTable && (
          <div
            className="fixed inset-0 z-20 bg-black/50 flex items-end"
            onClick={() => setStatusModalTable(null)}
          >
            <div
              className="w-full bg-white rounded-t-3xl p-5 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-espresso">
                  Stol #{tables.find(t => t.id === statusModalTable)?.number} — statusni o'zgartirish
                </h2>
                <button onClick={() => setStatusModalTable(null)}>
                  <X className="w-6 h-6 text-taupe" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TABLE_STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleChangeTableStatus(statusModalTable, opt.value)}
                    className={`p-4 rounded-button font-bold flex items-center gap-2 justify-center border-2 transition-all ${
                      tables.find(t => t.id === statusModalTable)?.status === opt.value
                        ? 'border-terracotta bg-soft-sand text-espresso'
                        : 'border-soft-sand text-taupe hover:border-terracotta'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav selectedTab={selectedTab} setSelectedTab={handleNavTab} />
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
      </div>
    );
  }

  if (selectedTab === 'orders' && selectedTable) {
    const tableNum = tables.find(t => t.id === selectedTable)?.number;
<<<<<<< HEAD
=======
    const activeOrder = getActiveOrderForTable(selectedTable);

    // Stolda faol buyurtma bor va hozir mahsulot qo'shish rejimida emasmiz —
    // avval buyurtma holatini ko'rsatamiz, menyuni emas.
    if (activeOrder && !addingItems) {
      const orderStatusInfo: Record<string, { label: string; color: string }> = {
        pending: { label: 'Kutilmoqda', color: 'bg-taupe' },
        confirmed: { label: 'Tasdiqlandi', color: 'bg-muted-gold' },
        preparing: { label: "Tayyorlanmoqda", color: 'bg-terracotta' },
        ready: { label: 'Tayyor', color: 'bg-success' },
        served: { label: 'Berildi', color: 'bg-sage' },
      };
      const info = orderStatusInfo[activeOrder.status] ?? { label: activeOrder.status, color: 'bg-taupe' };
      const pendingRequests = serviceRequests.filter(
        (r) => r.tableId === selectedTable && r.status !== 'completed'
      );

      return (
        <div className="min-h-screen bg-cream pb-32">
          <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl">
            <div className="px-4 py-4">
              <button
                onClick={() => {
                  setSelectedTable(null);
                  setSelectedTab('tables');
                }}
                className="text-latte hover:text-white font-semibold mb-2 flex items-center gap-2"
              >
                ← Orqaga
              </button>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Stol #{tableNum}</h1>
                <span className={`px-3 py-1 rounded-button text-sm font-bold text-white ${info.color}`}>
                  {info.label}
                </span>
              </div>
              <div className="text-sm text-latte mt-1">Buyurtma #{activeOrder.orderNumber}</div>
            </div>
          </header>

          {pendingRequests.length > 0 && (
            <div className="p-4 pb-0 space-y-2">
              {pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border-2 border-muted-gold/60 rounded-card p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-espresso">
                    {r.type === 'waiter' ? "Ofitsiant chaqirilmoqda" : r.type === 'bill' ? "Hisob-kitob so'ralmoqda" : "Suv so'ralmoqda"}
                  </span>
                  <button
                    onClick={() => completeServiceRequest(r.id)}
                    className="px-3 py-1.5 rounded-button bg-success text-white text-xs font-bold"
                  >
                    Bajarildi
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 space-y-3">
            {activeOrder.items.map((item, idx) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <div
                  key={`${item.productId}-${idx}`}
                  className="bg-white p-4 rounded-card flex items-center justify-between border-2 border-soft-sand"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-espresso truncate">
                      {product?.name[i18n.language as keyof typeof product.name] ?? "Noma'lum mahsulot"}
                    </div>
                    <div className="text-sm text-taupe">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="font-bold text-terracotta">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-terracotta p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-taupe">Jami:</span>
              <span className="text-2xl font-bold text-espresso">{formatCurrency(activeOrder.total)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAddingItems(true);
                  setCart([]);
                }}
                className="flex-1 py-3 rounded-button bg-soft-sand text-espresso font-bold flex items-center justify-center gap-2 hover:bg-latte transition-colors"
              >
                <Plus className="w-5 h-5" /> Ovqat qo'shish
              </button>
              {activeOrder.status === 'ready' && (
                <button
                  onClick={() => updateOrderStatus(activeOrder.id, 'served')}
                  className="flex-1 py-3 rounded-button bg-gradient-to-r from-success to-sage text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check className="w-5 h-5" /> Stolga olib bordim
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da

    return (
      <div className="min-h-screen bg-cream pb-40">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl">
          <div className="px-4 py-4">
            <button
              onClick={() => {
<<<<<<< HEAD
                setSelectedTab('tables');
=======
                if (activeOrder && addingItems) {
                  // Mahsulot qo'shish rejimidan stol tafsilotiga qaytamiz
                  setAddingItems(false);
                } else {
                  setSelectedTab('tables');
                  setSelectedTable(null);
                }
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
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
<<<<<<< HEAD
                className="flex-1 bg-gradient-to-r from-terracotta to-danger text-white py-4 rounded-button font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Buyurtma berish
=======
                disabled={isSubmittingOrder}
                className="flex-1 bg-gradient-to-r from-terracotta to-danger text-white py-4 rounded-button font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <ShoppingBag className="w-5 h-5" />
                {isSubmittingOrder ? 'Yuborilmoqda...' : addingItems ? "Qo'shish" : 'Buyurtma berish'}
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

<<<<<<< HEAD
=======
  // "Buyurtmalar" tab bosilgan, lekin hali stol tanlanmagan bo'lsa —
  // 404 ko'rsatish o'rniga foydalanuvchini stol tanlashga yo'naltiramiz,
  // shuningdek oshxona tayyorlab qo'ygan (status='ready') buyurtmalarni ko'rsatamiz
  if (selectedTab === 'orders' && !selectedTable) {
    const readyOrders = orders.filter((o) => o.status === 'ready');
    return (
      <div className="min-h-screen bg-cream flex flex-col pb-24">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Buyurtmalar
          </h1>
        </header>

        {readyOrders.length > 0 && (
          <div className="p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-taupe mb-3">
              🔔 Tayyor — stolga olib boring
            </h2>
            <div className="space-y-3 mb-4">
              {readyOrders.map((order) => {
                const table = tables.find((tb) => tb.id === order.tableId);
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-card p-4 shadow-sm border-2 border-success/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-espresso">Stol #{table?.number ?? '-'}</div>
                      <div className="text-sm text-taupe">
                        Buyurtma #{order.orderNumber} — {order.items.length} mahsulot —{' '}
                        {formatCurrency(order.total)}
                      </div>
                    </div>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      className="px-4 py-2 rounded-button bg-gradient-to-r from-success to-sage text-white font-bold text-sm shadow-md flex-shrink-0"
                    >
                      Berildi
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🪑</div>
          <p className="text-lg text-taupe font-semibold mb-4">
            Yangi buyurtma berish uchun avval stol tanlang
          </p>
          <button
            onClick={() => setSelectedTab('tables')}
            className="px-6 py-3 rounded-button bg-gradient-to-r from-terracotta to-danger text-white font-bold shadow-lg"
          >
            Stollarga o'tish
          </button>
        </div>
        <BottomNav selectedTab={selectedTab} setSelectedTab={handleNavTab} />
      </div>
    );
  }

  if (selectedTab === 'requests') {
    const openRequests = serviceRequests.filter((r) => r.status !== 'completed');
    return (
      <div className="min-h-screen bg-cream pb-24">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" /> So'rovlar
          </h1>
        </header>
        <div className="p-4 space-y-3">
          {openRequests.length === 0 && (
            <div className="text-center text-taupe py-12">Hozircha faol so'rovlar yo'q</div>
          )}
          {openRequests.map((req) => {
            const table = tables.find((tb) => tb.id === req.tableId);
            const typeLabel =
              req.type === 'waiter' ? "Ofitsiant chaqirilmoqda" : req.type === 'bill' ? 'Hisob-kitob so\'ralmoqda' : 'Suv so\'ralmoqda';
            return (
              <div
                key={req.id}
                className="bg-white rounded-card p-4 shadow-sm border-2 border-soft-sand flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-espresso">Stol #{table?.number ?? '-'}</div>
                  <div className="text-sm text-taupe">{typeLabel}</div>
                </div>
                <button
                  onClick={() => completeServiceRequest(req.id)}
                  className="w-11 h-11 rounded-button bg-gradient-to-br from-success to-sage text-white flex items-center justify-center shadow-md flex-shrink-0"
                  title="Bajarildi deb belgilash"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
        <BottomNav selectedTab={selectedTab} setSelectedTab={handleNavTab} />
      </div>
    );
  }

  if (selectedTab === 'more') {
    const myOrdersToday = orders.filter((o) => {
      const today = new Date();
      return (
        o.createdAt.getFullYear() === today.getFullYear() &&
        o.createdAt.getMonth() === today.getMonth() &&
        o.createdAt.getDate() === today.getDate()
      );
    });
    return (
      <div className="min-h-screen bg-cream pb-24">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-xl px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" /> Boshqa
          </h1>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-card p-5 shadow-sm border-2 border-soft-sand flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-terracotta to-danger text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              {(currentUser?.name || 'O').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-espresso">{currentUser?.name ?? 'Ofitsiant'}</div>
              <div className="text-sm text-taupe">{currentUser?.email}</div>
            </div>
          </div>
          <div className="bg-white rounded-card p-5 shadow-sm border-2 border-soft-sand">
            <div className="text-sm text-taupe mb-1">Bugungi buyurtmalar</div>
            <div className="text-2xl font-bold text-espresso">{myOrdersToday.length} ta</div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-button bg-white border-2 border-soft-sand text-danger font-bold flex items-center justify-center gap-2 hover:bg-soft-sand transition-colors"
          >
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
        <BottomNav selectedTab={selectedTab} setSelectedTab={handleNavTab} />
      </div>
    );
  }

>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center pb-24">
      <div className="text-center">
        <div className="text-6xl mb-4">🤷</div>
        <p className="text-2xl text-taupe font-bold">Sahifa topilmadi</p>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

function BottomNav({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: 'tables' | 'orders' | 'requests' | 'more';
  setSelectedTab: (tab: 'tables' | 'orders' | 'requests' | 'more') => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-terracotta shadow-2xl">
      <div className="grid grid-cols-4 gap-1 p-2">
        {(
          [
            { label: 'Stollar', tab: 'tables', icon: '🪑' },
            { label: 'Buyurtmalar', tab: 'orders', icon: '🛒' },
            { label: "So'rovlar", tab: 'requests', icon: '🔔' },
            { label: 'Boshqa', tab: 'more', icon: '⋮' },
          ] as { label: string; tab: 'tables' | 'orders' | 'requests' | 'more'; icon: string }[]
        ).map((item) => (
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
  );
}
>>>>>>> 4ee2c584503d0bb61ecb47c880a3afd7956c32da

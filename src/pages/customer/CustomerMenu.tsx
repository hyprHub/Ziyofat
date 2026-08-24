import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Phone, Receipt, Droplets, X, Minus, Clock, Check, AlertCircle } from 'lucide-react';
import { publicService } from '../../services/publicService';
import { formatCurrency } from '../../utils/helpers';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import PageLoader from '../../components/common/PageLoader';
import type { Category, Product } from '../../types';

export default function CustomerMenu() {
  const { t, i18n } = useTranslation();
  const { restaurantSlug, tableToken } = useParams<{ restaurantSlug: string; tableToken: string }>();

  // Mijoz HECH QACHON login qilmaydi — shu sabab bu yerda RestaurantContext ishlatilmaydi,
  // faqat backend'ning tokensiz "public" endpointlari orqali ma'lumot olinadi.
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantSlug) {
      setLoadError('Restoran manzili noto\'g\'ri (slug topilmadi).');
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    publicService
      .getMenu(restaurantSlug)
      .then(({ categories: cats, products: prods }) => {
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Menyuni yuklab bo\'lmadi. Iltimos, QR kodni qaytadan skanerlang.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantSlug]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.categoryId === selectedCategory);
  }, [selectedCategory, products]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
    setSelectedProduct(null);
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleServiceRequest = async (type: 'waiter' | 'bill' | 'water') => {
    if (!restaurantSlug || !tableToken) return;
    try {
      await publicService.createServiceRequest(restaurantSlug, tableToken, type);
      showNotification(t('customer.waiterNotified'));
    } catch {
      showNotification('So\'rovni yuborib bo\'lmadi. Qaytadan urinib ko\'ring.');
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlaceOrder = async () => {
    if (!restaurantSlug || !tableToken || cart.length === 0) return;
    setIsPlacingOrder(true);
    setOrderError(null);
    try {
      await publicService.placeOrder(
        restaurantSlug,
        tableToken,
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
      );
      setOrderPlaced(true);
      setCart([]);
      setTimeout(() => {
        setShowCart(false);
        setOrderPlaced(false);
      }, 2500);
    } catch {
      setOrderError('Buyurtmani yuborib bo\'lmadi. Iltimos, qaytadan urinib ko\'ring yoki ofitsiantni chaqiring.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const selectedProductData = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  if (isLoading) return <PageLoader />;

  if (loadError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-danger mx-auto mb-4" />
          <p className="text-lg font-bold text-espresso mb-2">Xatolik yuz berdi</p>
          <p className="text-taupe">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-espresso to-deep-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rayhon Restaurant</h1>
              <div className="flex items-center gap-1 text-sm text-latte mt-1">
                <Clock className="w-3 h-3" />
                <span>10-25 min</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[73px] z-30 bg-white border-y border-soft-sand shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-button whitespace-nowrap font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-terracotta to-danger text-white shadow-md'
                  : 'bg-soft-sand text-taupe hover:bg-latte'
              }`}
            >
              {t('menu.allCategories')}
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-button whitespace-nowrap font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-terracotta to-danger text-white shadow-md'
                    : 'bg-soft-sand text-taupe hover:bg-latte'
                }`}
              >
                {category.name[i18n.language as keyof typeof category.name]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className="group bg-white rounded-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-terracotta"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-soft-sand">
                <img
                  src={product.image}
                  alt={product.name[i18n.language as keyof typeof product.name]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full flex flex-col items-center justify-center bg-soft-sand">
                          <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3">
                            <svg class="w-8 h-8 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span class="text-sm text-taupe font-medium">${product.name[i18n.language as keyof typeof product.name]}</span>
                        </div>
                      `;
                    }
                  }}
                />
                {product.prepTime < 15 && (
                  <div className="absolute top-3 left-3 bg-success text-white px-3 py-1 rounded-button text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tez
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-espresso mb-1 group-hover:text-terracotta transition-colors">
                  {product.name[i18n.language as keyof typeof product.name]}
                </h3>
                <p className="text-sm text-taupe mb-3 line-clamp-2">
                  {product.description[i18n.language as keyof typeof product.description]}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-terracotta">
                    {formatCurrency(product.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                    className="w-10 h-10 rounded-button bg-terracotta text-white flex items-center justify-center hover:bg-danger transition-all hover:scale-110"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && selectedProductData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-t-dialog sm:rounded-dialog max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] bg-soft-sand">
              <img
                src={selectedProductData.image}
                alt={selectedProductData.name[i18n.language as keyof typeof selectedProductData.name]}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-espresso" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="text-3xl font-bold text-espresso mb-3">
                {selectedProductData.name[i18n.language as keyof typeof selectedProductData.name]}
              </h2>
              <p className="text-taupe text-lg mb-6">
                {selectedProductData.description[i18n.language as keyof typeof selectedProductData.description]}
              </p>
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-soft-sand">
                <div>
                  <span className="text-4xl font-bold text-terracotta">
                    {formatCurrency(selectedProductData.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-taupe">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">{selectedProductData.prepTime} {t('menu.minutes')}</span>
                </div>
              </div>
              <button
                onClick={() => addToCart(selectedProduct, 1)}
                className="w-full bg-gradient-to-r from-terracotta to-danger text-white py-4 rounded-button font-bold text-lg hover:shadow-lg transition-all"
              >
                {t('customer.addToOrder')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && cartItemsCount > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-t-dialog sm:rounded-dialog max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-soft-sand flex items-center justify-between">
              <h3 className="text-2xl font-bold text-espresso">{t('customer.yourOrder')}</h3>
              <button
                onClick={() => setShowCart(false)}
                className="w-10 h-10 rounded-full hover:bg-soft-sand flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-espresso" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex items-center gap-4 p-4 bg-soft-sand rounded-card">
                    <div className="w-20 h-20 rounded-button overflow-hidden bg-white flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name[i18n.language as keyof typeof product.name]}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-espresso">
                        {product.name[i18n.language as keyof typeof product.name]}
                      </h4>
                      <p className="text-sm text-terracotta font-semibold">
                        {formatCurrency(product.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQuantity(item.productId, -1)}
                        className="w-8 h-8 rounded-button bg-white hover:bg-latte flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4 text-espresso" />
                      </button>
                      <span className="w-8 text-center font-bold text-espresso">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, 1)}
                        className="w-8 h-8 rounded-button bg-white hover:bg-latte flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4 text-espresso" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 border-t border-soft-sand bg-cream">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg text-taupe">Jami:</span>
                <span className="text-3xl font-bold text-espresso">{formatCurrency(cartTotal)}</span>
              </div>
              {orderError && (
                <div className="mb-4 text-sm text-danger bg-danger/10 rounded-button px-4 py-3">
                  {orderError}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || orderPlaced}
                className="w-full bg-gradient-to-r from-terracotta to-danger text-white py-4 rounded-button font-bold text-lg hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {orderPlaced ? (
                  <>
                    <Check className="w-5 h-5" /> {t('common.success')}
                  </>
                ) : isPlacingOrder ? (
                  t('common.loading')
                ) : (
                  t('customer.placeOrder')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItemsCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-terracotta to-danger text-white pl-6 pr-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 z-30 hover:scale-105"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-terracotta rounded-full text-xs font-bold flex items-center justify-center">
              {cartItemsCount}
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs opacity-90">Savat</div>
            <div className="font-bold text-lg">{formatCurrency(cartTotal)}</div>
          </div>
        </button>
      )}

      {/* Service Request Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-30">
        <button
          onClick={() => handleServiceRequest('waiter')}
          className="w-14 h-14 rounded-full bg-white border-2 border-terracotta text-terracotta flex items-center justify-center hover:bg-terracotta hover:text-white transition-all shadow-lg hover:scale-110"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleServiceRequest('bill')}
          className="w-14 h-14 rounded-full bg-white border-2 border-terracotta text-terracotta flex items-center justify-center hover:bg-terracotta hover:text-white transition-all shadow-lg hover:scale-110"
        >
          <Receipt className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleServiceRequest('water')}
          className="w-14 h-14 rounded-full bg-white border-2 border-terracotta text-terracotta flex items-center justify-center hover:bg-terracotta hover:text-white transition-all shadow-lg hover:scale-110"
        >
          <Droplets className="w-5 h-5" />
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-success to-sage text-white px-6 py-4 rounded-button shadow-2xl z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
            <span className="font-semibold">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
}

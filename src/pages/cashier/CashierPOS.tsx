import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { formatCurrency } from '../../utils/helpers';
import type { Order, PaymentMethod, TransactionType } from '../../types';
import {
  Wallet,
  Receipt,
  Banknote,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Search,
  TrendingUp,
  ListChecks,
  ArrowLeftRight,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import UserMenu from '../../components/common/UserMenu';
import PageLoader from '../../components/common/PageLoader';
import { useAuth } from '../../contexts/AuthContext';

const paymentMethods: { id: PaymentMethod; icon: typeof Banknote }[] = [
  { id: 'cash', icon: Banknote },
  { id: 'card', icon: CreditCard },
  { id: 'click', icon: Smartphone },
  { id: 'payme', icon: Smartphone },
];

export default function CashierPOS() {
  const { t } = useTranslation();
  const { orders, tables, products, payOrder, transactions, addTransaction, removeTransaction, isLoading } =
    useRestaurant();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'payments' | 'cashbox'>('payments');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [search, setSearch] = useState('');
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  // Kassa harakati (kirim/chiqim) uchun forma holati
  const [txnType, setTxnType] = useState<TransactionType>('expense');
  const [txnCategory, setTxnCategory] = useState('');
  const [txnDescription, setTxnDescription] = useState('');
  const [txnAmount, setTxnAmount] = useState('');

  // Unpaid orders ready to be charged: served or ready orders that are not yet completed
  const payableOrders = useMemo(
    () =>
      orders
        .filter((o) => ['served', 'ready', 'preparing', 'confirmed'].includes(o.status))
        .filter((o) => {
          if (!search.trim()) return true;
          const table = tables.find((t) => t.id === o.tableId);
          return (
            String(o.orderNumber).includes(search) ||
            String(table?.number ?? '').includes(search)
          );
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [orders, tables, search]
  );

  const paidOrdersToday = useMemo(
    () => orders.filter((o) => o.status === 'completed' && o.paidAt),
    [orders]
  );

  const todayCollected = paidOrdersToday.reduce((sum, o) => sum + o.total, 0);
  const avgTransaction =
    paidOrdersToday.length > 0 ? todayCollected / paidOrdersToday.length : 0;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const todayTransactions = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((tx) => isSameDay(tx.createdAt, now))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [transactions]);

  const allTransactionsSorted = useMemo(
    () => [...transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [transactions]
  );

  const todayIncome = todayTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const todayExpense = todayTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const todayNet = todayIncome - todayExpense;

  const canAddTransaction =
    txnCategory.trim().length > 0 && parseFloat(txnAmount) > 0 && !Number.isNaN(parseFloat(txnAmount));

  const handleAddTransaction = async () => {
    if (!canAddTransaction) return;
    await addTransaction({
      type: txnType,
      category: txnCategory.trim(),
      description: txnDescription.trim(),
      amount: parseFloat(txnAmount),
      createdBy: currentUser?.id ?? 'unknown',
    });
    setTxnCategory('');
    setTxnDescription('');
    setTxnAmount('');
    setTxnType('expense');
  };

  const handleRemoveTransaction = async (id: string) => {
    if (window.confirm(t('cashier.confirmDelete') as string)) {
      await removeTransaction(id);
    }
  };

  if (isLoading) return <PageLoader />;

  const selectedOrder: Order | undefined = orders.find((o) => o.id === selectedOrderId);
  const selectedTable = selectedOrder
    ? tables.find((t) => t.id === selectedOrder.tableId)
    : undefined;

  const received = parseFloat(receivedAmount) || 0;
  const change =
    selectedOrder && selectedMethod === 'cash' && received > selectedOrder.total
      ? received - selectedOrder.total
      : 0;

  const canConfirm =
    !!selectedOrder &&
    (selectedMethod !== 'cash' || received >= (selectedOrder?.total ?? 0));

  const handleConfirmPayment = () => {
    if (!selectedOrder) return;
    payOrder(selectedOrder.id, selectedMethod);
    setSuccessOrderId(selectedOrder.id);
    setSelectedOrderId(null);
    setReceivedAmount('');
    setSelectedMethod('cash');
  };

  const handleNewSale = () => {
    setSuccessOrderId(null);
  };

  const recentPayments = [...paidOrdersToday]
    .sort((a, b) => (b.paidAt?.getTime() ?? 0) - (a.paidAt?.getTime() ?? 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-cream">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-espresso to-deep-brown text-white shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur">
              <Wallet className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rayhon</h1>
              <p className="text-sm text-latte">{t('cashier.title')}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-white/5 rounded-card p-4">
            <div className="text-xs text-latte mb-1">{t('cashier.todayCollected')}</div>
            <div className="text-2xl font-bold">{formatCurrency(todayCollected)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-card p-4">
              <div className="text-xs text-latte mb-1">{t('cashier.transactions')}</div>
              <div className="text-xl font-bold">{paidOrdersToday.length}</div>
            </div>
            <div className="bg-white/5 rounded-card p-4">
              <div className="text-xs text-latte mb-1">{t('cashier.avgTransaction')}</div>
              <div className="text-sm font-bold leading-tight">
                {formatCurrency(Math.round(avgTransaction))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-button bg-white/5">
            <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center font-bold">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{currentUser?.name}</div>
              <div className="text-xs text-latte">{t('cashier.title')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-72">
        <header className="bg-white border-b border-soft-sand shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-espresso mb-1">{t('cashier.title')}</h2>
              <p className="text-taupe">{t('cashier.selectOrder')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
          <div className="px-8 flex gap-2 pb-4">
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-button font-semibold text-sm transition-all ${
                activeTab === 'payments'
                  ? 'bg-terracotta text-white'
                  : 'bg-cream text-taupe hover:text-espresso'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              {t('cashier.paymentsTab')}
            </button>
            <button
              onClick={() => setActiveTab('cashbox')}
              className={`flex items-center gap-2 px-4 py-2 rounded-button font-semibold text-sm transition-all ${
                activeTab === 'cashbox'
                  ? 'bg-terracotta text-white'
                  : 'bg-cream text-taupe hover:text-espresso'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              {t('cashier.cashboxTab')}
            </button>
          </div>
        </header>

        {activeTab === 'payments' && (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden flex flex-col">
            <div className="p-4 border-b border-soft-sand">
              <div className="relative">
                <Search className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('common.search') as string}
                  className="w-full pl-9 pr-3 py-2 rounded-button border border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[65vh]">
              {payableOrders.length === 0 ? (
                <div className="p-10 text-center text-taupe flex flex-col items-center gap-3">
                  <ListChecks className="w-10 h-10 text-soft-sand" />
                  {t('cashier.noOpenOrders')}
                </div>
              ) : (
                payableOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const isActive = order.id === selectedOrderId;
                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setSelectedMethod('cash');
                        setReceivedAmount('');
                        setSuccessOrderId(null);
                      }}
                      className={`w-full text-left px-5 py-4 border-b border-soft-sand transition-colors flex items-center justify-between ${
                        isActive ? 'bg-terracotta/10' : 'hover:bg-cream'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-espresso">
                          #{order.orderNumber} · {t('cashier.table')} {table?.number}
                        </div>
                        <div className="text-sm text-taupe">
                          {order.items.length} {t('cashier.items').toLowerCase()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-terracotta">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-xs text-taupe uppercase">{order.status}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Checkout panel */}
          <div className="lg:col-span-3 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
            {successOrderId ? (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4 h-full">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-espresso">
                  {t('cashier.paymentSuccess')}
                </h3>
                <p className="text-taupe">
                  #{orders.find((o) => o.id === successOrderId)?.orderNumber}
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="px-5 py-3 rounded-button border-2 border-soft-sand text-espresso font-semibold flex items-center gap-2 hover:bg-cream transition-colors">
                    <Receipt className="w-4 h-4" />
                    {t('cashier.printReceipt')}
                  </button>
                  <button
                    onClick={handleNewSale}
                    className="px-5 py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all"
                  >
                    {t('cashier.newSale')}
                  </button>
                </div>
              </div>
            ) : !selectedOrder ? (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[400px]">
                <Wallet className="w-12 h-12 text-soft-sand" />
                <p className="text-taupe">{t('cashier.selectOrder')}</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-soft-sand">
                  <h3 className="text-xl font-bold text-espresso">
                    #{selectedOrder.orderNumber} · {t('cashier.table')} {selectedTable?.number}
                  </h3>
                </div>

                <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[35vh]">
                  {selectedOrder.items.map((item, idx) => {
                    const product = products.find((p) => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-button overflow-hidden bg-soft-sand flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name.en}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-espresso text-sm">
                              {product.name.en}
                            </div>
                            <div className="text-xs text-taupe">x{item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-semibold text-espresso text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-soft-sand bg-cream space-y-2">
                  <div className="flex justify-between text-taupe text-sm">
                    <span>{t('cashier.subtotal')}</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-taupe text-sm">
                    <span>{t('cashier.tax')}</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-espresso pt-2 border-t border-soft-sand">
                    <span>{t('cashier.total')}</span>
                    <span className="text-terracotta">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                <div className="p-6 border-t border-soft-sand space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-espresso mb-2">
                      {t('cashier.paymentMethod')}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {paymentMethods.map((m) => {
                        const Icon = m.icon;
                        const active = selectedMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMethod(m.id)}
                            className={`flex flex-col items-center gap-1 py-3 rounded-button border-2 transition-all ${
                              active
                                ? 'border-terracotta bg-terracotta/10 text-terracotta'
                                : 'border-soft-sand text-taupe hover:border-latte'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-semibold">{t(`cashier.${m.id}`)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedMethod === 'cash' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-espresso mb-1 block">
                          {t('cashier.receivedAmount')}
                        </label>
                        <input
                          type="number"
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(e.target.value)}
                          placeholder={String(selectedOrder.total)}
                          className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-espresso mb-1 block">
                          {t('cashier.change')}
                        </label>
                        <div className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso font-bold">
                          {formatCurrency(change)}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!canConfirm}
                    onClick={handleConfirmPayment}
                    className={`w-full py-4 rounded-button font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                      canConfirm
                        ? 'bg-gradient-to-br from-terracotta to-danger text-white hover:shadow-lg'
                        : 'bg-soft-sand text-taupe cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {t('cashier.confirmPayment')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Recent payments */}
        {activeTab === 'payments' && (
        <div className="px-8 pb-8">
          <div className="bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
            <div className="p-6 border-b border-soft-sand">
              <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-terracotta" />
                {t('cashier.recentPayments')}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {recentPayments.length === 0 && (
                    <tr>
                      <td className="px-6 py-6 text-taupe text-center" colSpan={4}>
                        {t('cashier.noOpenOrders')}
                      </td>
                    </tr>
                  )}
                  {recentPayments.map((order, idx) => {
                    const table = tables.find((t) => t.id === order.tableId);
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-soft-sand ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-warm-white'
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-espresso">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-taupe">
                          {t('cashier.table')} {table?.number}
                        </td>
                        <td className="px-6 py-4 text-espresso font-semibold uppercase text-xs">
                          {order.paymentMethod ? t(`cashier.${order.paymentMethod}`) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-success">
                          {formatCurrency(order.total)}
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

        {activeTab === 'cashbox' && (
          <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Add transaction form */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-sm border-2 border-soft-sand p-6 h-fit">
              <h3 className="text-xl font-bold text-espresso mb-1">{t('cashier.cashboxTitle')}</h3>
              <p className="text-taupe text-sm mb-6">{t('cashier.cashboxSubtitle')}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-espresso mb-2 block">
                    {t('cashier.transactionType')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTxnType('income')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-button border-2 font-semibold transition-all ${
                        txnType === 'income'
                          ? 'border-success bg-success/10 text-success'
                          : 'border-soft-sand text-taupe hover:border-latte'
                      }`}
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                      {t('cashier.income')}
                    </button>
                    <button
                      onClick={() => setTxnType('expense')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-button border-2 font-semibold transition-all ${
                        txnType === 'expense'
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-soft-sand text-taupe hover:border-latte'
                      }`}
                    >
                      <ArrowDownCircle className="w-5 h-5" />
                      {t('cashier.expense')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-espresso mb-1 block">
                    {t('cashier.category')}
                  </label>
                  <input
                    value={txnCategory}
                    onChange={(e) => setTxnCategory(e.target.value)}
                    placeholder={t('cashier.categoryPlaceholder') as string}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-espresso mb-1 block">
                    {t('cashier.description')}
                  </label>
                  <input
                    value={txnDescription}
                    onChange={(e) => setTxnDescription(e.target.value)}
                    placeholder={t('cashier.descriptionPlaceholder') as string}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-espresso mb-1 block">
                    {t('cashier.amount')}
                  </label>
                  <input
                    type="number"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    placeholder={t('cashier.amountPlaceholder') as string}
                    className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-white text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>

                <button
                  disabled={!canAddTransaction}
                  onClick={handleAddTransaction}
                  className={`w-full py-4 rounded-button font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    canAddTransaction
                      ? 'bg-gradient-to-br from-terracotta to-danger text-white hover:shadow-lg'
                      : 'bg-soft-sand text-taupe cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  {t('cashier.addTransaction')}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6 pt-6 border-t border-soft-sand">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-taupe">{t('cashier.todayNet')}</span>
                  <span className={`font-bold ${todayNet >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(todayNet)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions list */}
            <div className="lg:col-span-3 bg-white rounded-card shadow-sm border-2 border-soft-sand overflow-hidden">
              <div className="p-6 border-b border-soft-sand">
                <h3 className="text-xl font-bold text-espresso flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-terracotta" />
                  {t('cashier.cashboxTab')}
                </h3>
              </div>
              <div className="overflow-y-auto max-h-[65vh]">
                {allTransactionsSorted.length === 0 ? (
                  <div className="p-10 text-center text-taupe flex flex-col items-center gap-3">
                    <ListChecks className="w-10 h-10 text-soft-sand" />
                    {t('cashier.noTransactions')}
                  </div>
                ) : (
                  allTransactionsSorted.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-6 py-4 border-b border-soft-sand hover:bg-cream transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpCircle className="w-5 h-5" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-espresso text-sm">{tx.category}</div>
                          <div className="text-xs text-taupe">
                            {tx.description || '—'} · {tx.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-bold text-sm ${
                            tx.type === 'income' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                        <button
                          onClick={() => handleRemoveTransaction(tx.id)}
                          className="text-taupe hover:text-danger transition-colors"
                          aria-label={t('cashier.delete') as string}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Wand2, Copy, Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { clearToken } from '../../lib/apiClient';
import { authService } from '../../services/authService';
import { restaurantService } from '../../services/restaurantService';
import { userService } from '../../services/userService';

interface CreatedAccount {
  role: string;
  name: string;
  email: string;
  password: string;
}

const SETUP_PASSWORD = 'Setup123!';
const USED_FLAG_KEY = 'rayhon_setup_used';

export default function QuickSetupPage() {
  const navigate = useNavigate();
  // Xavfsizlik: reg-key koddan olib tashlandi — har safar qo'lda kiritilishi kerak,
  // shunda u build fayllari ichida (brauzerda ko'rinadigan JS kodida) saqlanib qolmaydi.
  const [regKey, setRegKey] = useState('');
  const [restaurantName, setRestaurantName] = useState('Rayhon Restaurant');
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<CreatedAccount[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyUsed, setAlreadyUsed] = useState(() => localStorage.getItem(USED_FLAG_KEY) === 'true');
  const [forceUnlock, setForceUnlock] = useState(false);

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

  const handleRun = async () => {
    if (!regKey.trim()) {
      setErrorMsg('Reg-key kiritilmagan.');
      return;
    }
    setIsRunning(true);
    setErrorMsg(null);
    setLog([]);
    setAccounts([]);
    // Boshlashdan oldin eski tokenni tozalaymiz, oxirida ham tozalaymiz — bu sahifa hech kimni login qilib qoldirmaydi
    clearToken();

    try {
      const slug = restaurantName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'restaurant';

      addLog("1/9 — Super-admin hisobi yaratilmoqda...");
      const superAdminEmail = `admin+${Date.now()}@rayhon.uz`;
      const regResult = await authService.register({
        name: 'Super Admin',
        email: superAdminEmail,
        password: SETUP_PASSWORD,
        regKey: regKey.trim(),
      });
      if (!regResult.ok) {
        throw new Error(`Super-admin yaratib bo'lmadi: ${regResult.message ?? 'noma\'lum xato'}`);
      }
      addLog('✓ Super-admin yaratildi: ' + superAdminEmail);

      addLog('2/9 — Tizimga kirilmoqda...');
      const loginResult = await authService.login(superAdminEmail, SETUP_PASSWORD);
      if (!loginResult) {
        throw new Error('Super-admin sifatida login qilib bo\'lmadi.');
      }
      addLog('✓ Kirildi (rol: ' + loginResult.user.role + ')');
      if (loginResult.user.role !== 'super-admin') {
        throw new Error(
          `Backend bu hisobga "${loginResult.user.role}" rolini berdi, "super-admin" emas. ` +
          `Demak backend /auth/register so'roviga role maydonini qabul qilmayapti yoki uni e'tiborsiz qoldiryapti. ` +
          `Bu holatda avtomatik sozlash imkonsiz — backend administratoridan haqiqiy super-admin hisobini so'rashingiz kerak.`
        );
      }

      addLog('3/9 — Restoran tekshirilmoqda / yaratilmoqda...');
      let restaurant;
      try {
        const existing = await restaurantService.list();
        restaurant = existing[0];
      } catch {
        restaurant = undefined;
      }
      if (!restaurant) {
        restaurant = await restaurantService.create({
          name: restaurantName.trim() || 'Rayhon Restaurant',
          slug,
          address: '',
          phone: '',
          email: '',
          active: true,
        });
        addLog('✓ Yangi restoran yaratildi: ' + restaurant.name);
      } else {
        addLog('✓ Mavjud restoran topildi: ' + restaurant.name);
      }

      const newAccounts: CreatedAccount[] = [
        { role: 'super-admin', name: 'Super Admin', email: superAdminEmail, password: SETUP_PASSWORD },
      ];

      addLog('4/9 — Kassir hisobi yaratilmoqda...');
      const cashierEmail = `kassir+${Date.now()}@rayhon.uz`;
      await userService.create({
        name: 'Kassir',
        email: cashierEmail,
        password: SETUP_PASSWORD,
        role: 'cashier',
        restaurantId: restaurant.id,
      });
      newAccounts.push({ role: 'cashier', name: 'Kassir', email: cashierEmail, password: SETUP_PASSWORD });
      addLog('✓ Kassir yaratildi: ' + cashierEmail);

      addLog('5/9 — CEO hisobi yaratilmoqda...');
      const ceoEmail = `ceo+${Date.now()}@rayhon.uz`;
      await userService.create({
        name: 'Bosh direktor',
        email: ceoEmail,
        password: SETUP_PASSWORD,
        role: 'ceo',
        restaurantId: restaurant.id,
      });
      newAccounts.push({ role: 'ceo', name: 'Bosh direktor', email: ceoEmail, password: SETUP_PASSWORD });
      addLog('✓ CEO yaratildi: ' + ceoEmail);

      addLog('6/9 — Administrator hisobi yaratilmoqda...');
      const adminEmail = `admin.panel+${Date.now()}@rayhon.uz`;
      await userService.create({
        name: 'Administrator',
        email: adminEmail,
        password: SETUP_PASSWORD,
        role: 'admin',
        restaurantId: restaurant.id,
      });
      newAccounts.push({ role: 'admin', name: 'Administrator', email: adminEmail, password: SETUP_PASSWORD });
      addLog('✓ Administrator yaratildi: ' + adminEmail);

      addLog('7/9 — Ofitsiant hisobi yaratilmoqda...');
      const waiterEmail = `ofitsiant+${Date.now()}@rayhon.uz`;
      await userService.create({
        name: 'Ofitsiant',
        email: waiterEmail,
        password: SETUP_PASSWORD,
        role: 'waiter',
        restaurantId: restaurant.id,
      });
      newAccounts.push({ role: 'waiter', name: 'Ofitsiant', email: waiterEmail, password: SETUP_PASSWORD });
      addLog('✓ Ofitsiant yaratildi: ' + waiterEmail);

      addLog('8/9 — Oshpaz (kitchen) hisobi yaratilmoqda...');
      const kitchenEmail = `oshpaz+${Date.now()}@rayhon.uz`;
      await userService.create({
        name: 'Oshpaz',
        email: kitchenEmail,
        password: SETUP_PASSWORD,
        role: 'kitchen',
        restaurantId: restaurant.id,
      });
      newAccounts.push({ role: 'kitchen', name: 'Oshpaz', email: kitchenEmail, password: SETUP_PASSWORD });
      addLog('✓ Oshpaz yaratildi: ' + kitchenEmail);

      addLog('9/9 — Tayyor, hamma rollar uchun hisob yaratildi.');

      setAccounts(newAccounts);
      addLog('🎉 Tayyor! Pastdagi login/parollarni saqlab qo\'ying.');
      localStorage.setItem(USED_FLAG_KEY, 'true');
      setAlreadyUsed(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Kutilmagan xatolik yuz berdi.');
    } finally {
      // Setup tugagach, tizimda hech kim login bo'lib qolmasin — foydalanuvchi o'zi kerakli hisob bilan kiradi
      clearToken();
      setIsRunning(false);
    }
  };

  const handleCopy = (account: CreatedAccount, index: number) => {
    const text = `Rol: ${account.role}\nEmail: ${account.email}\nParol: ${account.password}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const text = accounts
      .map((a) => `${a.role.toUpperCase()}\nEmail: ${a.email}\nParol: ${a.password}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-soft-sand flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-taupe hover:text-espresso transition-colors mb-4 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Login sahifasiga qaytish
        </button>

        <div className="bg-white rounded-card shadow-md border border-soft-sand p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-espresso to-deep-brown flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ChefHat className="w-7 h-7 text-terracotta" />
            </div>
            <h1 className="text-2xl font-bold text-espresso mb-1">Tizimni bir tugma bilan sozlash</h1>
            <p className="text-taupe text-sm">
              Barcha rollar uchun (super-admin, admin, kassir, CEO, ofitsiant, oshpaz) hisoblarni avtomatik yaratadi
            </p>
          </div>

          {alreadyUsed && !forceUnlock && accounts.length === 0 && (
            <div className="space-y-4 mb-2">
              <div className="flex items-start gap-2 bg-danger/10 text-danger rounded-button px-4 py-3 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Bu qurilma/brauzerda tezkor sozlash avval ishlatilgan. Agar hisoblarni allaqachon
                  yaratgan bo'lsangiz, bu sahifani endi ishlatmang — loyihadan butunlay olib tashlashni
                  so'rang. Baribir davom etmoqchi bo'lsangiz, pastdagi tugmani bosing.
                </span>
              </div>
              <button
                onClick={() => setForceUnlock(true)}
                className="w-full py-3 rounded-button border-2 border-danger text-danger font-semibold hover:bg-danger/5 transition-colors"
              >
                Baribir davom etish
              </button>
            </div>
          )}

          {(!alreadyUsed || forceUnlock) && accounts.length === 0 && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-espresso mb-2">Restoran nomi</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-espresso mb-2">Reg-key (x-reg-key)</label>
                <input
                  type="text"
                  value={regKey}
                  onChange={(e) => setRegKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso text-xs font-mono focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
                />
              </div>

              <div className="flex items-start gap-2 bg-warning/10 text-warning rounded-button px-4 py-3 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Reg-key bu sahifa kodida saqlanmaydi — faqat vaqtincha shu formada, xotirada turadi.
                  Hisoblarni yaratib bo'lgach, <strong>bu sahifani loyihadan butunlay o'chirib tashlang</strong>:
                  {' '}<code className="font-mono">src/pages/setup</code> papkasini va{' '}
                  <code className="font-mono">App.tsx</code>dagi <code className="font-mono">/setup</code> route'ni
                  olib tashlang, keyin qaytadan deploy qiling.
                </span>
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="w-full py-3.5 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60"
              >
                {isRunning ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Sozlashni boshlash
                  </>
                )}
              </button>
            </div>
          )}

          {log.length > 0 && (
            <div className="bg-espresso/5 rounded-button p-4 mb-4 space-y-1 text-xs font-mono text-espresso max-h-40 overflow-y-auto">
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="text-sm text-danger bg-danger/10 rounded-button px-4 py-3 mb-4">{errorMsg}</div>
          )}

          {accounts.length > 0 && (
            <div className="space-y-3">
              {accounts.map((account, i) => (
                <div key={i} className="bg-cream rounded-button p-4 border-2 border-soft-sand">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-terracotta">
                      {account.role}
                    </span>
                    <button
                      onClick={() => handleCopy(account, i)}
                      className="text-taupe hover:text-espresso transition-colors"
                    >
                      {copiedIndex === i ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-espresso">
                    <div>
                      <span className="text-taupe">Email:</span> {account.email}
                    </div>
                    <div>
                      <span className="text-taupe">Parol:</span> {account.password}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-button border-2 border-soft-sand text-espresso font-semibold hover:border-terracotta transition-colors"
                >
                  {copiedIndex === -1 ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  Barchasini nusxalash
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all"
                >
                  Login sahifasiga o'tish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

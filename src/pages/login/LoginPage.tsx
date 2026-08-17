import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, Lock, Eye, EyeOff, LogIn, Info } from 'lucide-react';
import { useAuth, roleToPath } from '../../contexts/AuthContext';
import type { User } from '../../types';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

// Faqat lokal test uchun ko'rsatilgan demo hisoblar (parol: demo123)
const demoAccounts = [
  { email: 'super@rayhon.uz', labelKey: 'auth.superAdmin' },
  { email: 'aziz@rayhon.uz', labelKey: 'auth.restaurantAdmin' },
  { email: 'ceo@rayhon.uz', labelKey: 'auth.ceo' },
  { email: 'kitchen@rayhon.uz', labelKey: 'auth.kitchen' },
  { email: 'waiter@rayhon.uz', labelKey: 'auth.waiter' },
  { email: 'cashier@rayhon.uz', labelKey: 'auth.cashier' },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('auth.fillAllFields');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      // Muvaffaqiyatli kirishdan so'ng foydalanuvchi o'z roliga mos sahifaga yo'naltiriladi
      const raw = localStorage.getItem('rayhon_auth_user');
      const user: User | null = raw ? JSON.parse(raw) : null;
      navigate(user ? roleToPath[user.role] : '/login', { replace: true });
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setFormError(null);
  };

  const displayError = formError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-soft-sand flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-espresso to-deep-brown flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ChefHat className="w-8 h-8 text-terracotta" />
          </div>
          <h1 className="text-3xl font-bold text-espresso mb-2 tracking-tight">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-taupe">Rayhon Restaurant OS</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-card shadow-md border border-soft-sand p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-taupe absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@rayhon.uz"
                autoComplete="username"
                className="w-full pl-11 pr-4 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-taupe absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-11 pr-11 py-3 rounded-button border-2 border-soft-sand bg-cream text-espresso placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-espresso transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {displayError && (
            <div className="text-sm text-danger bg-danger/10 rounded-button px-4 py-3">
              {t(displayError)}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 bg-white/60 border border-soft-sand rounded-card p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-espresso mb-3">
            <Info className="w-4 h-4 text-terracotta" />
            {t('auth.demoAccounts')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="text-left px-3 py-2 rounded-button border border-soft-sand hover:border-terracotta hover:bg-terracotta/5 transition-colors"
              >
                <div className="text-xs font-semibold text-espresso">{t(acc.labelKey)}</div>
                <div className="text-[11px] text-taupe truncate">{acc.email}</div>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-taupe mt-3">{t('auth.demoPasswordHint')}</p>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ChefHat, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, roleToPath } from '../../contexts/AuthContext';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const homePath = currentUser ? roleToPath[currentUser.role] : '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-white to-soft-sand flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-espresso to-deep-brown flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ChefHat className="w-10 h-10 text-terracotta" />
        </div>

        <div className="text-8xl font-bold text-espresso/10 leading-none mb-2 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-espresso mb-2">
          {t('notFound.title', 'Sahifa topilmadi')}
        </h1>
        <p className="text-taupe mb-8">
          {t('notFound.description', "Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.")}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-button border-2 border-soft-sand text-espresso font-semibold hover:border-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notFound.back', 'Orqaga')}
          </button>
          <button
            onClick={() => navigate(homePath, { replace: true })}
            className="flex items-center gap-2 px-5 py-3 rounded-button bg-gradient-to-br from-terracotta to-danger text-white font-semibold hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            {t('notFound.home', 'Bosh sahifa')}
          </button>
        </div>
      </div>
    </div>
  );
}

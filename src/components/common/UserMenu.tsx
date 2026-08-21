import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function UserMenu() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const initial = currentUser.name.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-button hover:bg-soft-sand transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center font-bold flex-shrink-0">
          {initial}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-espresso leading-tight">
            {currentUser.name}
          </div>
          <div className="text-xs text-taupe leading-tight">{currentUser.email}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-taupe" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-button shadow-lg border border-soft-sand z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-soft-sand">
              <div className="text-sm font-semibold text-espresso">{currentUser.name}</div>
              <div className="text-xs text-taupe">{currentUser.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-danger hover:bg-cream transition-colors flex items-center gap-2 font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

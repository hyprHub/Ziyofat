import { ChefHat } from 'lucide-react';

/**
 * Butun sahifa uchun silliq yuklanish holati.
 * Ma'lumotlar localStorage "backend"idan async tarzda kelayotganda ko'rsatiladi.
 */
export default function PageLoader({ label }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4 animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-espresso/90 flex items-center justify-center shadow-lg animate-pulse">
        <ChefHat className="w-7 h-7 text-white" />
      </div>
      <div className="flex items-center gap-2 text-taupe">
        <span className="w-2 h-2 rounded-full bg-terracotta animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-terracotta animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-terracotta animate-bounce" />
      </div>
      {label && <p className="text-sm text-taupe">{label}</p>}
    </div>
  );
}

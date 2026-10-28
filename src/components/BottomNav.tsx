import { useStore } from '../context/StoreContext';
import { Home, Layers, ShoppingBag, Shield, MessageCircle, Flame } from 'lucide-react';

export default function BottomNav() {
  const {
    totalCartCount,
    setIsCartOpen,
    isAdminLoggedIn,
    isAdminOpen,
    setIsAdminOpen,
    setActiveCategory,
    settings,
  } = useStore();

  const handleHome = () => {
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategories = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOffers = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      dir="rtl"
    >
      <div className="grid grid-cols-4 h-16 items-center px-2">
        {/* Home */}
        <button
          onClick={handleHome}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        {/* Categories */}
        <button
          onClick={handleCategories}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 active:scale-95 transition-all"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">التصنيفات</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 active:scale-95 transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow-md animate-pulse">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">السلة</span>
        </button>

        {/* 4th Tab: Admin (if logged in) OR Offers for regular visitors */}
        {isAdminLoggedIn ? (
          <button
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            className={`flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${
              isAdminOpen
                ? 'text-amber-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold">الإدارة</span>
          </button>
        ) : (
          <a
            href={`https://wa.me/${(settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-bold">واتساب</span>
          </a>
        )}
      </div>
    </div>
  );
}

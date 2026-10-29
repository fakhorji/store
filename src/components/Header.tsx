import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CurrencyCode } from '../types';
import { CURRENCIES_CONFIG } from '../lib/currency';
import SyrianNewFlag from './icons/SyrianNewFlag';
import {
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Shield,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function Header() {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    settings,
    totalCartCount,
    setIsCartOpen,
    isAdminLoggedIn,
    isAdminOpen,
    setIsAdminOpen,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const parentCategories = categories.filter((c) => !c.parent_id);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setIsMobileMenuOpen(false);
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSpecialOffers = () => {
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const rawLogo = settings.logo_url || (typeof window !== 'undefined' ? localStorage.getItem('dz_store_logo') : '') || '';
  const currentLogo = rawLogo && typeof rawLogo === 'string' && rawLogo.trim() !== '' ? rawLogo.trim() : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-right group focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt={settings.store_name || 'الشعار'}
                    className="w-full h-full object-contain rounded-lg bg-slate-900/10 dark:bg-slate-900/40 p-0.5"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight truncate max-w-[120px] sm:max-w-none">
                  {settings.store_name || 'ديجيتال زون'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:inline">
                  متجر المنتجات الرقمية والبطاقات
                </span>
              </div>
            </button>
          </div>

          {/* Search bar (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2 lg:mx-6">
            <div className="relative w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن شدات ببجي، كانفا، بطاقات بلايستيشن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl pr-10 pl-9 py-2 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                title="تغيير العملة"
              >
                {currency === 'SYP' ? (
                  <SyrianNewFlag className="w-4 h-3 rounded-xs" />
                ) : (
                  <span>{CURRENCIES_CONFIG[currency].flag}</span>
                )}
                <span className="text-amber-500 font-bold">{CURRENCIES_CONFIG[currency].symbol}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-40 text-right">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
                      اختر عملة العرض
                    </div>
                    {(['USD', 'TRY', 'SYP'] as CurrencyCode[]).map((c) => {
                      const item = CURRENCIES_CONFIG[c];
                      const isSelected = currency === c;
                      return (
                        <button
                          key={c}
                          onClick={() => {
                            setCurrency(c);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {c === 'SYP' ? (
                              <SyrianNewFlag className="w-4 h-3 rounded-xs" />
                            ) : (
                              <span>{item.flag}</span>
                            )}
                            <span>{c}</span>
                          </div>
                          <span className="font-mono text-amber-500 font-bold">{item.symbol}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
              aria-label="تبديل المظهر"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700" />
              )}
            </button>

            {/* Special Offers (Desktop only) */}
            <button
              onClick={handleSpecialOffers}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 rounded-lg text-xs font-black shadow-sm transition-all"
            >
              <Flame className="w-3.5 h-3.5 text-red-700" />
              <span>عروض اليوم 🔥</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold flex items-center gap-1.5 transition-colors"
              title="سلة المشتريات"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />
              <span className="hidden md:inline text-xs">السلة</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin Panel Button - ONLY FOR LOGGED IN ADMIN */}
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className={`p-1.5 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all border ${
                  isAdminOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title="لوحة الإدارة"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">الإدارة</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="قائمة التصنيفات"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only shown on small screens) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن شدات، بطاقات، اشتراكات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl pr-9 pl-8 py-2 border border-slate-200/60 dark:border-slate-700/60 focus:border-amber-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>تصفح التصنيفات:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => handleSelectCategory('all')}
              className={`p-2 rounded-lg text-right text-xs font-bold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              ✦ جميع المنتجات
            </button>
            {parentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-2 rounded-lg text-right text-xs font-bold transition-colors truncate ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              handleSpecialOffers();
              setIsMobileMenuOpen(false);
            }}
            className="w-full mt-2 py-2 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-500/20"
          >
            <Flame className="w-4 h-4 text-red-500" />
            <span>تصفح عروض اليوم الحصرية</span>
          </button>
        </div>
      )}
    </header>
  );
}

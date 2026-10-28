import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CurrencyCode } from '../types';
import { CURRENCIES_CONFIG } from '../lib/currency';
import {
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Shield,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-right group focus:outline-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                  {settings.store_name || 'ديجيتال زون'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  متجر المنتجات والاشتراكات الرقمية
                </span>
              </div>
            </button>
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن شدات ببجي، كانفا، بطاقات بلايستيشن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm rounded-xl pr-10 pl-9 py-2 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
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

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                title="تغيير العملة"
              >
                <span>{CURRENCIES_CONFIG[currency].flag}</span>
                <span>{currency}</span>
                <span className="text-amber-500 font-semibold">{CURRENCIES_CONFIG[currency].symbol}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-right">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-700 mb-1">
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
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 font-bold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono">{item.symbol}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
              aria-label="تبديل المظهر"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              )}
            </button>

            {/* WhatsApp direct contact */}
            <a
              href={`https://wa.me/${(settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              title="تواصل مباشر عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>محادثة واتساب</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2 transition-colors"
              title="سلة المشتريات"
              aria-label="سلة المشتريات"
            >
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              <span className="hidden sm:inline text-xs">السلة</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Admin Panel Toggle */}
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all border ${
                isAdminOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500'
              }`}
              title="لوحة الإدارة والتحكم"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">لوحة الإدارة</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="قائمة التصنيفات"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن المنتجات أو البطاقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl pr-10 pl-9 py-2 border border-transparent focus:border-amber-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg">
          <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>التصنيفات الرئيسية:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectCategory('all')}
              className={`p-2.5 rounded-lg text-right text-xs font-bold transition-colors ${
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
                className={`p-2.5 rounded-lg text-right text-xs font-bold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

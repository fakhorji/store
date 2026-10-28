import { useState, useMemo } from 'react';
import { ToastProvider } from './context/ToastContext';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import NewsTicker from './components/NewsTicker';
import HeroSlider from './components/HeroSlider';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';
import ContinuousAdSlider from './components/ContinuousAdSlider';
import WorldCurrenciesWidget from './components/WorldCurrenciesWidget';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import GlobalLoading from './components/GlobalLoading';
import AdminPanel from './components/admin/AdminPanel';
import AdminLoginModal from './components/admin/AdminLoginModal';
import {
  Zap,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react';

function Storefront() {
  const {
    products,
    categories,
    activeCategory,
    searchQuery,
    isLoading,
    selectedProduct,
    setSelectedProduct,
  } = useStore();

  // 6 products display at first, then show more
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter products by category (including nested children) and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status === 'hidden') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCategory = product.category_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      // Category filter
      if (activeCategory === 'all') return true;

      if (product.category_id === activeCategory) return true;

      const childCategories = categories.filter((c) => c.parent_id === activeCategory);
      return childCategories.some((c) => c.id === product.category_id);
    });
  }, [products, categories, activeCategory, searchQuery]);

  // Paginated products slice
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMoreProducts = filteredProducts.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200" dir="rtl">
      {/* Global Loading Screen */}
      {isLoading && <GlobalLoading />}

      {/* Top News Ticker */}
      <NewsTicker />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero Slider */}
        <HeroSlider />

        {/* Value Proposition Badges */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  تسليم سريع ومباشر عبر واتساب
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تنفيذ مباشر لطلبك عبر واتساب بعد تأكيد التحويل
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  ضمان ذهبي معتمد 100%
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  منتجات رسمية كاملة المدة مع استبدال فوري
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  دعم فني سريع عبر واتساب
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  فريقنا متاح للرد على استفساراتكم 24 ساعة
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Nested Filter */}
        <CategoryFilter />

        {/* Products Grid (Max 6 at first) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {displayedProducts.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                لم يتم العثور على أي منتجات
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً لعرض المنتجات الرقمية المتوفرة
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Show More Products Button */}
              {hasMoreProducts && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleShowMore}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>عرض المزيد من المنتجات ({filteredProducts.length - visibleCount} إضافية)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Continuous Smooth Ad Slider (Moving to Right) */}
        <ContinuousAdSlider />

        {/* World Currencies Live Rates Widget */}
        <WorldCurrenciesWidget />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Admin Login Modal (Accessible via direct link or query param) */}
      <AdminLoginModal />

      {/* Admin Panel Dashboard (Only for Authenticated Admin) */}
      <AdminPanel />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <Storefront />
      </StoreProvider>
    </ToastProvider>
  );
}

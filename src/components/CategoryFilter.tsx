import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Gamepad2, CreditCard, Film, Bot, Terminal, Layers } from 'lucide-react';

export default function CategoryFilter() {
  const { categories, activeCategory, setActiveCategory, products } = useStore();

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Gamepad2':
      case 'Crosshair':
        return <Gamepad2 className="w-4 h-4" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4" />;
      case 'Film':
        return <Film className="w-4 h-4" />;
      case 'Bot':
        return <Bot className="w-4 h-4" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const parents = useMemo(() => {
    return categories.filter((c) => !c.parent_id && c.is_active);
  }, [categories]);

  // Find active parent or child parent
  const activeParentId = useMemo(() => {
    if (activeCategory === 'all') return null;
    const cat = categories.find((c) => c.id === activeCategory);
    if (!cat) return null;
    return cat.parent_id ? cat.parent_id : cat.id;
  }, [activeCategory, categories]);

  const activeSubcategories = useMemo(() => {
    if (!activeParentId) return [];
    return categories.filter((c) => c.parent_id === activeParentId && c.is_active);
  }, [activeParentId, categories]);

  // Count active products per category
  const countPerCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      if (p.status !== 'hidden') {
        map[p.category_id] = (map[p.category_id] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const totalActiveProducts = useMemo(() => {
    return products.filter((p) => p.status !== 'hidden').length;
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2" dir="rtl" id="products-section">
      <div className="flex flex-col gap-3">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>كتالوج المنتجات والبطاقات الرقمية</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              اختر التصنيف وتصفح الباقات مع الشحن الفوري والتسليم السريع
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
            {totalActiveProducts} منتج متوفر
          </div>
        </div>

        {/* Level 1: Parent Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>جميع المنتجات</span>
            <span className="text-[11px] opacity-80 font-mono">({totalActiveProducts})</span>
          </button>

          {parents.map((parent) => {
            const isSelected = activeParentId === parent.id;
            // compute count for parent + all its children
            const childIds = categories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
            const parentTotal =
              (countPerCategory[parent.id] || 0) +
              childIds.reduce((sum, cid) => sum + (countPerCategory[cid] || 0), 0);

            return (
              <button
                key={parent.id}
                onClick={() => setActiveCategory(parent.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/70'
                }`}
              >
                {getCategoryIcon(parent.icon)}
                <span>{parent.name}</span>
                <span className="text-[11px] opacity-80 font-mono">({parentTotal})</span>
              </button>
            );
          })}
        </div>

        {/* Level 2: Subcategories (Nested) */}
        {activeSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <span className="text-[11px] text-slate-400 font-semibold px-2 shrink-0">
              التصنيف الفرعي:
            </span>
            <button
              onClick={() => setActiveCategory(activeParentId!)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeCategory === activeParentId
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الكل في هذا القسم
            </button>
            {activeSubcategories.map((sub) => {
              const count = countPerCategory[sub.id] || 0;
              const isSubSelected = activeCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveCategory(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSubSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

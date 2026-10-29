import { motion } from 'motion/react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrencyPrice } from '../lib/currency';
import {
  Zap,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Ban,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    currency,
    currencySettings,
    setSelectedProduct,
    checkoutSingleProduct,
    addToCart,
  } = useStore();

  const isOutOfStock = product.status === 'out_of_stock';

  // Compute display price
  const displayPrice = () => {
    if (product.mode === 'packages' && product.packages && product.packages.length > 0) {
      const minPrice = Math.min(...product.packages.map((p) => p.base_price_usd));
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-slate-400 font-normal">يبدأ من</span>
          <span className="text-base sm:text-lg font-black text-amber-500 font-mono">
            {formatCurrencyPrice(minPrice, currency, currencySettings)}
          </span>
        </div>
      );
    }
    return (
      <span className="text-base sm:text-lg font-black text-amber-500 font-mono">
        {formatCurrencyPrice(product.base_price_usd, currency, currencySettings)}
      </span>
    );
  };

  const handleCardClick = () => {
    setSelectedProduct(product);
  };

  const handleQuickWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (product.mode === 'packages') {
      // open details modal so customer can choose their package
      setSelectedProduct(product);
    } else {
      checkoutSingleProduct(product, undefined, 1);
    }
  };

  const handleQuickAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (product.mode === 'packages') {
      setSelectedProduct(product);
    } else {
      addToCart(product, undefined, 1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl ${
        isOutOfStock
          ? 'opacity-70 border-slate-300 dark:border-slate-800 grayscale-[40%]'
          : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40'
      }`}
      dir="rtl"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        {product.image_url && product.image_url.trim() ? (
          <img
            src={product.image_url.trim()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
            <ShoppingBag className="w-10 h-10 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between gap-2 pointer-events-none">
          {product.mode === 'packages' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm">
              <Layers className="w-3 h-3" />
              <span>{product.packages?.length || 0} باقات</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>منتج قياسي</span>
            </span>
          )}

          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-sm">
              <Ban className="w-3 h-3" />
              <span>نفد من المخزون</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600/90 text-white backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              <span>تسليم فوري</span>
            </span>
          )}
        </div>

        {/* Delivery info tag at bottom of image */}
        <div className="absolute bottom-2 right-2.5 flex items-center gap-1 text-[11px] text-slate-300 font-medium">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="truncate max-w-[200px]">{product.delivery_time}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {product.category_name && (
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
              {product.category_name}
            </span>
          )}

          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-amber-500 transition-colors">
            {product.name}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          {/* Badges preview */}
          {product.badges && product.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.badges.slice(0, 2).map((badge, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block">السعر</span>
              {displayPrice()}
            </div>

            <div className="flex items-center gap-1 text-slate-400 group-hover:text-amber-500 transition-colors">
              <span className="text-xs font-bold">التفاصيل</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickWhatsApp}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isOutOfStock
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.98]'
              }`}
            >
              <span>طلب واتساب</span>
            </button>

            <button
              onClick={handleQuickAddCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                isOutOfStock
                  ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                  : 'border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 active:scale-[0.98]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>{product.mode === 'packages' ? 'اختر باقة' : 'إضافة'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

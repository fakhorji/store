import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductPackage } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrencyPrice } from '../lib/currency';
import {
  X,
  MessageCircle,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Info,
  Layers,
  Ban,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const {
    currency,
    currencySettings,
    addToCart,
    checkoutSingleProduct,
    settings,
  } = useStore();

  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [customerNotes, setCustomerNotes] = useState('');

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      if (product.mode === 'packages' && product.packages && product.packages.length > 0) {
        setSelectedPackage(product.packages[0]);
      } else {
        setSelectedPackage(undefined);
      }
      setQuantity(1);
      setCustomerNotes('');
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.status === 'out_of_stock';
  const unitPriceUsd = selectedPackage ? selectedPackage.base_price_usd : product.base_price_usd;
  const totalPriceUsd = unitPriceUsd * quantity;

  const formattedUnitPrice = formatCurrencyPrice(unitPriceUsd, currency, currencySettings);
  const formattedTotalPrice = formatCurrencyPrice(totalPriceUsd, currency, currencySettings);

  const handleWhatsAppOrder = () => {
    if (isOutOfStock) return;
    checkoutSingleProduct(product, selectedPackage, quantity, customerNotes);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedPackage, quantity);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {product.category_name || 'تفاصيل المنتج الرقمي'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scrollable */}
          <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Top Grid: Image + Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Image */}
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-square bg-slate-950 shadow-md">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-white">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 font-bold backdrop-blur-sm flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{product.delivery_time}</span>
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug mb-2">
                    {product.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Badges */}
                  {product.badges && product.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {product.badges.map((b, i) => (
                        <span
                          key={i}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Trust guarantees */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>ضمان كامل المدة 100%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>تنفيذ وشحن فوري</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">سعر الوحدة</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-500 font-mono">
                      {formattedUnitPrice}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block font-medium">الإجمالي الحالي</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                      {formattedTotalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode: Packages Selection */}
            {product.mode === 'packages' && product.packages && product.packages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>اختر الباقة المناسبة لك:</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    {product.packages.length} خيارات متاحة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    const pkgPrice = formatCurrencyPrice(pkg.base_price_usd, currency, currencySettings);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-right transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-slate-400 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                              {pkg.name}
                            </span>
                            {pkg.badge && (
                              <span className="text-[10px] font-semibold text-amber-500">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-left font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                          {pkgPrice}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  الكمية المطلوبة
                </span>
                <span className="text-[11px] text-slate-400">
                  حدد عدد مرات تكرار الباقة / المنتج
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono font-black text-base w-6 text-center text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer Notes / Player ID Input */}
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                بيانات التسليم أو ملاحظات إضافية (اختياري):
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="أدخل الآيدي ID الخاص بك (لببجي)، أو الإيميل، أو أي ملاحظات لتسريع تنفيذ الطلب..."
                className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Features bullet list */}
            {product.features && product.features.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>مميزات هذا المنتج:</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-0 z-20 p-4 sm:p-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] text-slate-400">الإجمالي الشامل:</span>
              <span className="text-xl font-black text-amber-500 font-mono">
                {formattedTotalPrice}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto sm:mr-auto">
              {/* WhatsApp Checkout Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 active:scale-[0.98]'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <Ban className="w-4 h-4" />
                    <span>نفد من المخزون</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>طلب فوري عبر واتساب</span>
                  </>
                )}
              </button>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
                  isOutOfStock
                    ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 active:scale-[0.98]'
                }`}
                title="إضافة إلى السلة"
              >
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">أضف للسلة</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

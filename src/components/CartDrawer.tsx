import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { formatCurrencyPrice } from '../lib/currency';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    currency,
    currencySettings,
    totalCartUsd,
    totalCartCount,
    checkoutCart,
  } = useStore();

  const [customerNotes, setCustomerNotes] = useState('');

  if (!isCartOpen) return null;

  const formattedGrandTotal = formatCurrencyPrice(totalCartUsd, currency, currencySettings);

  const handleCheckout = () => {
    checkoutCart(customerNotes);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    سلة المشتريات
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {totalCartCount} {totalCartCount === 1 ? 'عنصر' : 'عناصر'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="p-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                    title="تفريغ السلة"
                  >
                    تفريغ
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    سلتك فارغة حالياً
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                    لم تقم بإضافة أي منتجات رقمية بعد. اختر باقاتك وبطاقاتك المفضلة وأضفها للسلة.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center gap-2"
                  >
                    <span>تصفح المنتجات الآن</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const itemPriceFormatted = formatCurrencyPrice(
                    item.totalPriceUsd,
                    currency,
                    currencySettings
                  );
                  return (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex gap-3 relative"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-950 shrink-0"
                      />

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          {item.selectedPackage && (
                            <span className="inline-block mt-0.5 text-[11px] font-semibold text-amber-500">
                              باقة: {item.selectedPackage.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                          {/* Quantity control */}
                          <div className="flex items-center gap-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 px-1 py-0.5">
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold w-4 text-center text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-1 hover:text-amber-500 text-slate-600 dark:text-slate-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="font-mono font-black text-xs sm:text-sm text-amber-500">
                            {itemPriceFormatted}
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="absolute top-2.5 left-2.5 text-slate-400 hover:text-rose-500 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}

              {/* Customer Notes */}
              {cart.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                    ملاحظات للطلب / الآيدي / الإيميل:
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="اكتب الآيدي الخاص بك أو أي بيانات يحتاجها فريق التنفيذ..."
                    className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none placeholder:text-slate-400 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    المجموع النهائي:
                  </span>
                  <span className="text-2xl font-black text-amber-500 font-mono">
                    {formattedGrandTotal}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>إتمام الطلب عبر واتساب</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    تسليم فوري
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    دفع آمن ومضمون
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

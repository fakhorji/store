import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react';

export default function FAQSection() {
  const { faqs, settings } = useStore();
  const activeFaqs = faqs.filter((f) => f.is_active);
  const [openId, setOpenId] = useState<string | null>(activeFaqs[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (activeFaqs.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>مركز المساعدة والأسئلة الشائعة</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          كل ما تحتاج معرفته عن منتجاتنا وطرق التسليم
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          إجابات واضحة ومباشرة لكافة الاستفسارات حول الشحن، التفعيل، وطرق الدفع
        </p>
      </div>

      <div className="space-y-3">
        {activeFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          هل لديك سؤال آخر لم تجد إجابته هنا؟ تواصل مباشرة مع الدعم الفني عبر واتساب وسنساعدك فوراً!
        </p>
        <a
          href={`https://wa.me/${(settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>تواصل مع الدعم الفني عبر واتساب الآن</span>
          <span className="text-base">←</span>
        </a>
      </div>
    </section>
  );
}

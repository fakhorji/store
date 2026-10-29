import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  Send,
  Instagram,
  Facebook,
  ShieldCheck,
  Zap,
  CreditCard,
  Crown,
  Heart,
  Headphones,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function Footer() {
  const { settings } = useStore();

  const activePaymentMethods = (settings.payment_methods || []).filter((pm) => pm.is_active);

  return (
    <footer className="relative bg-slate-950 text-slate-400 text-xs border-t border-slate-800/90 pt-14 pb-24 md:pb-10 overflow-hidden" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top 3 Trust Cards Row - Symmetrical & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pb-10 mb-10 border-b border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-white text-xs sm:text-sm">تسليم سريع ومباشر</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تنفيذ وشحن فوري لطلبك عبر واتساب فور تأكيد التحويل
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-white text-xs sm:text-sm">منتجات رسمية ومضمونة</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ضمان كامل المدة 100% مع استبدال فوري عند أي عائق
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-extrabold text-white text-xs sm:text-sm">دعم فني متواصل 24/7</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                فريق خدمة عملاء متاح على مدار الساعة للإجابة على استفساراتكم
              </p>
            </div>
          </div>
        </div>

        {/* Organized 4-Column Footer Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10">
          {/* Col 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0 overflow-hidden p-0.5">
                {settings.logo_url && settings.logo_url.trim() ? (
                  <img
                    src={settings.logo_url.trim()}
                    alt={settings.store_name || 'الشعار'}
                    className="w-full h-full object-contain rounded-lg bg-slate-900/40 p-0.5"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="font-black text-base text-white block">
                  {settings.store_name}
                </span>
                <span className="text-[10px] text-slate-400">
                  منصة المنتجات الرقمية والبطاقات
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.store_tagline ||
                'متجر رقمي متخصص في شحن الألعاب الإلكترونية، بطاقات المتاجر العالمية، والاشتراكات البرمجية المعتمدة بأفضل الأسعار.'}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {settings.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors border border-slate-800"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors border border-slate-800"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors border border-slate-800"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Categories Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-white font-black text-xs sm:text-sm">الأقسام السريعة</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>شحن ألعاب وببجي</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>بطاقات بلايستيشن</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>اشتراكات كانفا وبرامج</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>مفاتيح ويندوز 11 برو</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-white font-black text-xs sm:text-sm">خدمة العملاء</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>تنفيذ مباشر للطلبات</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>دفع آمن وموثوق</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>ضمان كامل المدة</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Controlled Payment Methods (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="text-white font-black text-xs sm:text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>طرق الدفع المدعومة</span>
            </h5>
            <p className="text-[11px] text-slate-400">
              نقبل الدفع عبر البنوك والمحافظ الإلكترونية المحلية والدولية:
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activePaymentMethods.map((method) => (
                <span
                  key={method.id}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{method.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Single Horizontal Row for Copyright & Developer Attribution */}
        <div className="pt-6 border-t border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright text */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <span className="text-white font-bold">{settings.store_name}</span>
          </div>

          {/* ROYAL DEVELOPER CONTAINER ON SAME HORIZONTAL LINE WITH PULSING HEART */}
          <div className="royal-container flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/40 shadow-lg backdrop-blur-md">
            {/* Crown Icon */}
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
              <Crown className="w-3.5 h-3.5 fill-slate-950 stroke-[2]" />
            </div>

            {/* Royal Text with Interactive Pulsing Heart (No word 'حب') */}
            <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
              <span>تمت برمجة المتجر بـ</span>
              <span title="نبض الإتقان والتميز" className="inline-flex items-center">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse hover:scale-135 transition-transform duration-300 inline-block drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] cursor-pointer" />
              </span>
              <span>عن طريق</span>
              <a
                href="https://alibuild.sbs"
                target="_blank"
                rel="noopener noreferrer"
                className="royal-shimmer-text font-black text-sm tracking-wide hover:brightness-125 transition-all focus:outline-none drop-shadow-md mr-0.5"
              >
                alibuild
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

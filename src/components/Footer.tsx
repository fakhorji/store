import { useStore } from '../context/StoreContext';
import {
  Sparkles,
  MessageCircle,
  Send,
  Instagram,
  Facebook,
  ShieldCheck,
  Zap,
  CreditCard,
  Heart,
  Headphones,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function Footer() {
  const { settings } = useStore();

  const activePaymentMethods = (settings.payment_methods || []).filter((pm) => pm.is_active);

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs pt-16 pb-24 md:pb-12 overflow-hidden" dir="rtl">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Feature Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12 mb-12 border-b border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">تسليم مباشر وسريع</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تنفيذ وشحن طلباتك فوراً عبر واتساب بعد تأكيد التحويل
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">ضمان ذهبي 100%</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                أكواد واشتراكات رسمية ومضمونة طوال فترة الصلاحية
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">دعم فني متواصل 24/7</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                فريق متفرغ لمساعدتك وتلقي استفساراتك عبر واتساب
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg text-white block">
                  {settings.store_name}
                </span>
                <span className="text-[11px] text-slate-400">
                  منصة التجارة الرقمية المعتمدة
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.store_tagline ||
                'المتجر الأول المتخصص في شحن الألعاب، بطاقات المتاجر العالمية، واشتراكات البرامج والذكاء الاصطناعي مع الدفع والتسليم عبر واتساب.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              {settings.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
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
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
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
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <a
                href={`https://wa.me/${(settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors border border-emerald-500/30 flex items-center gap-1.5 font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب المتجر</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-white font-extrabold text-sm">أقسام المتجر</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>شدات ببجي وشحن ألعاب</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>بطاقات بلايستيشن وستيم</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>اشتراكات كانفا وبرامج الذكاء الاصطناعي</span>
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>مفاتيح ويندوز 11 برو والأنظمة</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Controlled Payment Methods */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-white font-extrabold text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>طرق الدفع المعتمدة</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              نستقبل الدفع عبر البنوك والمحافظ الإلكترونية المحلية والعالمية:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {activePaymentMethods.length > 0 ? (
                activePaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{method.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs">شام كاش، زين كاش، باربارا، USDT</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-1.5">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <span className="text-white font-bold">{settings.store_name}</span>
          </div>

          {/* Required Credit Link: تمت برمجة المتجر بكل حب عن طريق alibuild (alibuild.sbs) */}
          <div className="flex items-center gap-1.5 font-medium">
            <span>تمت برمجة المتجر بكل حب عن طريق</span>
            <a
              href="https://alibuild.sbs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-amber-400 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
            >
              <span>alibuild</span>
              <span className="text-[10px] opacity-75 font-mono">(.sbs)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

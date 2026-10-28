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
} from 'lucide-react';

export default function Footer() {
  const { settings, setIsAdminOpen } = useStore();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs pt-12 pb-24 md:pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white">
                {settings.store_name}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {settings.store_tagline || 'منصة متخصصة في بيع وشحن البطاقات الرقمية، اشتراكات البرامج، الألعاب، وحسابات الترفيه بأفضل الأسعار الموثوقة.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {settings.telegram_url && (
                <a
                  href={settings.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <a
                href={`https://wa.me/${(settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-xs">أقسام المتجر</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors">
                  شدات وألعاب (PUBG / Steam)
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors">
                  بطاقات المتاجر (PlayStation / Xbox)
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors">
                  اشتراكات الذكاء الاصطناعي (ChatGPT / Canva)
                </a>
              </li>
              <li>
                <a href="#products-section" className="hover:text-amber-400 transition-colors">
                  تراخيص الويندوز والبرمجيات
                </a>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-xs">الضمان والموثوقية</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>تسليم آلي وفوري للمنتجات</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ضمان كامل المدة واستبدال فوري</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>طرق دفع محلية وعالمية ميسرة</span>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-xs">وسائل الدفع المدعومة</h5>
            <p className="text-[11px] text-slate-400">
              نقبل التحويل المالي عبر المحافظ الإلكترونية والحسابات البنكية:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                شام كاش (Sham Cash)
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                زين كاش (Zain Cash)
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                باربارا (Papara)
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                USDT (TRC20)
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-semibold text-[11px] border border-slate-700">
                تحويل بنكي IBAN
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <span className="text-white font-bold">{settings.store_name}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              دخول لوحة التحكم (Admin)
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              صُنع بكل <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> لخدمتكم
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

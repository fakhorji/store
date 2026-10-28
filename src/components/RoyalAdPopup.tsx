import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Crown, Sparkles, X, MessageCircle, ExternalLink, Flame } from 'lucide-react';

interface RoyalAdPopupProps {
  forceShow?: boolean; // For preview mode in Admin Panel
  onClosePreview?: () => void;
}

export default function RoyalAdPopup({ forceShow = false, onClosePreview }: RoyalAdPopupProps) {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    // If disabled in settings, do not show
    if (!settings.popup_ad_enabled) {
      setIsOpen(false);
      return;
    }

    // Check if user already dismissed it this session
    const dismissed = sessionStorage.getItem('dz_royal_popup_dismissed');
    if (dismissed) {
      return;
    }

    // Delay before showing
    const delay = (settings.popup_ad_delay_seconds ?? 2) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [settings.popup_ad_enabled, settings.popup_ad_delay_seconds, forceShow]);

  const handleClose = () => {
    setIsOpen(false);
    if (!forceShow) {
      sessionStorage.setItem('dz_royal_popup_dismissed', 'true');
    }
    if (onClosePreview) {
      onClosePreview();
    }
  };

  const handleAction = () => {
    if (settings.popup_ad_button_link && settings.popup_ad_button_link.trim()) {
      const link = settings.popup_ad_button_link.trim();
      if (link.startsWith('#')) {
        handleClose();
        const el = document.querySelector(link);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(link, '_blank');
        handleClose();
      }
    } else {
      // Direct WhatsApp checkout for this royal promo
      const text = `${settings.whatsapp_prefix || 'مرحباً، أرغب في الاستفادة من العرض الملكي التالي:'}\n👑 *${settings.popup_ad_title || 'عرض ملكي استثنائي'}*\n${settings.popup_ad_subtitle ? `✦ ${settings.popup_ad_subtitle}\n` : ''}أرجو تزويدي بكيفية التحويل والاستلام المباشر. شكراً لكم!`;
      const cleanPhone = (settings.whatsapp_number || '905521234567').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        {/* Luxury Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Royal Popup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden z-10"
        >
          {/* Ambient Royal Gold Glow Header */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/60 backdrop-blur-sm transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image Container with Ambient blur */}
          {settings.popup_ad_image && (
            <div className="relative w-full h-48 sm:h-56 bg-slate-950 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 filter blur-md opacity-40"
                style={{ backgroundImage: `url(${settings.popup_ad_image})` }}
              />
              <img
                src={settings.popup_ad_image}
                alt={settings.popup_ad_title || 'عرض ملكي'}
                className="relative z-1 w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 z-2 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-7 relative z-10 text-right space-y-4">
            {/* Royal Badge & Crown */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{settings.popup_ad_badge || 'عرض ملكي خاص 👑'}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>تسليم فوري ومباشر</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-sm">
                {settings.popup_ad_title || 'عرض ملكي استثنائي لعملاء متجرنا!'}
              </h3>

              {settings.popup_ad_subtitle && (
                <p className="text-sm font-bold royal-shimmer-text mt-1.5">
                  {settings.popup_ad_subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            {settings.popup_ad_description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {settings.popup_ad_description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={handleAction}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>{settings.popup_ad_button_text || 'اطلب العرض عبر واتساب الآن'}</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                تصفح المتجر
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

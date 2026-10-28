import { useStore } from '../context/StoreContext';
import { Flame, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

export default function ContinuousAdSlider() {
  const { adBanners } = useStore();
  const activeBanners = adBanners.filter((b) => b.is_active);

  if (activeBanners.length === 0) return null;

  const handleBannerClick = (link?: string) => {
    if (link) {
      if (link.startsWith('#')) {
        const el = document.querySelector(link);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(link, '_blank');
      }
    }
  };

  // Render a single ad card with adaptive image sizing for any aspect ratio
  const renderCard = (banner: (typeof activeBanners)[0], keySuffix: string | number) => (
    <div
      key={`${banner.id}-${keySuffix}`}
      onClick={() => handleBannerClick(banner.link_url)}
      className="group relative h-[180px] sm:h-[220px] min-w-[240px] sm:min-w-[300px] max-w-[420px] rounded-2xl overflow-hidden shrink-0 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 bg-slate-900 flex flex-col justify-between"
    >
      {/* Responsive Background / Image Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Subtle vignette gradient overlays to ensure text is always legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* Badge at Top Right */}
      {banner.badge && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-black text-[10px] shadow-md backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>{banner.badge}</span>
          </span>
        </div>
      )}

      {/* Content Info at Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 z-10 text-right">
        <h5 className="font-black text-sm sm:text-base text-white leading-snug line-clamp-1 drop-shadow-md group-hover:text-amber-400 transition-colors">
          {banner.title}
        </h5>

        {banner.subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 mt-0.5 font-medium">
            {banner.subtitle}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-amber-400 mt-2 opacity-90 group-hover:opacity-100 group-hover:translate-x-[-2px] transition-all">
          <span>اطلب العرض الآن</span>
          <ArrowLeft className="w-3 h-3 transition-transform" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-8 overflow-hidden select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
              العروض والإعلانات الحصرية المستمرة
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تخفيضات وباقات مميزة متجددة - يتم الشحن والتسليم المباشر عبر واتساب
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          توقف مؤقت عند التمرير بالماوس ✦
        </span>
      </div>

      {/* Marquee Container with immediate visibility (0s wait) and infinite looping */}
      <div className="relative w-full overflow-hidden py-2">
        <div className="animate-marquee-track flex items-center gap-4">
          {/* Repeat banners 4 times to ensure complete seamless continuity on all screens */}
          {activeBanners.map((b, i) => renderCard(b, `g1-${i}`))}
          {activeBanners.map((b, i) => renderCard(b, `g2-${i}`))}
          {activeBanners.map((b, i) => renderCard(b, `g3-${i}`))}
          {activeBanners.map((b, i) => renderCard(b, `g4-${i}`))}
        </div>
      </div>
    </section>
  );
}

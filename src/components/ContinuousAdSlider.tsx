import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowLeft, Flame } from 'lucide-react';

export default function ContinuousAdSlider() {
  const { adBanners } = useStore();
  const activeBanners = adBanners.filter((b) => b.is_active);

  if (activeBanners.length === 0) return null;

  // Duplicate items for infinite seamless scroll loop
  const duplicatedBanners = [...activeBanners, ...activeBanners, ...activeBanners];

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

  return (
    <section className="py-8 overflow-hidden select-none" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              العروض والإعلانات الحصرية المستمرة
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تابع أحدث التخفيضات وباقات التوفير المميزة
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 hidden sm:inline">
          تمرير مستمر • توقف عند التمرير بالماوس
        </span>
      </div>

      {/* Marquee Track Moving to the Right */}
      <div className="relative w-full overflow-hidden py-2 mask-linear">
        <div className="animate-marquee-right flex items-center gap-4">
          {duplicatedBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              onClick={() => handleBannerClick(banner.link_url)}
              className="relative w-[280px] sm:w-[340px] h-[160px] sm:h-[180px] rounded-2xl overflow-hidden shrink-0 cursor-pointer shadow-md hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800 group"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Badge */}
              {banner.badge && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] shadow">
                  {banner.badge}
                </div>
              )}

              {/* Text Info */}
              <div className="absolute bottom-3 right-3 left-3 text-right">
                <h5 className="font-extrabold text-sm sm:text-base text-white leading-tight drop-shadow-md mb-1 group-hover:text-amber-400 transition-colors">
                  {banner.title}
                </h5>
                {banner.subtitle && (
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {banner.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 mt-1.5 opacity-90 group-hover:opacity-100">
                  <span>اطلب العرض الآن</span>
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useStore } from '../context/StoreContext';
import { Flame, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

export default function ContinuousAdSlider() {
  const { adBanners } = useStore();
  const activeBanners = useMemo(() => adBanners.filter((b) => b.is_active), [adBanners]);

  if (activeBanners.length === 0) return null;

  // Build a rich set of banners so that a single group is at least 8 items long
  // This guarantees seamless rendering on all screens up to 4K without premature ending
  const groupBanners = useMemo(() => {
    let items = [...activeBanners];
    while (items.length < 8) {
      items = [...items, ...activeBanners];
    }
    return items;
  }, [activeBanners]);

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

  // Render a single ad card that hugs the image tightly like a glove without side black bars
  const renderCard = (banner: (typeof activeBanners)[0], keySuffix: string | number) => {
    const hasTitle = Boolean(banner.title && banner.title.trim().length > 0);
    const hasSubtitle = Boolean(banner.subtitle && banner.subtitle.trim().length > 0);
    const hasBadge = Boolean(banner.badge && banner.badge.trim().length > 0);
    const hasTextContent = hasTitle || hasSubtitle;

    return (
      <div
        key={`${banner.id}-${keySuffix}`}
        onClick={() => handleBannerClick(banner.link_url)}
        className="group relative h-48 sm:h-56 md:h-60 w-auto shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-900"
        dir="rtl"
      >
        {/* Crisp foreground image that dictates the container's exact width (1:1 square, 4:3, 16:9, etc.) */}
        <img
          src={banner.image_url}
          alt={banner.title || 'إعلان ترويجي'}
          className="h-48 sm:h-56 md:h-60 w-auto max-w-none block object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Subtle bottom gradient overlay only when text content exists */}
        {hasTextContent && (
          <div className="absolute inset-0 z-2 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
        )}

        {/* Optional Badge at Top Right */}
        {hasBadge && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] shadow-md backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{banner.badge}</span>
            </span>
          </div>
        )}

        {/* Optional Content Info at Bottom - Only rendered if user actually provided text */}
        {hasTextContent && (
          <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 z-10 text-right">
            {hasTitle && (
              <h5 className="font-black text-sm sm:text-base text-white leading-snug line-clamp-1 drop-shadow-md group-hover:text-amber-400 transition-colors">
                {banner.title}
              </h5>
            )}

            {hasSubtitle && (
              <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 mt-0.5 font-medium drop-shadow">
                {banner.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

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
              تخفيضات وباقات متجددة على مدار الساعة - تسليم فوري ومباشر عبر واتساب
            </p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          دوامة مستمرة ✦ توقف مؤقت عند التمرير بالماوس
        </span>
      </div>

      {/* Marquee Wrapper with subtle side gradient fades - explicit dir="ltr" to ensure zero blank start in RTL */}
      <div className="relative w-full overflow-hidden py-2" dir="ltr">
        {/* Soft edge masks */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />

        {/* Continuous Vortex Track: 3 identical clones loop endlessly from -33.333333% to 0% with ZERO gap and ZERO blank start */}
        <div className="animate-vortex-track flex items-center">
          {/* Group 1 */}
          <div className="flex shrink-0 items-center gap-4 px-2">
            {groupBanners.map((banner, idx) => renderCard(banner, `g1-${idx}`))}
          </div>
          {/* Group 2 (Immediately visible in viewport from millisecond 0) */}
          <div className="flex shrink-0 items-center gap-4 px-2" aria-hidden="true">
            {groupBanners.map((banner, idx) => renderCard(banner, `g2-${idx}`))}
          </div>
          {/* Group 3 (Overflow buffer) */}
          <div className="flex shrink-0 items-center gap-4 px-2" aria-hidden="true">
            {groupBanners.map((banner, idx) => renderCard(banner, `g3-${idx}`))}
          </div>
        </div>
      </div>
    </section>
  );
}

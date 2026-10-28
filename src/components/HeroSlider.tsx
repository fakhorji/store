import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft, ArrowLeft, Sparkles } from 'lucide-react';

export default function HeroSlider() {
  const { sliders } = useStore();
  const activeSliders = sliders.filter((s) => s.is_active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (activeSliders.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeSliders.length);
  }, [activeSliders.length]);

  const prevSlide = useCallback(() => {
    if (activeSliders.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeSliders.length) % activeSliders.length);
  }, [activeSliders.length]);

  useEffect(() => {
    if (isPaused || activeSliders.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeSliders.length]);

  if (activeSliders.length === 0) return null;

  const current = activeSliders[currentIndex] || activeSliders[0];

  const handleCtaClick = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-2"
      dir="rtl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[240px] sm:h-[360px] md:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {/* Background Image with Overlay */}
            <img
              src={current.image_url}
              alt={current.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/90" />

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-6 sm:p-10 md:p-14 max-w-2xl text-right">
              {current.tag && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold w-fit mb-3 backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{current.tag}</span>
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-2 sm:mb-3 drop-shadow-md"
              >
                {current.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xs sm:text-base text-slate-300 mb-4 sm:mb-6 line-clamp-2 max-w-xl font-medium"
              >
                {current.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <button
                  onClick={handleCtaClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>{current.button_text || 'تصفح العروض'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {activeSliders.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md flex items-center justify-center border border-white/10 transition-all hover:scale-105"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md flex items-center justify-center border border-white/10 transition-all hover:scale-105"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Pagination */}
        {activeSliders.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {activeSliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-7 h-2 bg-amber-400 shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`الشريحة ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

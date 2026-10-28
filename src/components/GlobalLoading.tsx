import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white" dir="rtl">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
          className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-500"
        />
        <div className="absolute flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center"
      >
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          ديجيتال زون | DigitalZone
        </h2>
        <p className="text-sm text-slate-400">
          جاري تحميل المنتجات وأسعار الصرف اللحظية...
        </p>
      </motion.div>
    </div>
  );
}

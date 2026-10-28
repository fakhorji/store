import { useStore } from '../context/StoreContext';
import { DollarSign, RefreshCw, Zap } from 'lucide-react';

export default function CurrencyRatesBar() {
  const { currencySettings } = useStore();

  const formattedTry = Number(currencySettings.try_rate).toFixed(2);
  const formattedSyp = new Intl.NumberFormat('ar-SY').format(Math.round(currencySettings.syp_rate));

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-1.5 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Rates Section */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>أسعار الصرف المعتمدة:</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700/60 font-mono text-[11px] text-white">
            <span className="text-slate-400 font-sans">1$ =</span>
            <span className="text-emerald-400 font-semibold">{formattedTry} ₺</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 font-semibold">{formattedSyp} ل.س</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
            {currencySettings.mode === 'api' ? (
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3 h-3" />
                مزامنة آلية (API Live)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <RefreshCw className="w-3 h-3 text-slate-500" />
                تسعير يدوي رسمي
              </span>
            )}
          </div>
        </div>

        {/* Live Support Badge */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400 font-medium">التسليم الفوري متاح 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

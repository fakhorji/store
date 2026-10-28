import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveCurrencySettings } from '../../lib/supabase';
import { fetchLiveExchangeRates } from '../../lib/currency';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  Zap,
  Edit3,
  RefreshCw,
  Calculator,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function AdminCurrency() {
  const { currencySettings, setCurrencySettings } = useStore();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'api' | 'manual'>(currencySettings.mode);
  const [tryRate, setTryRate] = useState<number>(currencySettings.try_rate);
  const [sypRate, setSypRate] = useState<number>(currencySettings.syp_rate);
  const [isFetchingApi, setIsFetchingApi] = useState(false);

  // Live test calculator state
  const [testUsdAmount, setTestUsdAmount] = useState<number>(10);

  const handleFetchApiRates = async () => {
    setIsFetchingApi(true);
    try {
      const res = await fetchLiveExchangeRates();
      if (res.success && res.tryRate) {
        setTryRate(res.tryRate);
        if (res.sypRate) setSypRate(res.sypRate);
        showToast(`تم جلب سعر الصرف الحي بنجاح: 1$ = ${res.tryRate} ₺`, 'success');
      } else {
        showToast('تعذر الاتصال بخدمة أسعار الصرف الحية', 'error');
      }
    } catch {
      showToast('خطأ أثناء جلب أسعار الصرف', 'error');
    } finally {
      setIsFetchingApi(false);
    }
  };

  const handleSaveSettings = async () => {
    const updated = {
      base_currency: 'USD' as const,
      mode,
      try_rate: Number(tryRate),
      syp_rate: Number(sypRate),
      last_updated: new Date().toISOString(),
    };

    await saveCurrencySettings(updated);
    setCurrencySettings(updated);
    showToast('تم حفظ إعدادات أسعار الصرف ومزامنتها بنجاح!', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span>مدير العملات ومعدلات أسعار الصرف (Currency Manager)</span>
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          العملة الأساسية لتسعير المنتجات هي الدولار الأمريكي (USD)، ويتم تحويل الأسعار لـ TRY و SYP وفق هذه المعدلات.
        </p>
      </div>

      {/* Mode Selector Toggle */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-200 block">
          طريقة تحديث أسعار الصرف:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('api')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all ${
              mode === 'api'
                ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block">
                1. وضع المزامنة اللحظية (API Mode)
              </span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                جلب وتحديث أسعار الصرف الرسمية العالمية تلقائياً عبر واجهة API حية.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all ${
              mode === 'manual'
                ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block">
                2. وضع التسعير اليدوي (Manual Mode)
              </span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                تحديد أسعار الصرف لليرة التركية والليرة السورية يدوياً حسب سعر السوق المحلي.
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Exchange Rates Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-white">
            معدلات الصرف المعتمدة مقابل (1 USD):
          </span>
          {mode === 'api' && (
            <button
              type="button"
              onClick={handleFetchApiRates}
              disabled={isFetchingApi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingApi ? 'animate-spin' : ''}`} />
              <span>جلب أحدث سعر الآن عبر API</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* TRY Rate */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>🇹🇷</span>
                <span>الليرة التركية (TRY)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">1 USD =</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1"
                value={tryRate}
                onChange={(e) => setTryRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-emerald-400 focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                ₺
              </span>
            </div>
          </div>

          {/* SYP Rate */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>🇸🇾</span>
                <span>الليرة السورية (SYP)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">1 USD =</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="50"
                min="1000"
                value={sypRate}
                onChange={(e) => setSypRate(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                ل.س
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتطبيق أسعار الصرف على كامل المتجر فوراً</span>
        </button>
      </div>

      {/* Live Test Converter Simulator */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          <span>محاكي التحويل المباشر للتسعير (Live Simulator)</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 block mb-1">المبلغ التجريبي بالدولار:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">$</span>
              <input
                type="number"
                min="1"
                value={testUsdAmount}
                onChange={(e) => setTestUsdAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 block mb-1">سعر العرض بالليرة التركية:</span>
            <span className="text-base font-black font-mono text-emerald-400 block">
              {(testUsdAmount * tryRate).toFixed(2)} ₺
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 block mb-1">سعر العرض بالليرة السورية:</span>
            <span className="text-base font-black font-mono text-amber-400 block">
              {new Intl.NumberFormat('ar-SY').format(Math.round(testUsdAmount * sypRate))} ل.س
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

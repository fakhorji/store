import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { MAJOR_WORLD_CURRENCIES } from '../lib/currency';
import { Globe2, Search, ArrowUpDown, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

export default function WorldCurrenciesWidget() {
  const { worldRates, currencySettings, refreshData } = useStore();
  const [search, setSearch] = useState('');
  const [baseAmount, setBaseAmount] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback realistic rates if API is not yet loaded or offline
  const fallbackRates: Record<string, number> = {
    SAR: 3.75,
    AED: 3.67,
    KWD: 0.31,
    QAR: 3.64,
    EGP: 48.65,
    JOD: 0.71,
    TRY: currencySettings.try_rate || 34.25,
    EUR: 0.92,
    GBP: 0.78,
    CAD: 1.38,
    AUD: 1.51,
    BHD: 0.38,
    OMR: 0.38,
    IQD: 1310,
    JPY: 153.2,
    SYP: currencySettings.syp_rate || 14800,
  };

  const currenciesList = useMemo(() => {
    return MAJOR_WORLD_CURRENCIES.map((c) => {
      let rate = worldRates[c.code] || fallbackRates[c.code] || 1;
      if (c.code === 'SYP') {
        rate = currencySettings.syp_rate || 14800;
      } else if (c.code === 'TRY' && currencySettings.mode === 'manual') {
        rate = currencySettings.try_rate || 34.25;
      }
      return {
        ...c,
        rate,
      };
    });
  }, [worldRates, currencySettings, fallbackRates]);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currenciesList;
    const q = search.toLowerCase().trim();
    return currenciesList.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(q)
    );
  }, [currenciesList, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" dir="rtl">
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              <span>مؤشر العملات العالمية والعربية</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>أسعار صرف العملات المباشرة مقابل الدولار ($)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              متابعة حية لأسعار صرف العملات الرئيسية لحظة بلحظة عبر واجهة الربط المباشر
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Calculator input */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400">حساب:</span>
              <div className="flex items-center gap-1">
                <span className="text-amber-500 font-bold">$</span>
                <input
                  type="number"
                  min="1"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-16 bg-transparent font-mono font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن عملة (SAR, EUR, جنيه...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-none w-48 sm:w-60"
              />
            </div>

            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="تحديث الأسعار"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Currency Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-6">
          {filteredCurrencies.map((curr) => {
            const calculated = curr.rate * baseAmount;
            const isHighVal = calculated > 100;
            const formatted = new Intl.NumberFormat('en-US', {
              maximumFractionDigits: isHighVal ? 0 : 3,
              minimumFractionDigits: isHighVal ? 0 : 2,
            }).format(calculated);

            return (
              <div
                key={curr.code}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-cyan-500/50 dark:hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{curr.flag}</span>
                    <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                      {curr.code}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {curr.symbol}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                    {curr.nameAr}
                  </span>
                  <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/40">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-cyan-400 group-hover:text-amber-500 transition-colors">
                      {formatted}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {curr.symbol}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>يتم جلب هذه البيانات وتحديثها عبر API أسعار العملات المخصص والمضبوط في لوحة الإدارة</span>
          </div>
          <span>الأسعار استرشادية ومحدثة لحظة بلحظة</span>
        </div>
      </div>
    </section>
  );
}

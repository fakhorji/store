import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveCurrencySettings, saveStoreSettings } from '../../lib/supabase';
import { fetchLiveExchangeRates, extractApiEndpointAndKey } from '../../lib/currency';
import SyrianNewFlag from '../icons/SyrianNewFlag';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  Zap,
  Edit3,
  RefreshCw,
  Calculator,
  Save,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Key,
  Link,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function AdminCurrency() {
  const { currencySettings, setCurrencySettings, settings, setSettings } = useStore();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'api' | 'manual'>(currencySettings.mode);
  const [tryRate, setTryRate] = useState<number>(currencySettings.try_rate);
  const [sypRate, setSypRate] = useState<number>(currencySettings.syp_rate);
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    currencySettings.api_endpoint || settings.currency_api_endpoint || 'https://api.freecurrencyapi.com/v1/latest'
  );
  const [apiKey, setApiKey] = useState<string>(
    currencySettings.api_key || settings.currency_api_key || 'fca_live_nhQtnaXKjy4Qwr8rZXfENRhq86eRD1iggbkNRBfT'
  );
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Diagnostic Test Result State
  const [diagnostic, setDiagnostic] = useState<{
    status: 'success' | 'error' | null;
    provider: string;
    message: string;
    tryRate?: number;
    sypRate?: number;
    ratesCount?: number;
    timestamp?: string;
  } | null>(null);

  // Live test calculator state
  const [testUsdAmount, setTestUsdAmount] = useState<number>(10);

  // Smart input handlers (extracts curl command parts automatically if pasted)
  const handleEndpointInput = (val: string) => {
    const { endpoint, apiKey: extractedKey } = extractApiEndpointAndKey(val, apiKey);
    setApiEndpoint(endpoint);
    if (extractedKey) {
      setApiKey(extractedKey);
      showToast('تم استخراج الرابط ومفتاح الـ API تلقائياً من نص curl المنسوخ!', 'success');
    } else if (val.includes('sp-today') && !val.endsWith('/currencies') && endpoint.endsWith('/currencies')) {
      showToast('تم ضبط مسار /currencies تلقائياً لمنصة SP-Today لمنع حدوث خطأ 404', 'info');
    }
  };

  const handleKeyInput = (val: string) => {
    const { endpoint: extractedUrl, apiKey: extractedKey } = extractApiEndpointAndKey(apiEndpoint, val);
    setApiKey(extractedKey || val);
    if (extractedUrl && extractedUrl !== apiEndpoint) {
      setApiEndpoint(extractedUrl);
      showToast('تم التعرف على الرابط وتعيينه تلقائياً!', 'info');
    }
  };

  // Quick Presets
  const applySpTodayPreset = () => {
    setApiEndpoint('https://api-v2.sp-today.com/api/v1/currencies');
    setApiKey('68570c175d4bb0612a8d193ec475a005');
    showToast('تم تطبيق منصة SP-Today السورية (الليرة اليوم) ومفتاحك بنجاح! 🇸🇾 اضغط فحص الاتصال للتجربة', 'success');
  };

  const applyFreeCurrencyApiPreset = () => {
    setApiEndpoint('https://api.freecurrencyapi.com/v1/latest');
    setApiKey('fca_live_nhQtnaXKjy4Qwr8rZXfENRhq86eRD1iggbkNRBfT');
    showToast('تم تطبيق إعدادات FreeCurrencyAPI مع مفتاحك الحي! اضغط "فحص الاتصال" للتأكد', 'success');
  };

  const applyOpenErPreset = () => {
    setApiEndpoint('https://open.er-api.com/v6/latest/USD');
    setApiKey('');
    showToast('تم تطبيق مزود Open Exchange Rates (مجاني بدون مفتاح)', 'info');
  };

  const handleFetchApiRates = async () => {
    setIsFetchingApi(true);
    setDiagnostic(null);

    try {
      const res = await fetchLiveExchangeRates(apiEndpoint, apiKey);
      if (res.success && res.allRates) {
        if (res.tryRate) {
          setTryRate(res.tryRate);
        }
        if (res.sypRate) {
          setSypRate(res.sypRate);
        }

        setDiagnostic({
          status: 'success',
          provider: res.source,
          message: `تم جلب وتحديث أسعار الصرف بنجاح تام! تم استلام ${res.ratesCount || Object.keys(res.allRates).length} عملة بنجاح.`,
          tryRate: res.tryRate,
          sypRate: res.sypRate,
          ratesCount: res.ratesCount || Object.keys(res.allRates).length,
          timestamp: new Date().toLocaleTimeString('ar-SA'),
        });

        const rateMsg = res.sypRate
          ? `تم الاتصال بنجاح! 1$ = ${res.sypRate.toLocaleString('ar-SY')} ل.س | 1$ = ${res.tryRate || tryRate} ₺`
          : `تم الاتصال بنجاح! 1$ = ${res.tryRate || tryRate} ₺ (${res.source})`;
        showToast(rateMsg, 'success');
      } else {
        setDiagnostic({
          status: 'error',
          provider: res.source,
          message: res.errorMessage || 'تعذر استخراج بيانات العملات من الرابط أو المفتاح المُدخل.',
          timestamp: new Date().toLocaleTimeString('ar-SA'),
        });
        showToast('تعذر الاتصال بالـ API. يرجى مراجعة تفاصيل الفحص بالأسفل', 'error');
      }
    } catch (err: any) {
      setDiagnostic({
        status: 'error',
        provider: 'خطأ اتصال',
        message: err?.message || 'حدث خطأ غير متوقع أثناء إرسال الطلب للـ API.',
        timestamp: new Date().toLocaleTimeString('ar-SA'),
      });
      showToast('خطأ أثناء جلب أسعار الصرف', 'error');
    } finally {
      setIsFetchingApi(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const { endpoint, apiKey: cleanKey } = extractApiEndpointAndKey(apiEndpoint, apiKey);

    const updatedCurrency = {
      base_currency: 'USD' as const,
      mode,
      try_rate: Number(tryRate),
      syp_rate: Number(sypRate),
      api_endpoint: endpoint,
      api_key: cleanKey,
      last_updated: new Date().toISOString(),
    };

    const updatedSettings = {
      ...settings,
      currency_api_endpoint: endpoint,
      currency_api_key: cleanKey,
    };

    // 1. Instant local update (0ms delay for user)
    setCurrencySettings(updatedCurrency);
    setSettings(updatedSettings);
    showToast('تم حفظ وتطبيق إعدادات العملات وربط الـ API فوراً في قاعدة البيانات! ⚡', 'success');

    // 2. Fast background database sync
    try {
      await Promise.all([
        saveCurrencySettings(updatedCurrency),
        saveStoreSettings(updatedSettings),
      ]);
    } catch (e) {
      console.error('Supabase currency save error', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span>مدير العملات ومعدلات أسعار الصرف (Currency Manager)</span>
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          العملة الأساسية لتسعير المنتجات هي الدولار الأمريكي (USD)، ويتم تحويل الأسعار لـ TRY و SYP والعملات العالمية وفق هذه المعدلات.
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
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
              mode === 'api'
                ? 'bg-cyan-500/10 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
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
                جلب وتحديث أسعار الصرف الرسمية العالمية تلقائياً عبر FreeCurrencyAPI أو أي API حي.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
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

        {/* API Endpoint & Key Configuration when API Mode is selected */}
        {mode === 'api' && (
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4" />
                <span>إعدادات مزود الـ API للأسعار الحية (Live Currency API Settings):</span>
              </span>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer w-fit"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showGuide ? 'إخفاء الشرح التوضيحي' : 'شرح كيفية إضافة الرابط والمفتاح 💡'}</span>
              </button>
            </div>

            {/* Quick 1-Click Preset Buttons */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 block">
                روابط جاهزة بنقرة واحدة (Presets لمختلف المنصات):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applySpTodayPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <SyrianNewFlag className="w-4 h-3 rounded-xs" />
                  <span>تطبيق منصة SP-Today (الليرة السورية والتركية المباشرة) 🇸🇾</span>
                </button>

                <button
                  type="button"
                  onClick={applyFreeCurrencyApiPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>تطبيق FreeCurrencyAPI مع مفتاحك الحي 🌐</span>
                </button>

                <button
                  type="button"
                  onClick={applyOpenErPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <Globe2 className="w-3 h-3" />
                  <span>مزود Open Exchange Rates (مجاني بدون مفتاح)</span>
                </button>
              </div>
            </div>

            {/* Detailed Explanation Accordion */}
            {showGuide && (
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 space-y-3.5">
                <h5 className="font-bold text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>دليل إضافة روابط ومفاتيح منصات أسعار العملات:</span>
                </h5>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-emerald-900/40 space-y-1.5">
                    <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                      <SyrianNewFlag className="w-4 h-2.5 rounded-xs" />
                      <span>1. المنصة المحلية (SP-Today / الليرة اليوم):</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      الرابط الصحيح لجلب العملات من هذه المنصة هو <span className="font-mono text-cyan-300">https://api-v2.sp-today.com/api/v1/currencies</span> (يقوم النظام تلقائياً بإضافة مسار <code className="bg-slate-800 px-1 rounded text-amber-300 font-mono">currencies</code> حتى لو كتبت رابط البداية فقط لمنع خطأ 404).
                    </p>
                    <div className="font-mono text-[11px] text-slate-300 space-y-0.5 select-all" dir="ltr">
                      <div><strong className="text-slate-400">Endpoint:</strong> https://api-v2.sp-today.com/api/v1/currencies</div>
                      <div><strong className="text-slate-400">API Key:</strong> 68570c175d4bb0612a8d193ec475a005</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-900/40 space-y-1.5">
                    <span className="font-bold text-cyan-400 text-xs flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>2. المنصات العالمية (مثل FreeCurrencyAPI):</span>
                    </span>
                    <div className="font-mono text-[11px] text-slate-300 space-y-0.5 select-all" dir="ltr">
                      <div><strong className="text-slate-400">Endpoint:</strong> https://api.freecurrencyapi.com/v1/latest</div>
                      <div><strong className="text-slate-400">API Key:</strong> fca_live_nhQtnaXKjy4Qwr8rZXfENRhq86eRD1iggbkNRBfT</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/60 space-y-1">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>3. أي منصة أو رابط مخصص ترغب به:</span>
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      الحقول مرنة وغير مقيدة؛ يمكنك إدخال أي رابط Endpoint ومفتاح خاص بك، وسيقوم النظام بتمرير الترويسات المطلوبة وقراءة البيانات سواء كانت بنية مصفوفات (Arrays) أو كائنات (Objects).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Link className="w-3.5 h-3.5 text-cyan-400" />
                  <span>رابط نقطة النهاية (Endpoint URL):</span>
                </label>
                <input
                  type="text"
                  placeholder="https://api-v2.sp-today.com/api/v1/currencies"
                  value={apiEndpoint}
                  onChange={(e) => handleEndpointInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  رابط الـ API المباشر لأي منصة محلية أو عالمية
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>مفتاح API Key:</span>
                </label>
                <input
                  type="text"
                  placeholder="مفتاح الـ API الخاص بالمنصة"
                  value={apiKey}
                  onChange={(e) => handleKeyInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  يمرره النظام كـ X-API-KEY و apikey و Bearer تلقائياً
                </span>
              </div>
            </div>

            {/* Action Bar for API mode: Test & Check */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleFetchApiRates}
                disabled={isFetchingApi}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingApi ? 'animate-spin' : ''}`} />
                <span>{isFetchingApi ? 'جاري الفحص وجلب الأسعار...' : 'فحص الاتصال وجلب أحدث الأسعار عبر API'}</span>
              </button>

              <span className="text-[11px] text-slate-400">
                يدعم: SP-Today (الليرة اليوم)، FreeCurrencyAPI، Open Exchange، وغيرها
              </span>
            </div>

            {/* Live Diagnostic Box */}
            {diagnostic && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                  diagnostic.status === 'success'
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-2">
                    {diagnostic.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{diagnostic.status === 'success' ? 'الاتصال بالـ API ناجح وقيد العمل 🟢' : 'فشل الاتصال بالـ API 🔴'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {diagnostic.timestamp}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {diagnostic.message}
                </p>

                {diagnostic.status === 'success' && (
                  <div className="pt-2 border-t border-emerald-800/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المزود المستجيب:</span>
                      <strong className="text-white text-xs">{diagnostic.provider}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">سعر الليرة السورية المستلم:</span>
                      <strong className="text-amber-400 font-mono font-bold text-xs">
                        {diagnostic.sypRate ? `1$ = ${diagnostic.sypRate.toLocaleString('ar-SY')} ل.س` : 'حسب التسعير اليدوي'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">سعر الليرة التركية المستلم:</span>
                      <strong className="text-emerald-400 font-mono font-bold text-xs">
                        {diagnostic.tryRate ? `1$ = ${diagnostic.tryRate} ₺` : 'غير متوفر'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">عدد العملات المستلمة:</span>
                      <strong className="text-cyan-400 font-mono font-bold text-xs">{diagnostic.ratesCount} عملة</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
              <span>جلب وتحديث السعر الآن عبر API</span>
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
                <SyrianNewFlag className="w-5 h-3.5 rounded-xs" />
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
          disabled={isSaving}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'جاري الحفظ والتطبيق...' : 'حفظ وتطبيق أسعار الصرف على كامل المتجر فوراً'}</span>
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
            <span className="text-[11px] text-slate-400 block mb-1">المبلغ بالدولار المراد حسابه:</span>
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

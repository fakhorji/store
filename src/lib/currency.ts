import { CurrencyCode, CurrencySettings, WorldCurrencyRate } from '../types';

export const CURRENCIES_CONFIG: Record<
  CurrencyCode,
  { name: string; symbol: string; flag: string; decimals: number }
> = {
  USD: {
    name: 'الدولار الأمريكي',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
  },
  TRY: {
    name: 'الليرة التركية',
    symbol: '₺',
    flag: '🇹🇷',
    decimals: 2,
  },
  SYP: {
    name: 'الليرة السورية',
    symbol: 'ل.س',
    flag: '🇸🇾',
    decimals: 0,
  },
};

export const MAJOR_WORLD_CURRENCIES: Omit<WorldCurrencyRate, 'rate' | 'change24h'>[] = [
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'JOD', name: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴' },
  { code: 'TRY', name: 'Turkish Lira', nameAr: 'ليرة تركية', symbol: '₺', flag: '🇹🇷' },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو أوروبي', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧' },
  { code: 'CAD', name: 'Canadian Dollar', nameAr: 'دولار كندي', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', nameAr: 'دولار أسترالي', symbol: 'A$', flag: '🇦🇺' },
  { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲' },
  { code: 'IQD', name: 'Iraqi Dinar', nameAr: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶' },
  { code: 'JPY', name: 'Japanese Yen', nameAr: 'ين ياباني', symbol: '¥', flag: '🇯🇵' },
  { code: 'SYP', name: 'Syrian Pound', nameAr: 'ليرة سورية', symbol: 'ل.س', flag: '🇸🇾' },
];

/**
 * Convert a base USD price to the target currency
 */
export function convertPrice(
  amountUsd: number,
  targetCurrency: CurrencyCode,
  settings: CurrencySettings
): number {
  if (targetCurrency === 'USD') return amountUsd;
  if (targetCurrency === 'TRY') return amountUsd * (settings.try_rate || 34.25);
  if (targetCurrency === 'SYP') return amountUsd * (settings.syp_rate || 14800);
  return amountUsd;
}

/**
 * Format a price with its currency symbol and local numbering
 */
export function formatCurrencyPrice(
  amountUsd: number,
  targetCurrency: CurrencyCode,
  settings: CurrencySettings
): string {
  const converted = convertPrice(amountUsd, targetCurrency, settings);
  const config = CURRENCIES_CONFIG[targetCurrency] || CURRENCIES_CONFIG.USD;

  if (targetCurrency === 'SYP') {
    const rounded = Math.round(converted);
    const formattedNum = new Intl.NumberFormat('ar-SY').format(rounded);
    return `${formattedNum} ${config.symbol}`;
  }

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(converted);

  return `${formattedNum} ${config.symbol}`;
}

/**
 * Fetch live exchange rates from configured or public API (USD to TRY, etc.)
 */
export async function fetchLiveExchangeRates(customEndpoint?: string, apiKey?: string): Promise<{
  tryRate?: number;
  sypRate?: number;
  allRates?: Record<string, number>;
  success: boolean;
  source: string;
}> {
  try {
    let url = customEndpoint && customEndpoint.trim() ? customEndpoint.trim() : 'https://open.er-api.com/v6/latest/USD';
    if (apiKey && apiKey.trim()) {
      if (url.includes('?')) {
        url += `&apikey=${encodeURIComponent(apiKey.trim())}`;
      } else {
        url += `?apikey=${encodeURIComponent(apiKey.trim())}`;
      }
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل جلب أسعار الصرف من الخادم');
    const data = await res.json();
    const rates = data.rates || data.conversion_rates;
    if (rates) {
      const tryRate = rates.TRY ? Number(Number(rates.TRY).toFixed(2)) : undefined;
      const sypRate = rates.SYP ? Number(Number(rates.SYP).toFixed(0)) : undefined;
      return {
        tryRate,
        sypRate,
        allRates: rates,
        success: true,
        source: customEndpoint ? 'Custom Currency API' : 'Open Exchange Rates API',
      };
    }
    throw new Error('بيانات الأسعار غير متوفرة في الاستجابة');
  } catch (err: any) {
    console.warn('Live exchange rates API fetch error', err);
    return {
      success: false,
      source: 'خطأ في الاتصال بالـ API',
    };
  }
}

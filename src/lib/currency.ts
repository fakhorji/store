import { CurrencyCode, CurrencySettings } from '../types';

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
    // Round to nearest 100 or integer for Syrian Pound
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
 * Fetch live exchange rates from public API (USD to TRY, etc.)
 */
export async function fetchLiveExchangeRates(): Promise<{
  tryRate?: number;
  sypRate?: number;
  success: boolean;
  source: string;
}> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('فشل جلب أسعار الصرف من الخادم');
    const data = await res.json();
    if (data && data.rates) {
      const tryRate = data.rates.TRY ? Number(data.rates.TRY.toFixed(2)) : undefined;
      const sypRate = data.rates.SYP ? Number(data.rates.SYP.toFixed(0)) : undefined;
      return {
        tryRate,
        sypRate,
        success: true,
        source: 'Open Exchange Rates API',
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

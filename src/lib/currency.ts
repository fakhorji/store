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
 * Parse any raw API endpoint or curl command into clean URL and API Key
 */
export function extractApiEndpointAndKey(
  rawEndpoint?: string,
  rawKey?: string
): { endpoint: string; apiKey: string } {
  let endpoint = (rawEndpoint || '').trim();
  let apiKey = (rawKey || '').trim();

  // If the user pasted a curl command like:
  // curl -H "apikey: fca_live_..." "https://api.freecurrencyapi.com/v1/latest"
  if (endpoint.toLowerCase().includes('curl')) {
    const urlMatch = endpoint.match(/https?:\/\/[^\s"']+/);
    if (urlMatch) {
      endpoint = urlMatch[0];
    }
    const keyMatch = endpoint.match(/(?:apikey|key|token)[:\s="']+([a-zA-Z0-9_\-]+)/i);
    if (keyMatch && !apiKey) {
      apiKey = keyMatch[1];
    }
  }

  // Also check if user pasted a curl command into the key field by mistake
  if (apiKey.toLowerCase().includes('curl')) {
    const keyMatch = apiKey.match(/(?:apikey|key|token)[:\s="']+([a-zA-Z0-9_\-]+)/i);
    if (keyMatch) {
      apiKey = keyMatch[1];
    }
  }

  // If URL contains apikey query parameter, extract it if apiKey is empty
  if (endpoint.includes('apikey=') || endpoint.includes('api_key=')) {
    try {
      const parsedUrl = new URL(endpoint);
      const extracted = parsedUrl.searchParams.get('apikey') || parsedUrl.searchParams.get('api_key');
      if (extracted && !apiKey) {
        apiKey = extracted;
      }
    } catch {}
  }

  // Remove any surrounding quotes
  endpoint = endpoint.replace(/^["']|["']$/g, '').trim();
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

  if (!endpoint) {
    endpoint = 'https://open.er-api.com/v6/latest/USD';
  }

  return { endpoint, apiKey };
}

/**
 * Fetch live exchange rates from configured or public API (USD to TRY, etc.)
 * Supports:
 * - FreeCurrencyAPI (data.data) with header or query apikey
 * - Open Exchange Rates / Open.er-api (data.rates)
 * - ExchangeRate-API (data.conversion_rates)
 * - Currencylayer (data.quotes)
 */
export async function fetchLiveExchangeRates(
  customEndpoint?: string,
  apiKeyParam?: string
): Promise<{
  tryRate?: number;
  sypRate?: number;
  allRates?: Record<string, number>;
  ratesCount?: number;
  success: boolean;
  source: string;
  errorMessage?: string;
}> {
  try {
    const { endpoint, apiKey } = extractApiEndpointAndKey(customEndpoint, apiKeyParam);

    let requestUrl = endpoint;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (apiKey) {
      // 1. Pass in headers as FreeCurrencyAPI requests: -H "apikey: <key>"
      headers['apikey'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;

      // 2. Also append as query param for APIs that require it in query string
      if (!requestUrl.includes('apikey=') && !requestUrl.includes('api_key=')) {
        const separator = requestUrl.includes('?') ? '&' : '?';
        requestUrl = `${requestUrl}${separator}apikey=${encodeURIComponent(apiKey)}`;
      }
    }

    const res = await fetch(requestUrl, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      let errorDetail = `خطأ HTTP (${res.status} ${res.statusText})`;
      try {
        const errJson = await res.json();
        if (errJson.message) errorDetail += `: ${errJson.message}`;
        else if (errJson.errors) errorDetail += `: ${JSON.stringify(errJson.errors)}`;
      } catch {}
      throw new Error(errorDetail);
    }

    const json = await res.json();

    // Resolve rates from various API formats:
    // 1) FreeCurrencyAPI format: { data: { "TRY": 34.25, "EUR": 0.92 } }
    // 2) Standard format: { rates: { "TRY": 34.25 } }
    // 3) ExchangeRate-API v6: { conversion_rates: { "TRY": 34.25 } }
    // 4) Currencylayer: { quotes: { "USDTRY": 34.25 } }
    let rawRates: Record<string, any> | undefined;

    if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
      rawRates = json.data;
    } else if (json.rates && typeof json.rates === 'object' && !Array.isArray(json.rates)) {
      rawRates = json.rates;
    } else if (json.conversion_rates && typeof json.conversion_rates === 'object') {
      rawRates = json.conversion_rates;
    } else if (json.quotes && typeof json.quotes === 'object') {
      rawRates = {};
      for (const [key, val] of Object.entries(json.quotes)) {
        const cleanKey = key.replace(/^USD/, '');
        rawRates[cleanKey] = val;
      }
    } else if (typeof json === 'object' && !Array.isArray(json)) {
      rawRates = json;
    }

    if (!rawRates || Object.keys(rawRates).length === 0) {
      throw new Error('تم استلام الرد بنجاح ولكن لم يتم العثور على حقل أسعار العملات (data أو rates)');
    }

    // Sanitize rates to numbers
    const cleanRates: Record<string, number> = {};
    for (const [k, v] of Object.entries(rawRates)) {
      const num = Number(v);
      if (!isNaN(num) && num > 0) {
        cleanRates[k.toUpperCase()] = num;
      }
    }

    const ratesCount = Object.keys(cleanRates).length;
    const tryRate = cleanRates.TRY ? Number(cleanRates.TRY.toFixed(2)) : undefined;
    const sypRate = cleanRates.SYP ? Number(cleanRates.SYP.toFixed(0)) : undefined;

    // Detect provider name
    let provider = 'مزود مخصص';
    if (endpoint.includes('freecurrencyapi.com')) provider = 'FreeCurrencyAPI (نشط)';
    else if (endpoint.includes('er-api.com')) provider = 'Open Exchange Rates (مجاني)';
    else if (endpoint.includes('exchangerate-api.com')) provider = 'ExchangeRate-API';

    return {
      tryRate,
      sypRate,
      allRates: cleanRates,
      ratesCount,
      success: true,
      source: provider,
    };
  } catch (err: any) {
    console.warn('Live exchange rates API fetch error', err);
    return {
      success: false,
      source: 'خطأ في الاتصال بالـ API',
      errorMessage: err?.message || 'تعذر الاتصال بمزود أسعار العملات، تحقق من الرابط والمفتاح',
    };
  }
}

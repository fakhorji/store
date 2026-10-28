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
 * Automatically normalizes local Syrian platforms (SP-Today) and international providers
 */
export function extractApiEndpointAndKey(
  rawEndpoint?: string,
  rawKey?: string
): { endpoint: string; apiKey: string } {
  let endpoint = (rawEndpoint || '').trim();
  let apiKey = (rawKey || '').trim();

  // If the user pasted a curl command like:
  // curl -H "apikey: ..." "https://..." or curl -H "X-API-KEY: ..."
  if (endpoint.toLowerCase().includes('curl')) {
    const urlMatch = endpoint.match(/https?:\/\/[^\s"']+/);
    if (urlMatch) {
      endpoint = urlMatch[0];
    }
    const keyMatch = endpoint.match(/(?:x-api-key|apikey|api_key|api-key|key|token|bearer)[:\s="']+([a-zA-Z0-9_\-]+)/i);
    if (keyMatch && !apiKey) {
      apiKey = keyMatch[1];
    }
  }

  // Also check if user pasted a curl command into the key field by mistake
  if (apiKey.toLowerCase().includes('curl')) {
    const keyMatch = apiKey.match(/(?:x-api-key|apikey|api_key|api-key|key|token|bearer)[:\s="']+([a-zA-Z0-9_\-]+)/i);
    if (keyMatch) {
      apiKey = keyMatch[1];
    }
  }

  // If URL contains apikey or api_key query parameter, extract it if apiKey is empty
  if (endpoint.includes('apikey=') || endpoint.includes('api_key=') || endpoint.includes('x-api-key=')) {
    try {
      const parsedUrl = new URL(endpoint);
      const extracted =
        parsedUrl.searchParams.get('apikey') ||
        parsedUrl.searchParams.get('api_key') ||
        parsedUrl.searchParams.get('x-api-key') ||
        parsedUrl.searchParams.get('key');
      if (extracted && !apiKey) {
        apiKey = extracted;
      }
    } catch {}
  }

  // Remove any surrounding quotes
  endpoint = endpoint.replace(/^["']|["']$/g, '').trim();
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

  // Smart normalization for SP-Today (الليرة اليوم / سيريان بوست توداي):
  // SP-Today requires the `/currencies` route, e.g. https://api-v2.sp-today.com/api/v1/currencies
  if (endpoint.includes('sp-today.com')) {
    endpoint = endpoint.replace(/\/+$/, ''); // Strip trailing slash
    if (!endpoint.endsWith('/currencies')) {
      if (endpoint.endsWith('/api/v1')) {
        endpoint = `${endpoint}/currencies`;
      } else if (endpoint.includes('/api/v1')) {
        endpoint = endpoint.replace(/\/api\/v1.*$/, '/api/v1/currencies');
      } else {
        endpoint = 'https://api-v2.sp-today.com/api/v1/currencies';
      }
    }
  }

  // Default fallback if totally empty
  if (!endpoint) {
    endpoint = 'https://open.er-api.com/v6/latest/USD';
  }

  return { endpoint, apiKey };
}

/**
 * Fetch live exchange rates from configured or public API (USD to TRY, SYP, EUR, SAR, etc.)
 * Dynamically supports:
 * 1) Local Syrian & Middle East Market APIs (SP-Today / الليرة اليوم with Damascus buy/sell rates)
 * 2) FreeCurrencyAPI (data.data) with header or query apikey
 * 3) Open Exchange Rates / Open.er-api (data.rates)
 * 4) ExchangeRate-API (data.conversion_rates)
 * 5) Currencylayer / Fixer (data.quotes)
 * 6) Any custom REST JSON endpoint returning currency maps or lists
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
      if (endpoint.includes('sp-today.com')) {
        // SP-Today requires clean X-API-KEY header or api_key query param (duplicate x-api-key headers trigger 401)
        headers['X-API-KEY'] = apiKey;
        if (!requestUrl.includes('api_key=')) {
          const separator = requestUrl.includes('?') ? '&' : '?';
          requestUrl = `${requestUrl}${separator}api_key=${encodeURIComponent(apiKey)}`;
        }
      } else {
        // Standard providers (FreeCurrencyAPI, ExchangeRate-API, Open Exchange Rates, Custom)
        headers['apikey'] = apiKey;
        headers['X-API-KEY'] = apiKey;
        if (apiKey.toLowerCase().startsWith('bearer ') || apiKey.length > 50) {
          headers['Authorization'] = apiKey.toLowerCase().startsWith('bearer ') ? apiKey : `Bearer ${apiKey}`;
        }
        if (!requestUrl.includes('apikey=') && !requestUrl.includes('api_key=')) {
          const separator = requestUrl.includes('?') ? '&' : '?';
          requestUrl = `${requestUrl}${separator}apikey=${encodeURIComponent(apiKey)}`;
        }
      }
    }

    const res = await fetch(requestUrl, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      let errorDetail = `خطأ في الخادم (${res.status} ${res.statusText})`;
      try {
        const errJson = await res.json();
        if (errJson.message) errorDetail += `: ${errJson.message}`;
        else if (errJson.error) errorDetail += `: ${typeof errJson.error === 'string' ? errJson.error : JSON.stringify(errJson.error)}`;
        else if (errJson.errors) errorDetail += `: ${JSON.stringify(errJson.errors)}`;
      } catch {}
      throw new Error(errorDetail);
    }

    const json = await res.json();

    // -------------------------------------------------------------
    // Format A: Array Data (SP-Today / Syrian Market / Currency Lists)
    // -------------------------------------------------------------
    const currencyArray = Array.isArray(json)
      ? json
      : Array.isArray(json.data?.currencies)
        ? json.data.currencies
        : Array.isArray(json.currencies)
          ? json.currencies
          : Array.isArray(json.data)
            ? json.data
            : null;

    if (currencyArray && currencyArray.length > 0) {
      const usdItem = currencyArray.find((c: any) => c?.code?.toUpperCase() === 'USD' || c?.slug === 'us-dollar');
      const tryItem = currencyArray.find((c: any) => c?.code?.toUpperCase() === 'TRY' || c?.slug === 'turkish-lira');

      const isSyrianMarket =
        usdItem?.cities?.damascus ||
        currencyArray.some((c: any) => c?.cities || (c?.code === 'USD' && (c?.sell || c?.buy) > 1000));

      if (isSyrianMarket) {
        // SP-Today & Syrian Market structure: Rates are in Syrian Pounds (SYP) for Damascus
        const usdSell = Number(
          usdItem?.cities?.damascus?.sell ||
          usdItem?.cities?.damascus?.buy ||
          usdItem?.cities?.alhasakah?.sell ||
          usdItem?.sell ||
          usdItem?.buy ||
          14325
        );
        const sypRate = usdSell;

        const trySell = Number(
          tryItem?.cities?.damascus?.sell ||
          tryItem?.cities?.damascus?.buy ||
          tryItem?.cities?.alhasakah?.sell ||
          tryItem?.sell ||
          tryItem?.buy ||
          0
        );

        // 1 USD in TRY = (1 USD in SYP) / (1 TRY in SYP)
        const tryRate = trySell > 0 ? Number((usdSell / trySell).toFixed(2)) : undefined;

        const allRates: Record<string, number> = {
          USD: 1,
          SYP: sypRate,
        };
        if (tryRate) allRates.TRY = tryRate;

        // Calculate USD-based cross rate for all other currencies
        for (const c of currencyArray) {
          const code = (c.code || c.symbol || '').toUpperCase();
          if (!code || code === 'USD') continue;
          const currSell = Number(
            c.cities?.damascus?.sell ||
            c.cities?.damascus?.buy ||
            c.cities?.alhasakah?.sell ||
            c.sell ||
            c.buy ||
            c.rate
          );
          if (currSell > 0) {
            allRates[code] = Number((usdSell / currSell).toFixed(4));
          }
        }

        const source = endpoint.includes('sp-today')
          ? 'منصة SP-Today (الليرة السورية والتركية المباشرة)'
          : 'منصة أسعار السوق المحلي';

        return {
          tryRate,
          sypRate,
          allRates,
          ratesCount: Object.keys(allRates).length,
          success: true,
          source,
        };
      } else {
        // Generic list format e.g. [{ code: 'EUR', rate: 0.92 }, { code: 'TRY', rate: 34.25 }]
        const cleanRates: Record<string, number> = { USD: 1 };
        for (const item of currencyArray) {
          const code = (item.code || item.currency || item.symbol || '').toUpperCase();
          const rate = Number(item.rate || item.value || item.price || item.sell || 0);
          if (code && rate > 0) {
            cleanRates[code] = rate;
          }
        }
        if (Object.keys(cleanRates).length > 1) {
          return {
            tryRate: cleanRates.TRY ? Number(cleanRates.TRY.toFixed(2)) : undefined,
            sypRate: cleanRates.SYP ? Number(cleanRates.SYP.toFixed(0)) : undefined,
            allRates: cleanRates,
            ratesCount: Object.keys(cleanRates).length,
            success: true,
            source: 'مزود أسعار مخصص (قائمة عملات)',
          };
        }
      }
    }

    // -------------------------------------------------------------
    // Format B: Map / Key-Value Objects
    // -------------------------------------------------------------
    // 1) FreeCurrencyAPI: { data: { "TRY": 34.25, "EUR": 0.92 } }
    // 2) Open Exchange Rates: { rates: { "TRY": 34.25 } }
    // 3) ExchangeRate-API: { conversion_rates: { "TRY": 34.25 } }
    // 4) Currencylayer: { quotes: { "USDTRY": 34.25 } }
    // 5) Flat object
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
      throw new Error('تم استلام الرد بنجاح ولكن لم يتم العثور على حقل أسعار العملات في هيكل البيانات');
    }

    // Sanitize rates to numbers
    const cleanRates: Record<string, number> = { USD: 1 };
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
    let provider = 'مزود أسعار مخصص (Custom API)';
    if (endpoint.includes('freecurrencyapi.com')) provider = 'FreeCurrencyAPI (نشط)';
    else if (endpoint.includes('er-api.com')) provider = 'Open Exchange Rates (مجاني)';
    else if (endpoint.includes('exchangerate-api.com')) provider = 'ExchangeRate-API';
    else if (endpoint.includes('sp-today.com')) provider = 'SP-Today (الليرة اليوم)';

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
      errorMessage: err?.message || 'تعذر الاتصال بمزود أسعار العملات، تحقق من صحة الرابط والمفتاح',
    };
  }
}

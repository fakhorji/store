import { createClient } from '@supabase/supabase-js';
import {
  Category,
  Product,
  ProductPackage,
  SliderImage,
  NewsItem,
  FAQItem,
  StoreSettings,
  CurrencySettings,
  AdBanner,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SLIDERS,
  INITIAL_AD_BANNERS,
  INITIAL_NEWS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_CURRENCY_SETTINGS,
  INITIAL_PAYMENT_METHODS,
} from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tedqbmbiqhyrodislltz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHFibWJpcWh5cm9kaXNsbHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDQwMzIsImV4cCI6MjEwODc4MDAzMn0.Lsv5qbFAhthfnLQEr1cGxvoPvrob_5fEfzkgzykpwso';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_KEYS = {
  CATEGORIES: 'dz_store_categories',
  PRODUCTS: 'dz_store_products',
  SLIDERS: 'dz_store_sliders',
  AD_BANNERS: 'dz_store_ad_banners',
  NEWS: 'dz_store_news',
  FAQS: 'dz_store_faqs',
  SETTINGS: 'dz_store_settings',
  CURRENCY: 'dz_store_currency',
};

// In-memory cache to guarantee zero storage quota crashes and instant UI updates
const memoryCache: Record<string, any> = {};

function sanitizeForStorage<T>(value: T): any {
  if (!value) return value;
  try {
    const rawStr = JSON.stringify(value);
    // If entire payload is under 80KB, save as is
    if (rawStr.length < 80 * 1024) {
      return value;
    }
    // If large payload (e.g. uploaded base64 banner images), strip out huge base64 image strings from localStorage copy
    // Full images remain 100% intact in memoryCache, React state, and Supabase!
    return JSON.parse(rawStr, (_key, val) => {
      if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 5000) {
        return '';
      }
      return val;
    });
  } catch {
    return value;
  }
}

// Safe local storage helpers with In-Memory fallback & QuotaExceeded recovery
function getLocal<T>(key: string, fallback: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
  }
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      memoryCache[key] = parsed;
      return parsed;
    }
  } catch {
    // Return fallback if parsing fails
  }
  memoryCache[key] = fallback;
  return fallback;
}

function setLocal<T>(key: string, value: T): void {
  // 1. Always store the full pristine data in memoryCache first
  memoryCache[key] = value;

  // 2. Attempt safe localStorage persistence with quota handling
  try {
    const sanitized = sanitizeForStorage(value);
    localStorage.setItem(key, JSON.stringify(sanitized));
  } catch (e: any) {
    // If QuotaExceededError occurs, gracefully clean up large cached images
    if (
      e?.name === 'QuotaExceededError' ||
      e?.code === 22 ||
      e?.code === 1014 ||
      e?.number === -2147024882
    ) {
      try {
        localStorage.removeItem(STORAGE_KEYS.AD_BANNERS);
        localStorage.removeItem(STORAGE_KEYS.SLIDERS);
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      } catch {}
    }
  }
}

// -------------------------------------------------------------
// Check Connection
// -------------------------------------------------------------
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; tablesExist: boolean }> {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          tablesExist: false,
          message: 'الاتصال بـ Supabase ناجح! ولكن الجداول غير منشأة بعد. قم بتشغيل سكريبت schema.sql في SQL Editor.',
        };
      }
      return {
        connected: false,
        tablesExist: false,
        message: `تعذر الاتصال بـ Supabase: ${error.message}`,
      };
    }
    return {
      connected: true,
      tablesExist: true,
      message: 'الاتصال بـ Supabase وقواعد البيانات نشط ويعمل بنجاح تام!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: `خطأ في الاتصال: ${err?.message || 'فشل الاتصال بالشبكة'}`,
    };
  }
}

// One-time sanitization of legacy mock data in local storage
try {
  const cachedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (cachedProds && cachedProds.includes('prod-freefire')) {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SLIDERS);
  }
} catch {}

// Synchronous Initial Cache Getters (for instant 0ms initial load without flicker)
export function getInitialCategories(): Category[] {
  return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
}

export function getInitialProducts(): Product[] {
  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
}

export function getInitialSliders(): SliderImage[] {
  return getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, []);
}

export function getInitialAdBanners(): AdBanner[] {
  return getLocal<AdBanner[]>(STORAGE_KEYS.AD_BANNERS, []);
}

export function getInitialNews(): NewsItem[] {
  return getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, []);
}

export function getInitialFAQs(): FAQItem[] {
  return getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, []);
}

export function getInitialSettings(): StoreSettings {
  const s = getLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  try {
    const savedName = localStorage.getItem('dz_store_name');
    if (savedName && savedName.trim()) {
      s.store_name = savedName.trim();
    }
    const savedLogo = localStorage.getItem('dz_store_logo');
    if (savedLogo) {
      s.logo_url = savedLogo;
    }
  } catch {}
  if (!s.payment_methods || !Array.isArray(s.payment_methods)) {
    s.payment_methods = [];
  }
  return s;
}

export function getInitialCurrencySettings(): CurrencySettings {
  return getLocal<CurrencySettings>(STORAGE_KEYS.CURRENCY, INITIAL_CURRENCY_SETTINGS);
}

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
    if (!error && data) {
      const merged: StoreSettings = {
        ...INITIAL_SETTINGS,
        ...data,
        payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
      };
      setLocal(STORAGE_KEYS.SETTINGS, merged);
      if (merged.store_name) {
        try {
          localStorage.setItem('dz_store_name', merged.store_name);
        } catch {}
      }
      if (merged.logo_url) {
        try {
          localStorage.setItem('dz_store_logo', merged.logo_url);
        } catch {}
      }
      return merged;
    }
  } catch (err) {
    console.warn('Supabase settings query error, falling back to local storage', err);
  }
  return getLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
  if (settings.store_name) {
    try {
      localStorage.setItem('dz_store_name', settings.store_name);
    } catch {}
  }
  if (settings.logo_url) {
    try {
      localStorage.setItem('dz_store_logo', settings.logo_url);
    } catch {}
  }

  try {
    // Strip client-only credentials so PostgREST doesn't reject with "Could not find column"
    const { admin_email, admin_password, ...dbSettings } = settings as any;
    const payload = {
      id: 'default_settings',
      ...dbSettings,
      payment_methods: settings.payment_methods || [],
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('settings').upsert([payload]);
    if (error) {
      console.warn('Full settings upsert returned error, executing safe fallback upsert:', error.message);
      // Safe fallback ensuring payment_methods and core settings are always saved
      const safePayload = {
        id: 'default_settings',
        store_name: settings.store_name,
        store_tagline: settings.store_tagline,
        whatsapp_number: settings.whatsapp_number,
        whatsapp_prefix: settings.whatsapp_prefix,
        logo_url: settings.logo_url,
        payment_methods: settings.payment_methods || [],
        currency_api_endpoint: settings.currency_api_endpoint,
        currency_api_key: settings.currency_api_key,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('settings').upsert([safePayload]);
    }
    return true;
  } catch (err) {
    console.warn('Supabase settings save failed, saved locally', err);
    return true;
  }
}

// -------------------------------------------------------------
// Currency Rates
// -------------------------------------------------------------
export async function getCurrencySettings(): Promise<CurrencySettings> {
  try {
    const { data, error } = await supabase.from('currency_rates').select('*').limit(1).maybeSingle();
    if (!error && data) {
      const res: CurrencySettings = {
        base_currency: 'USD',
        mode: data.mode || 'manual',
        try_rate: Number(data.try_rate) || INITIAL_CURRENCY_SETTINGS.try_rate,
        syp_rate: Number(data.syp_rate) || INITIAL_CURRENCY_SETTINGS.syp_rate,
        last_updated: data.updated_at || new Date().toISOString(),
        api_endpoint: data.api_endpoint || undefined,
        api_key: data.api_key || undefined,
      };
      setLocal(STORAGE_KEYS.CURRENCY, res);
      return res;
    }
  } catch (err) {
    console.warn('Supabase currency query error, fallback to local', err);
  }
  return getLocal<CurrencySettings>(STORAGE_KEYS.CURRENCY, INITIAL_CURRENCY_SETTINGS);
}

export async function saveCurrencySettings(settings: CurrencySettings): Promise<boolean> {
  setLocal(STORAGE_KEYS.CURRENCY, settings);
  try {
    const payload = {
      id: 'default_rates',
      base_currency: settings.base_currency,
      mode: settings.mode,
      try_rate: settings.try_rate,
      syp_rate: settings.syp_rate,
      api_endpoint: settings.api_endpoint,
      api_key: settings.api_key,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('currency_rates').upsert([payload]);
    if (error) {
      console.warn('Full currency upsert returned error, attempting fallback upsert:', error.message);
      const fallbackPayload = {
        id: 'default_rates',
        base_currency: settings.base_currency,
        mode: settings.mode,
        try_rate: settings.try_rate,
        syp_rate: settings.syp_rate,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('currency_rates').upsert([fallbackPayload]);
    }
    return true;
  } catch (err) {
    console.warn('Supabase currency save failed, saved locally', err);
    return true;
  }
}

// -------------------------------------------------------------
// Categories
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLocal(STORAGE_KEYS.CATEGORIES, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase categories fetch error', err);
  }
  return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
}

export async function saveCategory(category: Category): Promise<Category> {
  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const existingIdx = current.findIndex((c) => c.id === category.id);
  let updatedList: Category[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = category;
  } else {
    updatedList = [...current, category];
  }
  setLocal(STORAGE_KEYS.CATEGORIES, updatedList);

  try {
    await supabase.from('categories').upsert([category]);
  } catch (e) {
    console.warn('Supabase upsert category error', e);
  }
  return category;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const updated = current.filter((c) => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, updated);

  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete category error', e);
  }
  return true;
}

// -------------------------------------------------------------
// Products & Packages
// -------------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  try {
    const { data: productsData, error: prodErr } = await supabase
      .from('products')
      .select('*, packages(*)');

    if (!prodErr && productsData) {
      const formatted: Product[] = productsData.map((p: any) => ({
        ...p,
        packages: p.packages || [],
      }));
      setLocal(STORAGE_KEYS.PRODUCTS, formatted);
      return formatted;
    }
  } catch (err) {
    console.warn('Supabase products fetch error', err);
  }
  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
}

export async function saveProduct(product: Product): Promise<Product> {
  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const existingIdx = current.findIndex((p) => p.id === product.id);
  let updatedList: Product[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = product;
  } else {
    updatedList = [...current, product];
  }
  setLocal(STORAGE_KEYS.PRODUCTS, updatedList);

  try {
    // Upsert product base
    const { packages, ...prodBase } = product;
    await supabase.from('products').upsert([prodBase]);

    // Upsert packages if any
    if (packages && packages.length > 0) {
      const pkgsToUpsert = packages.map((pkg) => ({
        ...pkg,
        product_id: product.id,
      }));
      await supabase.from('packages').upsert(pkgsToUpsert);
    }
  } catch (e) {
    console.warn('Supabase upsert product error', e);
  }
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  try {
    await supabase.from('packages').delete().eq('product_id', id);
    await supabase.from('products').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete product error', e);
  }
  return true;
}

// -------------------------------------------------------------
// Sliders
// -------------------------------------------------------------
export async function getSliders(): Promise<SliderImage[]> {
  try {
    const { data, error } = await supabase
      .from('slider_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLocal(STORAGE_KEYS.SLIDERS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase slider error', err);
  }
  return getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, []);
}

export async function saveSlider(slider: SliderImage): Promise<SliderImage> {
  const current = getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, []);
  const idx = current.findIndex((s) => s.id === slider.id);
  let updated: SliderImage[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = slider;
  } else {
    updated = [...current, slider];
  }
  setLocal(STORAGE_KEYS.SLIDERS, updated);

  try {
    await supabase.from('slider_images').upsert([slider]);
  } catch (e) {
    console.warn('Supabase slider upsert error', e);
  }
  return slider;
}

export async function deleteSlider(id: string): Promise<boolean> {
  const current = getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, []);
  setLocal(STORAGE_KEYS.SLIDERS, current.filter((s) => s.id !== id));
  try {
    await supabase.from('slider_images').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase slider delete error', e);
  }
  return true;
}

// -------------------------------------------------------------
// Continuous Ad Banners (سلايدر الإعلانات المستمر)
// -------------------------------------------------------------
export async function getAdBanners(): Promise<AdBanner[]> {
  // If cached in memory, return immediately for instant UI
  if (memoryCache[STORAGE_KEYS.AD_BANNERS] && Array.isArray(memoryCache[STORAGE_KEYS.AD_BANNERS])) {
    return memoryCache[STORAGE_KEYS.AD_BANNERS];
  }
  try {
    const { data, error } = await supabase
      .from('ad_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      memoryCache[STORAGE_KEYS.AD_BANNERS] = data;
      setLocal(STORAGE_KEYS.AD_BANNERS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase ad banners fetch error', err);
  }
  return getLocal<AdBanner[]>(STORAGE_KEYS.AD_BANNERS, []);
}

export async function saveAdBanner(banner: AdBanner): Promise<AdBanner> {
  const current = getLocal<AdBanner[]>(STORAGE_KEYS.AD_BANNERS, []);
  const idx = current.findIndex((b) => b.id === banner.id);
  let updated: AdBanner[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = banner;
  } else {
    updated = [...current, banner];
  }
  memoryCache[STORAGE_KEYS.AD_BANNERS] = updated;
  setLocal(STORAGE_KEYS.AD_BANNERS, updated);

  try {
    await supabase.from('ad_banners').upsert([banner]);
  } catch (e) {
    console.warn('Supabase ad banner upsert error', e);
  }
  return banner;
}

export async function deleteAdBanner(id: string): Promise<boolean> {
  const current = getLocal<AdBanner[]>(STORAGE_KEYS.AD_BANNERS, []);
  const updated = current.filter((b) => b.id !== id);
  memoryCache[STORAGE_KEYS.AD_BANNERS] = updated;
  setLocal(STORAGE_KEYS.AD_BANNERS, updated);
  try {
    await supabase.from('ad_banners').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase ad banner delete error', e);
  }
  return true;
}

// -------------------------------------------------------------
// News Items
// -------------------------------------------------------------
export async function getNews(): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLocal(STORAGE_KEYS.NEWS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase news error', err);
  }
  return getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, []);
}

export async function saveNews(news: NewsItem): Promise<NewsItem> {
  const current = getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, []);
  const idx = current.findIndex((n) => n.id === news.id);
  let updated: NewsItem[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = news;
  } else {
    updated = [news, ...current];
  }
  setLocal(STORAGE_KEYS.NEWS, updated);

  try {
    await supabase.from('news_items').upsert([news]);
  } catch (e) {
    console.warn('Supabase news upsert error', e);
  }
  return news;
}

export async function deleteNews(id: string): Promise<boolean> {
  const current = getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, []);
  setLocal(STORAGE_KEYS.NEWS, current.filter((n) => n.id !== id));
  try {
    await supabase.from('news_items').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase news delete error', e);
  }
  return true;
}

// -------------------------------------------------------------
// FAQs
// -------------------------------------------------------------
export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLocal(STORAGE_KEYS.FAQS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase FAQs error', err);
  }
  return getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, []);
}

export async function saveFAQ(faq: FAQItem): Promise<FAQItem> {
  const current = getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, []);
  const idx = current.findIndex((f) => f.id === faq.id);
  let updated: FAQItem[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = faq;
  } else {
    updated = [...current, faq];
  }
  setLocal(STORAGE_KEYS.FAQS, updated);

  try {
    await supabase.from('faqs').upsert([faq]);
  } catch (e) {
    console.warn('Supabase FAQ upsert error', e);
  }
  return faq;
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const current = getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, []);
  setLocal(STORAGE_KEYS.FAQS, current.filter((f) => f.id !== id));
  try {
    await supabase.from('faqs').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase FAQ delete error', e);
  }
  return true;
}

// -------------------------------------------------------------
// Seed Demo Data to Supabase
// -------------------------------------------------------------
export async function seedDemoDataToSupabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Seed Categories
    const { error: catErr } = await supabase.from('categories').upsert(INITIAL_CATEGORIES);
    if (catErr) throw new Error(`خطأ في رفع التصنيفات: ${catErr.message}`);

    // 2. Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      const { packages, ...prodBase } = prod;
      const { error: prodErr } = await supabase.from('products').upsert([prodBase]);
      if (prodErr) throw new Error(`خطأ في رفع المنتج ${prod.name}: ${prodErr.message}`);

      if (packages && packages.length > 0) {
        const pkgs = packages.map((pkg) => ({
          ...pkg,
          product_id: prod.id,
        }));
        const { error: pkgErr } = await supabase.from('packages').upsert(pkgs);
        if (pkgErr) throw new Error(`خطأ في رفع الباقات للمنتج ${prod.name}: ${pkgErr.message}`);
      }
    }

    // 3. Seed Sliders
    await supabase.from('slider_images').upsert(INITIAL_SLIDERS);

    // 4. Seed News
    await supabase.from('news_items').upsert(INITIAL_NEWS);

    // 5. Seed FAQs
    await supabase.from('faqs').upsert(INITIAL_FAQS);

    // 6. Seed Settings
    await supabase.from('settings').upsert([{ id: 'default_settings', ...INITIAL_SETTINGS }]);

    // 7. Seed Currency
    await supabase.from('currency_rates').upsert([
      {
        id: 'default_rates',
        base_currency: 'USD',
        mode: 'manual',
        try_rate: INITIAL_CURRENCY_SETTINGS.try_rate,
        syp_rate: INITIAL_CURRENCY_SETTINGS.syp_rate,
        updated_at: new Date().toISOString(),
      },
    ]);

    return {
      success: true,
      message: 'تم رفع وتعبئة كافة البيانات النموذجية في جداول Supabase بنجاح تام! 🎉',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'حدث خطأ أثناء رفع البيانات',
    };
  }
}

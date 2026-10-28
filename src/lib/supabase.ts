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
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SLIDERS,
  INITIAL_NEWS,
  INITIAL_FAQS,
  INITIAL_SETTINGS,
  INITIAL_CURRENCY_SETTINGS,
} from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tedqbmbiqhyrodislltz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZHFibWJpcWh5cm9kaXNsbHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyMDQwMzIsImV4cCI6MjEwODc4MDAzMn0.Lsv5qbFAhthfnLQEr1cGxvoPvrob_5fEfzkgzykpwso';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORAGE_KEYS = {
  CATEGORIES: 'dz_store_categories',
  PRODUCTS: 'dz_store_products',
  SLIDERS: 'dz_store_sliders',
  NEWS: 'dz_store_news',
  FAQS: 'dz_store_faqs',
  SETTINGS: 'dz_store_settings',
  CURRENCY: 'dz_store_currency',
};

// Safe local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage save error', e);
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

// -------------------------------------------------------------
// Settings
// -------------------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const { data, error } = await supabase.from('settings').select('*').limit(1).maybeSingle();
    if (!error && data) {
      const merged = { ...INITIAL_SETTINGS, ...data };
      setLocal(STORAGE_KEYS.SETTINGS, merged);
      return merged;
    }
  } catch (err) {
    console.warn('Supabase settings query error, falling back to local storage', err);
  }
  return getLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function saveStoreSettings(settings: StoreSettings): Promise<boolean> {
  setLocal(STORAGE_KEYS.SETTINGS, settings);
  try {
    const { data } = await supabase.from('settings').select('id').limit(1).maybeSingle();
    if (data?.id) {
      await supabase.from('settings').update(settings).eq('id', data.id);
    } else {
      await supabase.from('settings').insert([settings]);
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
      base_currency: settings.base_currency,
      mode: settings.mode,
      try_rate: settings.try_rate,
      syp_rate: settings.syp_rate,
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase.from('currency_rates').select('id').limit(1).maybeSingle();
    if (data?.id) {
      await supabase.from('currency_rates').update(payload).eq('id', data.id);
    } else {
      await supabase.from('currency_rates').insert([payload]);
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

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.CATEGORIES, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase categories fetch error', err);
  }
  return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export async function saveCategory(category: Category): Promise<Category> {
  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
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
  const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
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

    if (!prodErr && productsData && productsData.length > 0) {
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
  return getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function saveProduct(product: Product): Promise<Product> {
  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
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
  const current = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
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

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.SLIDERS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase slider error', err);
  }
  return getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, INITIAL_SLIDERS);
}

export async function saveSlider(slider: SliderImage): Promise<SliderImage> {
  const current = getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, INITIAL_SLIDERS);
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
  const current = getLocal<SliderImage[]>(STORAGE_KEYS.SLIDERS, INITIAL_SLIDERS);
  setLocal(STORAGE_KEYS.SLIDERS, current.filter((s) => s.id !== id));
  try {
    await supabase.from('slider_images').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase slider delete error', e);
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

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.NEWS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase news error', err);
  }
  return getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
}

export async function saveNews(news: NewsItem): Promise<NewsItem> {
  const current = getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
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
  const current = getLocal<NewsItem[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
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

    if (!error && data && data.length > 0) {
      setLocal(STORAGE_KEYS.FAQS, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase FAQs error', err);
  }
  return getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
}

export async function saveFAQ(faq: FAQItem): Promise<FAQItem> {
  const current = getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
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
  const current = getLocal<FAQItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  CurrencySettings,
  Category,
  Product,
  ProductPackage,
  SliderImage,
  AdBanner,
  NewsItem,
  FAQItem,
  StoreSettings,
  CartItem,
  PaymentMethod,
} from '../types';
import {
  getCategories,
  getProducts,
  getSliders,
  getAdBanners,
  getNews,
  getFAQs,
  getStoreSettings,
  getCurrencySettings,
  testSupabaseConnection,
} from '../lib/supabase';
import { fetchLiveExchangeRates } from '../lib/currency';
import { generateSingleWhatsAppCheckoutUrl, generateCartWhatsAppCheckoutUrl } from '../lib/whatsapp';
import { INITIAL_PAYMENT_METHODS, INITIAL_AD_BANNERS } from '../data/mockData';
import { useToast } from './ToastContext';

interface StoreContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  currencySettings: CurrencySettings;
  setCurrencySettings: React.Dispatch<React.SetStateAction<CurrencySettings>>;
  worldRates: Record<string, number>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sliders: SliderImage[];
  setSliders: React.Dispatch<React.SetStateAction<SliderImage[]>>;
  adBanners: AdBanner[];
  setAdBanners: React.Dispatch<React.SetStateAction<AdBanner[]>>;
  news: NewsItem[];
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  faqs: FAQItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FAQItem[]>>;
  settings: StoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  cart: CartItem[];
  addToCart: (product: Product, pkg?: ProductPackage, qty?: number) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalCartCount: number;
  totalCartUsd: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  activeCategory: string; // 'all' or slug
  setActiveCategory: (slug: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminLoggedIn: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (email: string, pass: string) => boolean;
  logoutAdmin: () => void;
  isLoading: boolean;
  dbStatus: { connected: boolean; tablesExist: boolean; message: string };
  refreshData: () => Promise<void>;
  checkoutSingleProduct: (
    product: Product,
    selectedPackage?: ProductPackage,
    quantity?: number,
    notes?: string
  ) => void;
  checkoutCart: (notes?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  // 1. Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dz_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Dark modern gaming/digital default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dz_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('dz_theme', next);
      return next;
    });
  };

  // 2. Currency State
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('dz_currency') as CurrencyCode;
    return saved && ['USD', 'TRY', 'SYP'].includes(saved) ? saved : 'USD';
  });

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('dz_currency', c);
    showToast(`تم تغيير عملة العرض إلى: ${c === 'USD' ? 'الدولار الأمريكي ($)' : c === 'TRY' ? 'الليرة التركية (₺)' : 'الليرة السورية (ل.س)'}`, 'info');
  };

  // 3. Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('dz_admin_session') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL parameters on mount for admin portal link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'login' || params.get('admin') === 'portal' || params.get('admin') === 'true') {
      if (localStorage.getItem('dz_admin_session') === 'true') {
        setIsAdminOpen(true);
      } else {
        setIsAdminLoginModalOpen(true);
      }
    }
  }, []);

  const loginAdmin = (email: string, pass: string): boolean => {
    const targetEmail = (settings.admin_email || 'admin@store.com').trim().toLowerCase();
    const targetPass = (settings.admin_password || 'admin123456').trim();

    if (email.trim().toLowerCase() === targetEmail && pass.trim() === targetPass) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('dz_admin_session', 'true');
      setIsAdminLoginModalOpen(false);
      setIsAdminOpen(true);
      showToast('أهلاً بك! تم تسجيل دخول المدير بنجاح 🛡️', 'success');
      return true;
    }
    showToast('خطأ: البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('dz_admin_session');
    setIsAdminOpen(false);
    showToast('تم تسجيل الخروج من لوحة الإدارة', 'info');
  };

  // 4. Database & App State
  const [isLoading, setIsLoading] = useState(true);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>({
    base_currency: 'USD',
    mode: 'manual',
    try_rate: 34.25,
    syp_rate: 14800,
    last_updated: new Date().toISOString(),
    api_endpoint: 'https://open.er-api.com/v6/latest/USD',
    api_key: '',
  });
  const [worldRates, setWorldRates] = useState<Record<string, number>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [adBanners, setAdBanners] = useState<AdBanner[]>(INITIAL_AD_BANNERS);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    whatsapp_number: '905521234567',
    whatsapp_prefix: 'مرحباً، أرغب في إتمام طلب المنتج الرقمي التالي:',
    store_name: 'ديجيتال زون',
    store_tagline: 'المتجر الأول للمنتجات الرقمية والاشتراكات مع الدفع والتسليم عبر واتساب',
    admin_email: 'admin@store.com',
    admin_password: 'admin123456',
    payment_methods: INITIAL_PAYMENT_METHODS,
  });

  const [dbStatus, setDbStatus] = useState({
    connected: false,
    tablesExist: false,
    message: 'جاري التحقق من الاتصال بقاعدة البيانات...',
  });

  // 5. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dz_cart', JSON.stringify(cart));
  }, [cart]);

  // 6. UI navigation & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 7. Data Fetching
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await testSupabaseConnection();
      setDbStatus(status);

      const [cats, prods, slds, ads, nws, fqList, sttngs, currRates] = await Promise.all([
        getCategories(),
        getProducts(),
        getSliders(),
        getAdBanners(),
        getNews(),
        getFAQs(),
        getStoreSettings(),
        getCurrencySettings(),
      ]);

      setCategories(cats);
      setProducts(prods);
      setSliders(slds);
      setAdBanners(ads);
      setNews(nws);
      setFaqs(fqList);
      setSettings(sttngs);
      setCurrencySettings(currRates);

      // Fetch live exchange rates including world currencies
      fetchLiveExchangeRates(currRates.api_endpoint || sttngs.currency_api_endpoint, currRates.api_key || sttngs.currency_api_key)
        .then((live) => {
          if (live.success && live.allRates) {
            setWorldRates(live.allRates);
            if (currRates.mode === 'api' && live.tryRate) {
              setCurrencySettings((prev) => ({
                ...prev,
                try_rate: live.tryRate || prev.try_rate,
                syp_rate: live.sypRate || prev.syp_rate,
                last_updated: new Date().toISOString(),
              }));
            }
          }
        })
        .catch((e) => console.warn('World rates fetch error', e));
    } catch (err) {
      console.error('Error fetching store data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 8. Cart Actions
  const addToCart = (product: Product, pkg?: ProductPackage, qty: number = 1) => {
    if (product.status === 'out_of_stock') {
      showToast('عذراً، هذا المنتج غير متوفر في المخزون حالياً', 'error');
      return;
    }

    const unitPrice = pkg ? pkg.base_price_usd : product.base_price_usd;
    const cartItemId = pkg ? `${product.id}_${pkg.id}` : `${product.id}_std`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPriceUsd: newQty * unitPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          product,
          selectedPackage: pkg,
          quantity: qty,
          unitPriceUsd: unitPrice,
          totalPriceUsd: qty * unitPrice,
        },
      ];
    });

    const itemLabel = pkg ? `${product.name} (${pkg.name})` : product.name;
    showToast(`تمت إضافة "${itemLabel}" إلى سلة المشتريات ✅`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            totalPriceUsd: newQty * item.unitPriceUsd,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    showToast('تم حذف العنصر من السلة', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartUsd = cart.reduce((acc, item) => acc + item.totalPriceUsd, 0);

  // 9. WhatsApp Checkout Handlers
  const checkoutSingleProduct = (
    product: Product,
    selectedPackage?: ProductPackage,
    quantity: number = 1,
    notes?: string
  ) => {
    if (product.status === 'out_of_stock') {
      showToast('المنتج غير متوفر حالياً لإتمام الطلب', 'error');
      return;
    }
    const url = generateSingleWhatsAppCheckoutUrl(
      product,
      selectedPackage,
      quantity,
      currency,
      currencySettings,
      settings,
      notes
    );
    window.location.href = url;
  };

  const checkoutCart = (notes?: string) => {
    if (cart.length === 0) {
      showToast('سلة المشتريات فارغة!', 'error');
      return;
    }
    const url = generateCartWhatsAppCheckoutUrl(
      cart,
      currency,
      currencySettings,
      settings,
      notes
    );
    window.location.href = url;
  };

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        currencySettings,
        setCurrencySettings,
        worldRates,
        categories,
        setCategories,
        products,
        setProducts,
        sliders,
        setSliders,
        adBanners,
        setAdBanners,
        news,
        setNews,
        faqs,
        setFaqs,
        settings,
        setSettings,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        totalCartCount,
        totalCartUsd,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isAdminOpen,
        setIsAdminOpen,
        isAdminLoggedIn,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        isLoading,
        dbStatus,
        refreshData,
        checkoutSingleProduct,
        checkoutCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}

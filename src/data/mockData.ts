import { Category, Product, SliderImage, AdBanner, NewsItem, FAQItem, StoreSettings, CurrencySettings, PaymentMethod } from '../types';

export const INITIAL_CURRENCY_SETTINGS: CurrencySettings = {
  base_currency: 'USD',
  mode: 'manual',
  try_rate: 34.25,
  syp_rate: 14800,
  last_updated: new Date().toISOString(),
  auto_update_interval: 60,
  api_endpoint: 'https://api-v2.sp-today.com/api/v1/currencies',
  api_key: '68570c175d4bb0612a8d193ec475a005',
};

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  store_name: 'الفاخورجي',
  store_tagline: 'المتجر الأول للمنتجات الرقمية والاشتراكات مع الدفع والتسليم عبر واتساب',
  whatsapp_number: '',
  whatsapp_prefix: 'مرحباً، أرغب في إتمام طلب المنتج الرقمي التالي:',
  logo_url: '',
  telegram_url: '',
  instagram_url: '',
  facebook_url: '',
  support_email: '',
  working_hours: 'خدمة العملاء متوفرة 24/7 - تسليم سريع ومباشر',
  notice_text: 'جميع منتجاتنا رسمية 100% ومضمونة مع دعم فني متواصل عبر واتساب',
  admin_email: '',
  admin_password: '',
  currency_api_endpoint: 'https://api-v2.sp-today.com/api/v1/currencies',
  currency_api_key: '68570c175d4bb0612a8d193ec475a005',
  payment_methods: [],
  popup_ad_enabled: false,
  popup_ad_title: '',
  popup_ad_subtitle: '',
  popup_ad_description: '',
  popup_ad_image: '',
  popup_ad_badge: '',
  popup_ad_button_text: 'اطلب العرض الآن',
  popup_ad_button_link: '',
  popup_ad_delay_seconds: 2,
};

// All mock trial items are completely removed - the app directly loads real data from the database
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_SLIDERS: SliderImage[] = [];
export const INITIAL_AD_BANNERS: AdBanner[] = [];
export const INITIAL_NEWS: NewsItem[] = [];
export const INITIAL_FAQS: FAQItem[] = [];

export type CurrencyCode = 'USD' | 'TRY' | 'SYP';

export interface CurrencyRate {
  code: CurrencyCode;
  rate: number; // multiplier from base currency (USD)
  symbol: string;
  name: string;
  formatDecimals: number;
}

export interface CurrencySettings {
  base_currency: CurrencyCode;
  mode: 'api' | 'manual';
  try_rate: number;
  syp_rate: number;
  last_updated: string;
  auto_update_interval?: number; // minutes
  api_endpoint?: string;
  api_key?: string;
}

export interface WorldCurrencyRate {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  flag: string;
  rate: number;
  change24h?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  children?: Category[];
}

export interface ProductPackage {
  id: string;
  product_id?: string;
  name: string;
  base_price_usd: number;
  quantity_label: string; // e.g. "60 شدة", "1 شهر", "10 دولار"
  sort_order: number;
  badge?: string; // e.g. "الأكثر طلباً", "وفر 20%"
  is_available: boolean;
}

export type ProductMode = 'standard' | 'packages';
export type ProductStatus = 'active' | 'out_of_stock' | 'hidden';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  mode: ProductMode;
  base_price_usd: number;
  description: string;
  image_url: string;
  status: ProductStatus;
  delivery_type: 'instant' | 'manual' | 'code';
  delivery_time: string; // e.g. "تسليم مباشر عبر واتساب بعد التحويل"
  badges?: string[];
  features?: string[];
  instructions?: string;
  sort_order?: number;
  packages?: ProductPackage[];
  created_at?: string;
}

export interface SliderImage {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  tag?: string;
}

export interface AdBanner {
  id: string;
  title?: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  badge?: string;
  sort_order: number;
  is_active: boolean;
}

export interface NewsItem {
  id: string;
  message: string;
  type: 'info' | 'alert' | 'promo';
  is_active: boolean;
  link_url?: string;
  created_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon?: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface StoreSettings {
  whatsapp_number: string;
  whatsapp_prefix: string;
  store_name: string;
  store_tagline: string;
  logo_url?: string;
  telegram_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  support_email?: string;
  working_hours?: string;
  notice_text?: string;
  admin_email?: string;
  admin_password?: string;
  currency_api_endpoint?: string;
  currency_api_key?: string;
  payment_methods?: PaymentMethod[];
  // Royal Popup Ad Settings
  popup_ad_enabled?: boolean;
  popup_ad_title?: string;
  popup_ad_subtitle?: string;
  popup_ad_description?: string;
  popup_ad_image?: string;
  popup_ad_badge?: string;
  popup_ad_button_text?: string;
  popup_ad_button_link?: string;
  popup_ad_delay_seconds?: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedPackage?: ProductPackage;
  quantity: number;
  unitPriceUsd: number;
  totalPriceUsd: number;
}

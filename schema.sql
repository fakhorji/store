-- ==============================================================================
-- DIGITAL PRODUCTS E-COMMERCE - SUPABASE SQL SCHEMA & INITIAL SEED DATA
-- المتجر الإلكتروني للمنتجات الرقمية والبطاقات والاشتراكات
-- ==============================================================================

-- 1. جدول التصنيفات المتفرعة (Categories with Nested Hierarchy Support)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنتجات (Products)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  mode TEXT NOT NULL DEFAULT 'standard' CHECK (mode IN ('standard', 'packages')),
  base_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'hidden')),
  delivery_type TEXT DEFAULT 'instant' CHECK (delivery_type IN ('instant', 'manual', 'code')),
  delivery_time TEXT DEFAULT 'تسليم سريع ومباشر عبر واتساب',
  badges JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الباقات الخاصة بالمنتجات (Product Packages)
CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quantity_label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 1,
  badge TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول سلايدر العروض الرئيسية (Hero Slider Images)
CREATE TABLE IF NOT EXISTS slider_images (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'اشحن الآن عبر واتساب',
  link_url TEXT DEFAULT '#products',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.1 جدول سلايدر الإعلانات المستمر (Continuous Ad Banners)
CREATE TABLE IF NOT EXISTS ad_banners (
  id TEXT PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  badge TEXT,
  link_url TEXT DEFAULT '#products-section',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول شريط الأخبار والتنبيهات (News Ticker)
CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'alert', 'promo')),
  is_active BOOLEAN DEFAULT true,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول الأسئلة الشائعة (FAQs)
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'عام',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول إعدادات المتجر وطرق الدفع والـ API (Store Settings)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  store_name TEXT NOT NULL DEFAULT 'ديجيتال زون',
  store_tagline TEXT DEFAULT 'المتجر الأول للمنتجات الرقمية والاشتراكات مع الدفع والتسليم عبر واتساب',
  whatsapp_number TEXT NOT NULL DEFAULT '905521234567',
  whatsapp_prefix TEXT DEFAULT 'مرحباً، أرغب في إتمام طلب المنتج الرقمي التالي:',
  logo_url TEXT,
  telegram_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  support_email TEXT,
  working_hours TEXT DEFAULT 'خدمة العملاء متوفرة 24/7 - تسليم سريع ومباشر',
  notice_text TEXT,
  currency_api_endpoint TEXT DEFAULT 'https://open.er-api.com/v6/latest/USD',
  currency_api_key TEXT,
  admin_email TEXT DEFAULT 'admin@store.com',
  admin_password TEXT DEFAULT 'admin123456',
  payment_methods JSONB DEFAULT '[
    {"id": "pm-sham", "name": "شام كاش (Sham Cash)", "nameEn": "Sham Cash", "icon": "Wallet", "description": "تحويل فوري بدون عمولة", "is_active": true, "sort_order": 1},
    {"id": "pm-zain", "name": "زين كاش (Zain Cash)", "nameEn": "Zain Cash", "icon": "Smartphone", "description": "دفع مباشر لعملاء العراق", "is_active": true, "sort_order": 2},
    {"id": "pm-papara", "name": "باربارا (Papara / IBAN)", "nameEn": "Papara", "icon": "CreditCard", "description": "تحويل فوري في تركيا", "is_active": true, "sort_order": 3},
    {"id": "pm-usdt", "name": "USDT (TRC20)", "nameEn": "USDT Crypto", "icon": "Coins", "description": "عملات رقمية مشفرة عالمياً", "is_active": true, "sort_order": 4},
    {"id": "pm-syriatel", "name": "سيريتل كاش (Syriatel Cash)", "nameEn": "Syriatel Cash", "icon": "PhoneCall", "description": "دفع عبر سيريتل كاش في سوريا", "is_active": true, "sort_order": 5},
    {"id": "pm-bank", "name": "حوالات الهرم والفؤاد", "nameEn": "Haram / Fouad", "icon": "Landmark", "description": "إرسال حوالة بالليرة السورية أو الدولار", "is_active": true, "sort_order": 6}
  ]'::jsonb,
  -- أعمدة الإعلان الملكي المنبثق في الصفحة الرئيسية (Royal Popup Ad)
  popup_ad_enabled BOOLEAN DEFAULT true,
  popup_ad_title TEXT DEFAULT 'عروض ملكية كبرى: خصم 20% على شحن الألعاب والبطاقات!',
  popup_ad_subtitle TEXT DEFAULT 'لفترة محدودة - استمتع بأقوى العروض الحصرية',
  popup_ad_description TEXT DEFAULT 'احصل على أرخص الأسعار لشحن شدات ببجي، بطاقات بلايستيشن، واشتراكات بريميوم مع تسليم فوري ومباشر عبر واتساب.',
  popup_ad_image TEXT DEFAULT 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  popup_ad_badge TEXT DEFAULT 'عرض ملكي حصري 👑',
  popup_ad_button_text TEXT DEFAULT 'اطلب العرض عبر واتساب الآن',
  popup_ad_button_link TEXT DEFAULT '',
  popup_ad_delay_seconds INTEGER DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ترقية جدول الإعدادات بإضافة كافة الأعمدة الحديثة إن كانت الجداول موجودة مسبقاً
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency_api_endpoint TEXT DEFAULT 'https://open.er-api.com/v6/latest/USD';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency_api_key TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_title TEXT DEFAULT 'عروض ملكية كبرى: خصم 20% على شحن الألعاب والبطاقات!';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_subtitle TEXT DEFAULT 'لفترة محدودة - استمتع بأقوى العروض الحصرية';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_description TEXT DEFAULT 'احصل على أرخص الأسعار لشحن شدات ببجي، بطاقات بلايستيشن، واشتراكات بريميوم مع تسليم فوري ومباشر عبر واتساب.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_image TEXT DEFAULT 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_badge TEXT DEFAULT 'عرض ملكي حصري 👑';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_button_text TEXT DEFAULT 'اطلب العرض عبر واتساب الآن';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_button_link TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS popup_ad_delay_seconds INTEGER DEFAULT 2;

-- 8. جدول أسعار العملات ومعدل الصرف (Currency Rates & Settings)
CREATE TABLE IF NOT EXISTS currency_rates (
  id TEXT PRIMARY KEY DEFAULT 'default_rates',
  base_currency TEXT DEFAULT 'USD',
  mode TEXT DEFAULT 'manual' CHECK (mode IN ('api', 'manual')),
  try_rate NUMERIC(10, 2) DEFAULT 34.25,
  syp_rate NUMERIC(10, 2) DEFAULT 14800.00,
  api_endpoint TEXT DEFAULT 'https://open.er-api.com/v6/latest/USD',
  api_key TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ترقية جدول أسعار الصرف
ALTER TABLE currency_rates ADD COLUMN IF NOT EXISTS api_endpoint TEXT DEFAULT 'https://open.er-api.com/v6/latest/USD';
ALTER TABLE currency_rates ADD COLUMN IF NOT EXISTS api_key TEXT;

-- ==============================================================================
-- تمكين الأمان وسياسات الوصول (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة العامة لجميع الجداول للمستخدمين
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Public Read Slider" ON slider_images FOR SELECT USING (true);
CREATE POLICY "Public Read AdBanners" ON ad_banners FOR SELECT USING (true);
CREATE POLICY "Public Read News" ON news_items FOR SELECT USING (true);
CREATE POLICY "Public Read FAQs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public Read Currency" ON currency_rates FOR SELECT USING (true);

-- السماح بالإدارة (Insert / Update / Delete) للـ anon و authenticated
CREATE POLICY "Allow All Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Packages" ON packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Slider" ON slider_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All AdBanners" ON ad_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All News" ON news_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All FAQs" ON faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Currency" ON currency_rates FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- تعبئة البيانات الافتراضية (INITIAL SEED DATA)
-- ==============================================================================

-- التصنيفات
INSERT INTO categories (id, name, slug, icon, description, parent_id, sort_order) VALUES
('cat-gaming', 'شحن وألعاب', 'gaming', 'Gamepad2', 'شحن شدات، جواهر، رصيد ألعاب وبطاقات المتاجر', NULL, 1),
('cat-pubg', 'شدات ببجي موبايل', 'pubg-mobile', 'Crosshair', 'شحن شدات UC ببجي عبر الآيدي ID الرسمي فوري', 'cat-gaming', 1),
('cat-game-cards', 'بطاقات المتاجر (ستور)', 'store-cards', 'CreditCard', 'بطاقات بلايستيشن، إكس بوكس، وستيم لجميع الريجينات', 'cat-gaming', 2),
('cat-subscriptions', 'اشتراكات رقمية', 'subscriptions', 'Sparkles', 'اشتراكات ترفيه، برامج التصميم، وأدوات الذكاء الاصطناعي', NULL, 2),
('cat-ai-tools', 'أدوات الذكاء الاصطناعي', 'ai-tools', 'Bot', 'اشتراكات شات جي بي تي، كلود، وكانفا برو', 'cat-subscriptions', 1),
('cat-entertainment', 'ترفيه وموسيقى', 'entertainment', 'Film', 'اشتراكات نتفلكس، سبوتيفاي، وتيليجرام بريميوم', 'cat-subscriptions', 2),
('cat-software', 'برمجيات ومفاتيح ويندوز', 'software-keys', 'Terminal', 'مفاتيح تفعيل أصلية مدى الحياة للأنظمة والأوفيس', NULL, 3)
ON CONFLICT (id) DO NOTHING;

-- المنتجات
INSERT INTO products (id, name, slug, category_id, category_name, mode, base_price_usd, description, image_url, status, delivery_type, delivery_time, badges, features, instructions) VALUES
('prod-pubg-uc', 'شدات ببجي موبايل (PUBG UC) - شحن مباشر بالـ ID', 'pubg-mobile-uc', 'cat-pubg', 'شدات ببجي موبايل', 'packages', 0.99, 'شحن شدات ببجي موبايل العالمية رسمياً ومباشرة عن طريق معرف اللاعب (Player ID). يتم تنفيذ الطلب والتسليم عبر واتساب فور تأكيد التحويل.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 'active', 'instant', 'تسليم سريع ومباشر عبر واتساب', '["الأكثر مبيعاً 🔥", "تسليم مباشر"]'::jsonb, '["شحن رسمي معتمد 100%", "لا نحتاج كلمة المرور، فقط الـ Player ID", "دعم كافة الدول والحسابات العالمية"]'::jsonb, 'يرجى تزويدنا برقم الآيدي (Player ID) واسمك داخل اللعبة في رسالة الواتساب.'),
('prod-playstation-card', 'بطاقات بلايستيشن ستور (PlayStation Network PSN)', 'playstation-network-cards', 'cat-game-cards', 'بطاقات المتاجر (ستور)', 'packages', 10.50, 'بطاقات تعبئة رصيد متجر بلايستيشن للأجهزة PS4 و PS5.', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80', 'active', 'code', 'إرسال الكود عبر واتساب بعد التحويل', '["كود رقمي أصلي", "ريجون أمريكي / سعودي"]'::jsonb, '["كود رسمي صالح للاستخدام فوراً", "صلاحية الكود دائمة ولا تنتهي"]'::jsonb, 'حدد الريجون المطلوب عند إرسال الطلب.'),
('prod-canva-pro', 'اشتراك كانفا برو (Canva Pro) - تفعيل على إيميلك الشخصي', 'canva-pro-subscription', 'cat-ai-tools', 'أدوات الذكاء الاصطناعي', 'packages', 4.99, 'احصل على اشتراك كانفا برو الرسمي لتصميم إبداعي بدون قيود. تفعيل مباشر على بريدك.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', 'active', 'instant', 'تفعيل سريع عبر واتساب خلال دقائق', '["على إيميلك الشخصي", "ضمان كامل المدة"]'::jsonb, '["وصول كامل لمكتبة التصاميم والصور", "أدوات الذكاء الاصطناعي Magic Studio", "تخزين سحابي 1 تيرابايت"]'::jsonb, 'أرسل بريدك المسجل في كانفا عبر واتساب.'),
('prod-chatgpt-plus', 'اشتراك شات جي بي تي بلس (ChatGPT Plus) - GPT-4o', 'chatgpt-plus-subscription', 'cat-ai-tools', 'أدوات الذكاء الاصطناعي', 'standard', 21.50, 'حساب رسمي مفعل باشتراك ChatGPT Plus يتيح لك أحدث نماذج GPT-4o وتوليد الصور DALL-E 3.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', 'active', 'instant', 'تسليم بيانات الحساب عبر واتساب مباشرة', '["حساب خاص", "ضمان 30 يوم"]'::jsonb, '["وصول غير محدود لـ GPT-4o", "تخصيص نماذج GPTs", "تسليم فوري للمعلومات"]'::jsonb, NULL),
('prod-telegram-premium', 'اشتراك تيليجرام بريميوم (Telegram Premium)', 'telegram-premium', 'cat-entertainment', 'ترفيه وموسيقى', 'packages', 3.50, 'ترقية حسابك الشخصي على تيليجرام لميزات بريميوم الخارقة عبر الإهداء الرسمي.', 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=800&q=80', 'active', 'instant', 'إهداء مباشر لمعرف اليوزر @username عبر واتساب', '["إهداء رسمي Gift", "بدون تسجيل دخول"]'::jsonb, '["بدون طلب كلمة المرور", "رفع ملفات حتى 4GB", "نجمة بريميوم مميزة"]'::jsonb, 'أرسل لنا معرف التلغرام الخاص بك @username.'),
('prod-windows-11-pro', 'مفتاح تنشيط ويندوز 11 برو (Windows 11 Pro Retail Key)', 'windows-11-pro-license', 'cat-software', 'برمجيات ومفاتيح ويندوز', 'standard', 7.90, 'مفتاح ترخيص أصلي لتفعيل نظام Windows 11 Pro مدى الحياة لجهاز كمبيوتر واحد.', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 'active', 'code', 'تسليم سريع للكود والتعليمات في واتساب', '["تفعيل أصلي مدى الحياة", "تحديثات مايكروسوفت"]'::jsonb, '["مفتاح Retail يرتبط باللوحة الأم", "يدعم 64 بت و 32 بت", "ترقية مباشرة من هوم إلى برو"]'::jsonb, NULL),
('prod-steam-wallet', 'بطاقات رصيد ستيم (Steam Wallet Gift Cards)', 'steam-wallet-cards', 'cat-game-cards', 'بطاقات المتاجر (ستور)', 'packages', 5.50, 'أكواد شحن محفظة ستيم الأصلية لشراء أحدث ألعاب الكمبيوتر والأدوات الرقمية.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 'active', 'code', 'إرسال الكود عبر واتساب بعد التحويل', '["كود عالمي Global", "تعبئة موثوقة"]'::jsonb, '["كود رسمي يقبل التعبئة على كافة حسابات ستيم"]'::jsonb, NULL),
('prod-netflix-uhd', 'اشتراك نتفلكس بريميوم بدقة 4K Ultra HD', 'netflix-premium-4k', 'cat-entertainment', 'ترفيه وموسيقى', 'packages', 3.99, 'استمتع بأحدث الأفلام والمسلسلات الحصرية على منصة نتفلكس بأعلى جودة عرض 4K.', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80', 'out_of_stock', 'instant', 'التسليم متوقف مؤقتاً', '["نفد مؤقتاً", "جودة 4K UHD"]'::jsonb, '["ملف شخصي خاص محمي برمز PIN", "دعم كامل للترجمة والدبلجة العربية"]'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;

-- الباقات
INSERT INTO packages (id, product_id, name, base_price_usd, quantity_label, sort_order, badge, is_available) VALUES
('pkg-pubg-60', 'prod-pubg-uc', '60 شدة UC', 0.99, '60 UC', 1, NULL, true),
('pkg-pubg-325', 'prod-pubg-uc', '325 شدة (300 + 25 مجاناً)', 4.80, '325 UC', 2, 'شائع ⭐', true),
('pkg-pubg-660', 'prod-pubg-uc', '660 شدة (رويال باس)', 9.50, '660 UC', 3, 'الأكثر طلباً', true),
('pkg-pubg-1800', 'prod-pubg-uc', '1800 شدة UC', 23.50, '1800 UC', 4, NULL, true),
('pkg-pubg-3850', 'prod-pubg-uc', '3850 شدة UC', 47.00, '3850 UC', 5, 'توفير مميز', true),
('pkg-pubg-8100', 'prod-pubg-uc', '8100 شدة UC', 94.00, '8100 UC', 6, 'أعلى باقة', true),
('pkg-psn-10', 'prod-playstation-card', 'بطاقة 10 دولار (US/KSA)', 10.50, '$10', 1, NULL, true),
('pkg-psn-25', 'prod-playstation-card', 'بطاقة 25 دولار (US/KSA)', 25.50, '$25', 2, 'شائع', true),
('pkg-psn-50', 'prod-playstation-card', 'بطاقة 50 دولار (US/KSA)', 50.00, '$50', 3, 'خصم خاص', true),
('pkg-psn-100', 'prod-playstation-card', 'بطاقة 100 دولار (US/KSA)', 98.00, '$100', 4, 'أفضل قيمة', true),
('pkg-canva-1m', 'prod-canva-pro', 'اشتراك شهر واحد', 2.50, '1 شهر', 1, NULL, true),
('pkg-canva-6m', 'prod-canva-pro', 'اشتراك 6 أشهر', 6.99, '6 أشهر', 2, 'توفير', true),
('pkg-canva-1y', 'prod-canva-pro', 'اشتراك سنة كاملة (12 شهر)', 11.99, 'سنة كاملة', 3, 'الأكثر مبيعاً ⭐', true),
('pkg-canva-life', 'prod-canva-pro', 'اشتراك مدى الحياة', 19.99, 'مدى الحياة', 4, 'عرض محدود', true),
('pkg-tg-3m', 'prod-telegram-premium', 'اشتراك 3 أشهر', 11.00, '3 أشهر', 1, NULL, true),
('pkg-tg-6m', 'prod-telegram-premium', 'اشتراك 6 أشهر', 18.50, '6 أشهر', 2, 'توفير', true),
('pkg-tg-1y', 'prod-telegram-premium', 'اشتراك سنة كاملة (12 شهر)', 28.50, '12 شهر', 3, 'الأوفر 🌟', true),
('pkg-steam-5', 'prod-steam-wallet', 'بطاقة 5 دولار', 5.50, '$5', 1, NULL, true),
('pkg-steam-10', 'prod-steam-wallet', 'بطاقة 10 دولار', 10.90, '$10', 2, 'شائع', true),
('pkg-steam-20', 'prod-steam-wallet', 'بطاقة 20 دولار', 21.00, '$20', 3, 'الأكثر طلباً', true),
('pkg-steam-50', 'prod-steam-wallet', 'بطاقة 50 دولار', 51.50, '$50', 4, NULL, true),
('pkg-nf-1m', 'prod-netflix-uhd', 'اشتراك شهر واحد', 3.99, '1 شهر', 1, NULL, false),
('pkg-nf-3m', 'prod-netflix-uhd', 'اشتراك 3 أشهر', 10.50, '3 أشهر', 2, NULL, false)
ON CONFLICT (id) DO NOTHING;

-- سلايدر العروض الرئيسية
INSERT INTO slider_images (id, title, subtitle, image_url, button_text, link_url, sort_order, tag) VALUES
('slide-1', 'شحن شدات ببجي بأرخص الأسعار الرسمية', 'تسليم سريع ومباشر للآيدي ID الخاص بك بعد إتمام الطلب عبر واتساب وبدون الحاجة لكلمة المرور', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85', 'اشحن الآن عبر واتساب', '#products', 1, 'عرض خاص وحصري 🔥'),
('slide-2', 'اشتراكات كانفا برو والذكاء الاصطناعي', 'أطلق العنان لإبداعك مع حسابات رسمية ومضمونة كامل المدة بأسعار رمزية مع تفعيل فوري عبر واتساب', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85', 'تصفح باقات الذكاء الاصطناعي', '#products', 2, 'تفعيل سريع على إيميلك ⭐'),
('slide-3', 'بطاقات الهدايا والمتاجر العالمية', 'بلايستيشن، إكس بوكس، آيتونز، وستيم بأكواد رقمية أصلية موثوقة 100% وتسليم فوري عبر واتساب', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1600&q=85', 'استكشف بطاقات الألعاب', '#products', 3, 'أكواد رسمية وأصلية 🎮')
ON CONFLICT (id) DO NOTHING;

-- سلايدر الإعلانات المستمر أسفل المنتجات (بدون نصوص إجبارية - صور نظيفة فقط)
INSERT INTO ad_banners (id, title, subtitle, image_url, badge, link_url, sort_order) VALUES
('ad-1', '', '', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', '', '#products-section', 1),
('ad-2', '', '', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', '', '#products-section', 2),
('ad-3', '', '', 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80', '', '#products-section', 3),
('ad-4', '', '', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', '', '#products-section', 4),
('ad-5', '', '', 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=600&q=80', '', '#products-section', 5)
ON CONFLICT (id) DO NOTHING;

-- شريط الأخبار
INSERT INTO news_items (id, message, type) VALUES
('news-1', '⚡ عروض خاصة: خصومات حصرية على شدات ببجي وبطاقات بلايستيشن ستور عبر واتساب!', 'promo'),
('news-2', '🚀 يتم تسليم كافة الطلبات وتفعيل الحسابات سريعاً ومباشرة بعد التحويل البنكي أو المحفظة الإلكترونية.', 'info'),
('news-3', '💡 أسعار الصرف للعملات (الدولار، الليرة التركية، الليرة السورية) يتم تحديثها ومزامنتها أولاً بأول.', 'alert')
ON CONFLICT (id) DO NOTHING;

-- الأسئلة الشائعة
INSERT INTO faqs (id, question, answer, category, sort_order) VALUES
('faq-1', 'كيف تتم عملية الشراء والدفع عبر المتجر؟', 'اختر المنتج أو الباقة المطلوبة واضغط على "اطلب عبر واتساب". سيتم نقلك تلقائياً لتطبيق واتساب مع تفاصيل طلبك بدقة، وسيقوم فريق الدعم الفني بالرد الفوري لتأكيد وسيلة الدفع المناسبة لك وإرسال طلبك فوراً بعد التحويل.', 'الشراء والدفع', 1),
('faq-2', 'كم يستغرق استلام الكود أو تفعيل الاشتراك؟', 'يتم التسليم سريعاً ومباشرة فور التحويل! بالنسبة لشدات ببجي والأكواد الرقمية يتم التسليم عادةً خلال 1 إلى 5 دقائق من تأكيد التحويل. ولتفعيل اشتراكات الإيميل خلال أقل من 10 دقائق.', 'التسليم', 2),
('faq-3', 'هل المنتجات والاشتراكات أصلية ومضمونة؟', 'نعم بالتأكيد! جميع أكوادنا واشتراكاتنا معتمدة 100%، ونقدم ضماناً ذهبياً كاملاً طوال مدة الاشتراك مع استبدال فوري في حال أي عائق.', 'الضمان والموثوقية', 3),
('faq-4', 'ما هي العملات المدعومة وكيف يتم احتساب السعر؟', 'يدعم متجرنا التحويل الفوري بين 3 عملات: الدولار الأمريكي (USD)، الليرة التركية (TRY)، والليرة السورية (SYP). اختر العملة في أعلى الصفحة وستتحول كافة الأسعار فوراً.', 'العملات والأسعار', 4)
ON CONFLICT (id) DO NOTHING;

-- إعدادات المتجر الافتراضية
INSERT INTO settings (id, store_name, store_tagline, whatsapp_number, whatsapp_prefix, working_hours, admin_email, admin_password) VALUES
('default_settings', 'ديجيتال زون | DigitalZone', 'المتجر الأول للبطاقات والاشتراكات والمنتجات الرقمية مع الدفع والتسليم عبر واتساب', '905521234567', 'مرحباً ديجيتال زون! أرغب في إتمام طلب المنتج الرقمي التالي:', 'خدمة العملاء متوفرة 24/7 - تسليم سريع ومباشر', 'admin@store.com', 'admin123456')
ON CONFLICT (id) DO NOTHING;

-- أسعار الصرف الافتراضية
INSERT INTO currency_rates (id, base_currency, mode, try_rate, syp_rate) VALUES
('default_rates', 'USD', 'manual', 34.25, 14800.00)
ON CONFLICT (id) DO NOTHING;

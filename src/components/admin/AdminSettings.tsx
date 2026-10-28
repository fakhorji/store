import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveStoreSettings, testSupabaseConnection, seedDemoDataToSupabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  MessageCircle,
  Database,
  RefreshCw,
  Copy,
  Check,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Code2,
} from 'lucide-react';

export default function AdminSettings() {
  const { settings, setSettings, dbStatus, refreshData } = useStore();
  const { showToast } = useToast();

  const [form, setForm] = useState(settings);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings(form);
    setSettings(form);
    showToast('تم حفظ إعدادات المتجر والواتساب بنجاح!', 'success');
  };

  const handleTestConnection = async () => {
    setIsTestingDb(true);
    try {
      const res = await testSupabaseConnection();
      if (res.connected) {
        showToast(res.message, res.tablesExist ? 'success' : 'info');
      } else {
        showToast(res.message, 'error');
      }
      refreshData();
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!confirm('هل ترغب في رفع كافة البيانات النموذجية (المنتجات، الباقات، التصنيفات، الأسعار) إلى جداول Supabase الآن؟')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await seedDemoDataToSupabase();
      if (res.success) {
        showToast(res.message, 'success');
        refreshData();
      } else {
        showToast(res.message, 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'حدث خطأ أثناء الرفع', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const sqlSchemaSnippet = `-- سكريبت إنشاء جداول المتجر الرقمي في Supabase
-- قم بنسخ هذا الكود ولصقه في SQL Editor داخل لوحة تحكم Supabase
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

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  mode TEXT NOT NULL DEFAULT 'standard',
  base_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  delivery_type TEXT DEFAULT 'instant',
  delivery_time TEXT DEFAULT 'تسليم فوري',
  badges JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS slider_images (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'اطلب الآن',
  link_url TEXT DEFAULT '#products',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'عام',
  sort_order INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  store_name TEXT NOT NULL DEFAULT 'ديجيتال زون',
  store_tagline TEXT,
  whatsapp_number TEXT NOT NULL DEFAULT '905521234567',
  whatsapp_prefix TEXT,
  logo_url TEXT,
  telegram_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  working_hours TEXT,
  notice_text TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_rates (
  id TEXT PRIMARY KEY DEFAULT 'default_rates',
  base_currency TEXT DEFAULT 'USD',
  mode TEXT DEFAULT 'manual',
  try_rate NUMERIC(10, 2) DEFAULT 34.25,
  syp_rate NUMERIC(10, 2) DEFAULT 14800.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Packages" ON packages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Slider" ON slider_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All News" ON news_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All FAQs" ON faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Currency" ON currency_rates FOR ALL USING (true) WITH CHECK (true);`;

  const copySchemaToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSchema(true);
    showToast('تم نسخ سكريبت SQL إلى الحافظة بنجاح! 📋', 'success');
    setTimeout(() => setCopiedSchema(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Supabase Status Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">
              حالة الاتصال بـ Supabase (Database & Auth)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTestingDb}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              <span>فحص الاتصال</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dbStatus.tablesExist ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-200">{dbStatus.message}</span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
              dbStatus.tablesExist
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {dbStatus.tablesExist ? 'قاعدة البيانات جاهزة ومربوطة' : 'في انتظار تشغيل SQL'}
          </span>
        </div>

        {/* Database actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={copySchemaToClipboard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 text-xs font-bold transition-colors"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>نسخ سكريبت schema.sql لإنشاء الجداول</span>
          </button>

          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'جاري رفع البيانات...' : 'تعبئة البيانات النموذجية في Supabase بضغطة زر'}</span>
          </button>
        </div>
      </div>

      {/* Store & WhatsApp Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-amber-500" />
          <span>إعدادات الواتساب وهوية المتجر</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رقم الواتساب لاستقبال الطلبات (مع الرمز الدولي بدون +)
            </label>
            <input
              type="text"
              required
              placeholder="مثال: 905521234567"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              سيتم توجيه جميع نقرات الشراء إلى هذا الرقم مباشرة
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              اسم المتجر (Store Name)
            </label>
            <input
              type="text"
              required
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">
            بادئة رسالة الواتساب التلقائية (Admin Message Prefix)
          </label>
          <textarea
            rows={2}
            value={form.whatsapp_prefix}
            onChange={(e) => setForm({ ...form, whatsapp_prefix: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            هذه العبارة ستظهر في بداية كل رسالة طلب يقوم الزبون بإرسالها لك عبر واتساب
          </span>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-bold block mb-1">
            الشعار التسويقي (Tagline)
          </label>
          <input
            type="text"
            value={form.store_tagline || ''}
            onChange={(e) => setForm({ ...form, store_tagline: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رابط قناة تيليجرام (Telegram)
            </label>
            <input
              type="url"
              placeholder="https://t.me/..."
              value={form.telegram_url || ''}
              onChange={(e) => setForm({ ...form, telegram_url: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رابط انستغرام (Instagram)
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={form.instagram_url || ''}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رابط فيسبوك (Facebook)
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={form.facebook_url || ''}
              onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}

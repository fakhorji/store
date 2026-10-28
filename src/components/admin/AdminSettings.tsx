import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { saveStoreSettings } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from './ImageUploadField';
import { PaymentMethod } from '../../types';
import {
  MessageCircle,
  CreditCard,
  Globe2,
  Lock,
  Save,
  Plus,
  Trash2,
  Check,
  Store,
} from 'lucide-react';

export default function AdminSettings() {
  const { settings, setSettings, refreshData } = useStore();
  const { showToast } = useToast();

  const [form, setForm] = useState(settings);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentDesc, setNewPaymentDesc] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveStoreSettings(form);
    setSettings(form);
    showToast('تم حفظ كافة إعدادات المتجر وطرق الدفع بنجاح!', 'success');
    refreshData();
  };

  const handleTogglePaymentMethod = (id: string) => {
    const currentMethods = form.payment_methods || [];
    const updated = currentMethods.map((pm) =>
      pm.id === id ? { ...pm, is_active: !pm.is_active } : pm
    );
    setForm({ ...form, payment_methods: updated });
  };

  const handleDeletePaymentMethod = (id: string) => {
    const currentMethods = form.payment_methods || [];
    setForm({ ...form, payment_methods: currentMethods.filter((pm) => pm.id !== id) });
    showToast('تمت إزالة وسيلة الدفع', 'info');
  };

  const handleAddPaymentMethod = () => {
    if (!newPaymentName.trim()) {
      showToast('يرجى كتابة اسم وسيلة الدفع', 'error');
      return;
    }
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now().toString().slice(-6)}`,
      name: newPaymentName.trim(),
      nameEn: newPaymentName.trim(),
      description: newPaymentDesc.trim() || 'دفع فوري مباشر',
      is_active: true,
      sort_order: (form.payment_methods?.length || 0) + 1,
    };
    setForm({
      ...form,
      payment_methods: [...(form.payment_methods || []), newMethod],
    });
    setNewPaymentName('');
    setNewPaymentDesc('');
    showToast('تمت إضافة وسيلة الدفع الجديدة', 'success');
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6">
      {/* 1. Store Identity & WhatsApp */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="font-bold text-sm text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-amber-500" />
          <span>إعدادات الواتساب وهوية المتجر</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رقم الواتساب لاستقبال الطلبات (مع الرمز الدولي بدون + أو أصفار إضافية)
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

        <div>
          <ImageUploadField
            label="شعار المتجر (Logo) - اختياري"
            value={form.logo_url || ''}
            onChange={(logo) => setForm({ ...form, logo_url: logo })}
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
      </div>

      {/* 2. Supported Payment Methods (إدارة طرق الدفع المدعومة) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>إدارة طرق ووسائل الدفع المدعومة (Payment Methods)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            تفعيل أو تعطيل طرق الدفع المعروضة في الفوتر وللعملاء، أو إضافة طرق دفع مخصصة جديدة
          </p>
        </div>

        {/* Payment Methods List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(form.payment_methods || []).map((method) => (
            <div
              key={method.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                method.is_active
                  ? 'bg-slate-800/90 border-slate-700'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{method.name}</span>
                  {method.is_active && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      مفعل
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{method.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePaymentMethod(method.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    method.is_active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {method.is_active ? 'تعطيل' : 'تفعيل'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors"
                  title="حذف طريقة الدفع"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Custom Payment Method */}
        <div className="pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-300 block mb-2">إضافة وسيلة دفع جديدة:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="اسم وسيلة الدفع (مثلاً: سيريتل كاش، فودافون كاش...)"
              value={newPaymentName}
              onChange={(e) => setNewPaymentName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="وصف مختصر أو تعليمات التحويل"
              value={newPaymentDesc}
              onChange={(e) => setNewPaymentDesc(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs py-2 px-3 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة وسيلة الدفع</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Currency API Configuration (إعدادات مزود أسعار العملات) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            <span>إعدادات API أسعار العملات العالمية (Currency Rates API)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            ربط واجهة API مخصصة لجلب أسعار الصرف الحية للعملات العالمية المعروضة في الصفحة الرئيسية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              رابط نقطة النهاية (Currency API Endpoint URL)
            </label>
            <input
              type="url"
              placeholder="https://open.er-api.com/v6/latest/USD"
              value={form.currency_api_endpoint || 'https://open.er-api.com/v6/latest/USD'}
              onChange={(e) => setForm({ ...form, currency_api_endpoint: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              الافتراضي المجاني: https://open.er-api.com/v6/latest/USD
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              مفتاح الـ API (API Key) - اختياري
            </label>
            <input
              type="text"
              placeholder="اتركه فارغاً إذا كان الـ API مجانياً بدون مفتاح"
              value={form.currency_api_key || ''}
              onChange={(e) => setForm({ ...form, currency_api_key: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Admin Security Credentials (بيانات دخول المدير) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>بيانات تسجيل دخول المدير (Admin Credentials)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            تغيير بريد وكلمة مرور المدير المستخدمة لتسجيل الدخول إلى لوحة التحكم
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              بريد المدير الإلكتروني
            </label>
            <input
              type="email"
              required
              value={form.admin_email || 'admin@store.com'}
              onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              كلمة مرور المدير
            </label>
            <input
              type="text"
              required
              value={form.admin_password || 'admin123456'}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتطبيق جميع الإعدادات فوراً</span>
        </button>
      </div>
    </form>
  );
}

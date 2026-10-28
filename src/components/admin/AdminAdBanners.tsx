import { useState } from 'react';
import { AdBanner } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveAdBanner, deleteAdBanner } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from './ImageUploadField';
import { Plus, Edit2, Trash2, Flame, X, ArrowLeft } from 'lucide-react';

export default function AdminAdBanners() {
  const { adBanners, setAdBanners } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdBanner | null>(null);
  const [form, setForm] = useState<Partial<AdBanner>>({
    title: '',
    subtitle: '',
    image_url: '',
    badge: 'عرض خاص 🔥',
    link_url: '#products-section',
    sort_order: 1,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      id: `ad-${Date.now().toString().slice(-6)}`,
      title: '',
      subtitle: '',
      image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
      badge: 'عرض حصري 🔥',
      link_url: '#products-section',
      sort_order: adBanners.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: AdBanner) => {
    setEditing(ad);
    setForm(ad);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      await deleteAdBanner(id);
      setAdBanners((prev) => prev.filter((a) => a.id !== id));
      showToast('تم حذف الإعلان بنجاح', 'info');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      showToast('يرجى ملء عنوان الإعلان والصورة', 'error');
      return;
    }

    const itemToSave: AdBanner = {
      id: form.id || `ad-${Date.now().toString().slice(-6)}`,
      title: form.title,
      subtitle: form.subtitle || '',
      image_url: form.image_url,
      badge: form.badge || '',
      link_url: form.link_url || '#products-section',
      sort_order: form.sort_order || 1,
      is_active: form.is_active !== undefined ? form.is_active : true,
    };

    await saveAdBanner(itemToSave);

    setAdBanners((prev) => {
      const idx = prev.findIndex((a) => a.id === itemToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = itemToSave;
        return copy;
      }
      return [...prev, itemToSave];
    });

    setIsModalOpen(false);
    showToast('تم حفظ الإعلان الترويجي بنجاح!', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>إدارة سلايدر الإعلانات المستمر (أسفل المنتجات)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            البانرات الإعلانية المتحركة بسلاسة نحو اليمين في الصفحة الرئيسية
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إعلان جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adBanners.map((ad) => (
          <div
            key={ad.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] bg-slate-950">
              <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {ad.badge && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                  {ad.badge}
                </span>
              )}
            </div>

            <div className="p-4 space-y-2">
              <h5 className="font-bold text-sm text-white">{ad.title}</h5>
              {ad.subtitle && <p className="text-xs text-slate-400 line-clamp-1">{ad.subtitle}</p>}

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ad.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {ad.is_active ? 'نشط في السلايدر' : 'معطل'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(ad)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editing ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">عنوان الإعلان</label>
                <input
                  type="text"
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الوصف المختصر</label>
                <input
                  type="text"
                  value={form.subtitle || ''}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Dual image upload (file or URL) */}
              <ImageUploadField
                label="صورة الإعلان (اختر من الجهاز أو ضع رابطاً)"
                required
                value={form.image_url || ''}
                onChange={(img) => setForm({ ...form, image_url: img })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">الشارة الترويجية</label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">الحالة</label>
                  <select
                    value={form.is_active ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="true">نشط</option>
                    <option value="false">معطل</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  حفظ الإعلان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

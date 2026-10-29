import { useState } from 'react';
import { AdBanner } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveAdBanner, deleteAdBanner } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from './ImageUploadField';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Plus, Edit2, Trash2, Flame, X, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImageBase64 } from '../../utils/imageCompressor';

export default function AdminAdBanners() {
  const { adBanners, setAdBanners } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<AdBanner | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    adId: string;
    adTitle: string;
  }>({
    isOpen: false,
    adId: '',
    adTitle: '',
  });

  const [form, setForm] = useState<Partial<AdBanner>>({
    title: '',
    subtitle: '',
    image_url: '',
    badge: '',
    link_url: '',
    sort_order: 1,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      id: `ad-${Date.now().toString().slice(-6)}`,
      title: '',
      subtitle: '',
      image_url: '',
      badge: '',
      link_url: '',
      sort_order: adBanners.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: AdBanner) => {
    setEditing(ad);
    setForm({
      ...ad,
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      badge: ad.badge || '',
      link_url: ad.link_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title?: string) => {
    setDeleteModal({
      isOpen: true,
      adId: id,
      adTitle: title || 'هذا الإعلان',
    });
  };

  const confirmDeleteAd = () => {
    const id = deleteModal.adId;
    setAdBanners((prev) => prev.filter((a) => a.id !== id));
    setDeleteModal({ isOpen: false, adId: '', adTitle: '' });
    showToast('تم حذف الإعلان بنجاح', 'info');
    deleteAdBanner(id).catch((err) => console.error('Delete ad banner error', err));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url || form.image_url.trim().length === 0) {
      showToast('يرجى اختيار أو رفع صورة للإعلان', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Ensure image is compressed and optimized
      let finalImageUrl = form.image_url.trim();
      if (finalImageUrl.startsWith('data:image/') && finalImageUrl.length > 50000) {
        finalImageUrl = await compressImageBase64(finalImageUrl, 1200, 800, 0.82);
      }

      const itemToSave: AdBanner = {
        id: form.id || `ad-${Date.now().toString().slice(-6)}`,
        title: form.title?.trim() || '',
        subtitle: form.subtitle?.trim() || '',
        image_url: finalImageUrl,
        badge: form.badge?.trim() || '',
        link_url: form.link_url?.trim() || '',
        sort_order: form.sort_order || 1,
        is_active: form.is_active !== undefined ? form.is_active : true,
      };

      // Save directly to Supabase and cache
      await saveAdBanner(itemToSave);

      // Instant state update in UI
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
      showToast('تم حفظ الإعلان الترويجي بنجاح! ⚡', 'success');
    } catch (err: any) {
      console.error('Save ad banner error', err);
      showToast('حدث خطأ أثناء حفظ الإعلان، يرجى المحاولة ثانية', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>إدارة سلايدر الإعلانات المستمر (أسفل المنتجات)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            تحكم كامل بالصور والإعلانات المتحركة - جميع النصوص اختيارية
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors shrink-0"
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
            <div className="relative aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden">
              {ad.image_url && ad.image_url.trim() ? (
                <img src={ad.image_url.trim()} alt={ad.title || 'إعلان'} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1 p-2">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <span className="text-[11px] text-slate-500">بدون صورة</span>
                </div>
              )}
              {ad.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              )}
              {ad.badge && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                  {ad.badge}
                </span>
              )}
            </div>

            <div className="p-4 space-y-2">
              <h5 className="font-bold text-sm text-white">
                {ad.title || <span className="text-slate-400 font-normal italic">صورة إعلانية بدون نص</span>}
              </h5>
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
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id, ad.title)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                    title="حذف الإعلان"
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
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editing ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              💡 ملاحظة: جميع الحقول النصية اختيارية بالكامل. إذا تركتها فارغة فسيظهر الإعلان في السلايدر كصورة نقية بدون أي نصوص أو كتابة.
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Dual image upload (file or URL) */}
              <ImageUploadField
                label="صورة الإعلان (اختر من جهازك أو ضع رابطاً)"
                value={form.image_url || ''}
                onChange={(img) => setForm({ ...form, image_url: img })}
              />

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  عنوان الإعلان <span className="text-slate-500 text-[10px] font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="اتركه فارغاً إذا كنت تريد الصورة فقط"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  الوصف المختصر <span className="text-slate-500 text-[10px] font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={form.subtitle || ''}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="اتركه فارغاً لعرض الصورة بمفردها"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    الشارة الترويجية <span className="text-slate-500 text-[10px] font-normal">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="مثال: خصم 20%"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">الحالة</label>
                  <select
                    value={form.is_active ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="true">نشط في السلايدر</option>
                    <option value="false">معطل مؤقتاً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  رابط التوجيه عند النقر <span className="text-slate-500 text-[10px] font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={form.link_url || ''}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="مثال: https://... أو #products-section"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ الإعلان</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Ad Banner Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف الإعلان"
        itemName={deleteModal.adTitle}
        itemType="الإعلان"
        onConfirm={confirmDeleteAd}
        onClose={() => setDeleteModal({ isOpen: false, adId: '', adTitle: '' })}
      />
    </div>
  );
}

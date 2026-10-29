import { useState } from 'react';
import { SliderImage } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveSlider, deleteSlider } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from './ImageUploadField';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Plus, Edit2, Trash2, Image, X, ExternalLink } from 'lucide-react';

export default function AdminSliders() {
  const { sliders, setSliders } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SliderImage | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    sliderId: string;
    sliderTitle: string;
  }>({
    isOpen: false,
    sliderId: '',
    sliderTitle: '',
  });

  const [form, setForm] = useState<Partial<SliderImage>>({
    title: '',
    subtitle: '',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85',
    button_text: 'اطلب الآن عبر واتساب',
    link_url: '#products',
    sort_order: 1,
    is_active: true,
    tag: 'عرض مميز 🔥',
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      id: `slide-${Date.now().toString().slice(-6)}`,
      title: '',
      subtitle: '',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85',
      button_text: 'اطلب الآن',
      link_url: '#products',
      sort_order: sliders.length + 1,
      is_active: true,
      tag: 'عرض جديد 🔥',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: SliderImage) => {
    setEditing(slide);
    setForm(slide);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      sliderId: id,
      sliderTitle: title,
    });
  };

  const confirmDeleteSlider = () => {
    const id = deleteModal.sliderId;
    setSliders((prev) => prev.filter((s) => s.id !== id));
    setDeleteModal({ isOpen: false, sliderId: '', sliderTitle: '' });
    showToast('تم حذف شريحة السلايدر', 'info');
    deleteSlider(id).catch((err) => console.error('Delete slider error', err));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) {
      showToast('يرجى ملء العنوان ورابط الصورة', 'error');
      return;
    }

    const itemToSave: SliderImage = {
      id: form.id || `slide-${Date.now().toString().slice(-6)}`,
      title: form.title,
      subtitle: form.subtitle || '',
      image_url: form.image_url,
      button_text: form.button_text || 'اطلب الآن',
      link_url: form.link_url || '#products',
      sort_order: form.sort_order || 1,
      is_active: form.is_active !== undefined ? form.is_active : true,
      tag: form.tag || '',
    };

    // Instant optimistic update
    setSliders((prev) => {
      const idx = prev.findIndex((s) => s.id === itemToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = itemToSave;
        return copy;
      }
      return [...prev, itemToSave];
    });

    setIsModalOpen(false);
    showToast('تم حفظ شريحة العرض فوراً! ⚡', 'success');

    saveSlider(itemToSave).catch((err) => console.error('Save slider error', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-amber-500" />
            <span>إدارة سلايدر العروض الرئيسية (Hero Slider)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            التحكم في البانرات والصور الترويجية التي تظهر في واجهة المتجر
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة بانر جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sliders.map((slide) => (
          <div
            key={slide.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-md flex flex-col justify-between"
          >
            <div className="relative aspect-[16/8] bg-slate-950">
              {slide.image_url && slide.image_url.trim() ? (
                <img
                  src={slide.image_url.trim()}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Image className="w-10 h-10 opacity-30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              {slide.tag && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {slide.tag}
                </span>
              )}
            </div>

            <div className="p-4 space-y-2">
              <h5 className="font-bold text-sm text-white">{slide.title}</h5>
              <p className="text-xs text-slate-400 line-clamp-2">{slide.subtitle}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    slide.is_active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {slide.is_active ? 'نشط في الواجهة' : 'معطل'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(slide)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id, slide.title)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                    title="حذف الشريحة"
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
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
              <h3 className="font-bold text-sm text-white">
                {editing ? 'تعديل الشريحة' : 'إضافة شريحة عرض'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">العنوان الرئيسي</label>
                <input
                  type="text"
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الوصف الفرعي</label>
                <textarea
                  rows={2}
                  value={form.subtitle || ''}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Slider Image Upload */}
              <ImageUploadField
                label="صورة شريحة العرض (رفع من الجهاز أو رابط)"
                required
                value={form.image_url || ''}
                onChange={(img) => setForm({ ...form, image_url: img })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">الشارة الترويجية (Tag)</label>
                  <input
                    type="text"
                    value={form.tag || ''}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">نص زر الدعوة</label>
                  <input
                    type="text"
                    value={form.button_text || ''}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
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
                  حفظ الشريحة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Slider Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف شريحة العرض"
        itemName={deleteModal.sliderTitle}
        itemType="شريحة العرض"
        onConfirm={confirmDeleteSlider}
        onClose={() => setDeleteModal({ isOpen: false, sliderId: '', sliderTitle: '' })}
      />
    </div>
  );
}

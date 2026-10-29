import { useState } from 'react';
import { NewsItem } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveNews, deleteNews } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Plus, Edit2, Trash2, Megaphone, X, Flame, Bell, AlertTriangle } from 'lucide-react';

export default function AdminNews() {
  const { news, setNews } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    newsId: string;
    newsMessage: string;
  }>({
    isOpen: false,
    newsId: '',
    newsMessage: '',
  });

  const [form, setForm] = useState<Partial<NewsItem>>({
    message: '',
    type: 'promo',
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      id: `news-${Date.now().toString().slice(-6)}`,
      message: '',
      type: 'promo',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsItem) => {
    setEditing(item);
    setForm(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, message: string) => {
    setDeleteModal({
      isOpen: true,
      newsId: id,
      newsMessage: message,
    });
  };

  const confirmDeleteNews = () => {
    const id = deleteModal.newsId;
    setNews((prev) => prev.filter((n) => n.id !== id));
    setDeleteModal({ isOpen: false, newsId: '', newsMessage: '' });
    showToast('تم حذف التنبيه بنجاح', 'info');
    deleteNews(id).catch((err) => console.error('Delete news error', err));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message) {
      showToast('يرجى كتابة نص التنبيه', 'error');
      return;
    }

    const itemToSave: NewsItem = {
      id: form.id || `news-${Date.now().toString().slice(-6)}`,
      message: form.message,
      type: form.type || 'info',
      is_active: form.is_active !== undefined ? form.is_active : true,
      created_at: form.created_at || new Date().toISOString(),
    };

    // Instant optimistic update
    setNews((prev) => {
      const idx = prev.findIndex((n) => n.id === itemToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = itemToSave;
        return copy;
      }
      return [itemToSave, ...prev];
    });

    setIsModalOpen(false);
    showToast('تم حفظ التنبيه فوراً! ⚡', 'success');

    saveNews(itemToSave).catch((err) => console.error('Save news error', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-500" />
            <span>إدارة شريط الأخبار والتنبيهات (News Ticker)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            الرسائل المتحركة في أعلى المتجر للإعلانات والعروض الهامة
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تنبيه جديد</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {news.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs gap-3"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              {item.type === 'promo' && (
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
              )}
              {item.type === 'alert' && (
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {item.type === 'info' && (
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-white break-words">{item.message}</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {item.is_active ? 'نشط في شريط الأخبار' : 'متوقف'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id, item.message)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                title="حذف التنبيه"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editing ? 'تعديل التنبيه' : 'إضافة تنبيه جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">نص التنبيه</label>
                <textarea
                  rows={3}
                  required
                  placeholder="اكتب التنبيه أو العرض الترويجي..."
                  value={form.message || ''}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">نوع التنبيه</label>
                  <select
                    value={form.type || 'promo'}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="promo">عرض ترويجي (Promo 🔥)</option>
                    <option value="alert">تنبيه هام (Alert ⚠️)</option>
                    <option value="info">إشعار معلوماتي (Info ℹ️)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">الحالة</label>
                  <select
                    value={form.is_active ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
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
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete News Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف التنبيه"
        itemName={deleteModal.newsMessage}
        itemType="التنبيه"
        onConfirm={confirmDeleteNews}
        onClose={() => setDeleteModal({ isOpen: false, newsId: '', newsMessage: '' })}
      />
    </div>
  );
}

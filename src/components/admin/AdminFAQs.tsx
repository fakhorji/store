import { useState } from 'react';
import { FAQItem } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveFAQ, deleteFAQ } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Plus, Edit2, Trash2, HelpCircle, X } from 'lucide-react';

export default function AdminFAQs() {
  const { faqs, setFaqs } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQItem | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    faqId: string;
    faqQuestion: string;
  }>({
    isOpen: false,
    faqId: '',
    faqQuestion: '',
  });

  const [form, setForm] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    category: 'عام',
    sort_order: 1,
    is_active: true,
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({
      id: `faq-${Date.now().toString().slice(-6)}`,
      question: '',
      answer: '',
      category: 'عام',
      sort_order: faqs.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FAQItem) => {
    setEditing(item);
    setForm(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, question: string) => {
    setDeleteModal({
      isOpen: true,
      faqId: id,
      faqQuestion: question,
    });
  };

  const confirmDeleteFAQ = () => {
    const id = deleteModal.faqId;
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setDeleteModal({ isOpen: false, faqId: '', faqQuestion: '' });
    showToast('تم حذف السؤال بنجاح', 'info');
    deleteFAQ(id).catch((err) => console.error('Delete FAQ error', err));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      showToast('يرجى ملء السؤال والإجابة', 'error');
      return;
    }

    const itemToSave: FAQItem = {
      id: form.id || `faq-${Date.now().toString().slice(-6)}`,
      question: form.question,
      answer: form.answer,
      category: form.category || 'عام',
      sort_order: form.sort_order || 1,
      is_active: form.is_active !== undefined ? form.is_active : true,
    };

    // Instant optimistic update
    setFaqs((prev) => {
      const idx = prev.findIndex((f) => f.id === itemToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = itemToSave;
        return copy;
      }
      return [...prev, itemToSave];
    });

    setIsModalOpen(false);
    showToast('تم حفظ السؤال فوراً! ⚡', 'success');

    saveFAQ(itemToSave).catch((err) => console.error('Save FAQ error', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>إدارة الأسئلة الشائعة (FAQs)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            توضيحات الشراء، التسليم، وطرق الدفع لمساعدة العملاء
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{faq.question}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(faq)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id, faq.question)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                  title="حذف السؤال"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">السؤال</label>
                <input
                  type="text"
                  required
                  value={form.question || ''}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الإجابة</label>
                <textarea
                  rows={4}
                  required
                  value={form.answer || ''}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
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

      {/* Confirm Delete FAQ Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف السؤال الشائع"
        itemName={deleteModal.faqQuestion}
        itemType="السؤال الشائع"
        onConfirm={confirmDeleteFAQ}
        onClose={() => setDeleteModal({ isOpen: false, faqId: '', faqQuestion: '' })}
      />
    </div>
  );
}

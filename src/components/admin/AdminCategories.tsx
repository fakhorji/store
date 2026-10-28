import { useState } from 'react';
import { Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveCategory, deleteCategory } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { Plus, Edit2, Trash2, Layers, X, CornerDownLeft } from 'lucide-react';

export default function AdminCategories() {
  const { categories, setCategories } = useStore();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: '',
    categoryName: '',
  });

  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    icon: 'Layers',
    description: '',
    parent_id: null,
    sort_order: 1,
    is_active: true,
  });

  const parentCategories = categories.filter((c) => !c.parent_id);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({
      id: `cat-${Date.now().toString().slice(-6)}`,
      name: '',
      slug: `category-${Date.now().toString().slice(-6)}`,
      icon: 'Layers',
      description: '',
      parent_id: null,
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setForm(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const confirmDeleteCategory = () => {
    const id = deleteModal.categoryId;
    const name = deleteModal.categoryName;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' });
    showToast(`تم حذف التصنيف "${name}"`, 'info');
    deleteCategory(id).catch((err) => console.error('Delete category error', err));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      showToast('يرجى كتابة اسم التصنيف والرابط المختصر', 'error');
      return;
    }

    const categoryToSave: Category = {
      id: form.id || `cat-${Date.now().toString().slice(-6)}`,
      name: form.name,
      slug: form.slug,
      icon: form.icon || 'Layers',
      description: form.description || '',
      parent_id: form.parent_id || null,
      sort_order: form.sort_order || 1,
      is_active: form.is_active !== undefined ? form.is_active : true,
    };

    // Instant optimistic update
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === categoryToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = categoryToSave;
        return copy;
      }
      return [...prev, categoryToSave];
    });

    setIsModalOpen(false);
    showToast(`تم حفظ التصنيف "${categoryToSave.name}" فوراً! ⚡`, 'success');

    saveCategory(categoryToSave).catch((err) => console.error('Save category error', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>إدارة التصنيفات والتفرعات (Nested Categories)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            يمكنك إنشاء تصنيف رئيسي أو فرعي لربط المنتجات الرقمية به
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg overflow-hidden">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
            <tr>
              <th className="p-3.5">اسم التصنيف</th>
              <th className="p-3.5">الرابط اللطيف (Slug)</th>
              <th className="p-3.5">التصنيف الأب (Parent)</th>
              <th className="p-3.5">الترتيب</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {categories.map((cat) => {
              const parent = categories.find((c) => c.id === cat.parent_id);
              return (
                <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    {cat.parent_id ? (
                      <CornerDownLeft className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{cat.name}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{cat.slug}</td>
                  <td className="p-3.5">
                    {parent ? (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 font-semibold text-[11px]">
                        {parent.name}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">تصنيف رئيسي</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{cat.sort_order}</td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
              <h3 className="font-bold text-sm text-white">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">اسم التصنيف</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: شدات ببجي، اشتراكات ترفيه..."
                  value={form.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: form.slug || name.toLowerCase().replace(/\s+/g, '-'),
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الرابط اللطيف (Slug)</label>
                <input
                  type="text"
                  required
                  value={form.slug || ''}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  التصنيف الرئيسي (الأب - اختياري للتصنيف الفرعي)
                </label>
                <select
                  value={form.parent_id || ''}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">بدون (تصنيف رئيسي مستقل)</option>
                  {parentCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الترتيب</label>
                <input
                  type="number"
                  min="1"
                  value={form.sort_order || 1}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
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

      {/* Confirm Delete Category Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف التصنيف"
        itemName={deleteModal.categoryName}
        itemType="التصنيف"
        onConfirm={confirmDeleteCategory}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: '', categoryName: '' })}
      />
    </div>
  );
}

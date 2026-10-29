import { useState } from 'react';
import { Product, ProductPackage, ProductMode, ProductStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { saveProduct, deleteProduct } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from './ImageUploadField';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Search,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Ban,
  DollarSign,
} from 'lucide-react';

export default function AdminProducts() {
  const { products, setProducts, categories } = useStore();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Royal Confirm Delete Modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: '',
    productName: '',
  });

  // Form state
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    slug: '',
    category_id: categories[0]?.id || '',
    mode: 'standard',
    base_price_usd: 5.0,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    delivery_type: 'instant',
    delivery_time: 'تسليم فوري خلال دقائق',
    badges: ['تسليم فوري'],
    features: ['ضمان كامل المدة', 'شحن رسمي معتمد'],
    packages: [],
  });

  const [packageForm, setPackageForm] = useState<Partial<ProductPackage>>({
    name: '',
    base_price_usd: 1.0,
    quantity_label: '',
    badge: '',
    is_available: true,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: '',
      slug: `product-${Date.now().toString().slice(-6)}`,
      category_id: categories[0]?.id || '',
      category_name: categories[0]?.name || '',
      mode: 'standard',
      base_price_usd: 5.0,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      status: 'active',
      delivery_type: 'instant',
      delivery_time: 'تسليم فوري خلال دقائق',
      badges: ['تسليم فوري'],
      features: ['ضمان كامل', 'رسمي 100%'],
      packages: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product, packages: product.packages ? [...product.packages] : [] });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  const confirmDeleteProduct = () => {
    const id = deleteModal.productId;
    const name = deleteModal.productName;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteModal({ isOpen: false, productId: '', productName: '' });
    showToast(`تم حذف المنتج "${name}" بنجاح`, 'info');
    deleteProduct(id).catch((err) => console.error('Delete product error', err));
  };

  const handleAddPackage = () => {
    if (!packageForm.name || !packageForm.base_price_usd) {
      showToast('يرجى كتابة اسم الباقة وسعرها بالدولار', 'error');
      return;
    }
    const newPkg: ProductPackage = {
      id: `pkg-${Date.now().toString().slice(-6)}`,
      name: packageForm.name,
      base_price_usd: Number(packageForm.base_price_usd),
      quantity_label: packageForm.quantity_label || packageForm.name,
      badge: packageForm.badge || '',
      sort_order: (form.packages?.length || 0) + 1,
      is_available: true,
    };
    setForm((prev) => ({
      ...prev,
      packages: [...(prev.packages || []), newPkg],
    }));
    setPackageForm({ name: '', base_price_usd: 1.0, quantity_label: '', badge: '', is_available: true });
    showToast('تمت إضافة الباقة', 'success');
  };

  const handleRemovePackage = (pkgId: string) => {
    setForm((prev) => ({
      ...prev,
      packages: prev.packages?.filter((p) => p.id !== pkgId),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category_id) {
      showToast('يرجى إدخال اسم المنتج وتصنيفه', 'error');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === form.category_id);
    const productToSave: Product = {
      id: form.id || `prod-${Date.now().toString().slice(-6)}`,
      name: form.name,
      slug: form.slug || `prod-${Date.now().toString().slice(-6)}`,
      category_id: form.category_id,
      category_name: selectedCategory?.name || '',
      mode: (form.mode as ProductMode) || 'standard',
      base_price_usd: Number(form.base_price_usd) || 0,
      description: form.description || '',
      image_url: form.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      status: (form.status as ProductStatus) || 'active',
      delivery_type: form.delivery_type || 'instant',
      delivery_time: form.delivery_time || 'تسليم فوري',
      badges: form.badges || [],
      features: form.features || [],
      packages: form.mode === 'packages' ? form.packages || [] : [],
      created_at: form.created_at || new Date().toISOString(),
    };

    // 1. Instant optimistic UI update (0ms delay)
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = productToSave;
        return copy;
      }
      return [productToSave, ...prev];
    });

    setIsModalOpen(false);
    showToast(`تم حفظ المنتج "${productToSave.name}" فوراً! ⚡`, 'success');

    // 2. Fast background database upsert
    saveProduct(productToSave).catch((err) => console.error('Save product error', err));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث في المنتجات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-white text-xs rounded-xl pr-10 pl-4 py-2.5 border border-slate-700 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Products Table (Desktop & Tablet) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg">
        <table className="w-full text-right text-xs min-w-[700px]">
          <thead className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
            <tr>
              <th className="p-3.5">المنتج</th>
              <th className="p-3.5">التصنيف</th>
              <th className="p-3.5">النمط</th>
              <th className="p-3.5">السعر الأساسي (USD)</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    {prod.image_url && prod.image_url.trim() ? (
                      <img
                        src={prod.image_url.trim()}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <Layers className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-white block">{prod.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{prod.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 text-slate-300 font-medium">
                  {prod.category_name || 'عام'}
                </td>
                <td className="p-3.5">
                  {prod.mode === 'packages' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                      <Layers className="w-3 h-3" />
                      باقات ({prod.packages?.length || 0})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                      <Sparkles className="w-3 h-3" />
                      قياسي
                    </span>
                  )}
                </td>
                <td className="p-3.5 font-mono font-bold text-amber-400">
                  ${prod.base_price_usd.toFixed(2)}
                </td>
                <td className="p-3.5">
                  {prod.status === 'active' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      نشط
                    </span>
                  )}
                  {prod.status === 'out_of_stock' && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                      <Ban className="w-3 h-3" />
                      نفد المخزون
                    </span>
                  )}
                  {prod.status === 'hidden' && (
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-bold text-[10px] flex items-center gap-1 w-fit">
                      <EyeOff className="w-3 h-3" />
                      مخفي
                    </span>
                  )}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Products Mobile Cards (Zero overlap, perfect phone layout) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
          >
            <div className="flex items-start gap-3">
              {prod.image_url && prod.image_url.trim() ? (
                <img
                  src={prod.image_url.trim()}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <Layers className="w-6 h-6 opacity-40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white text-xs block leading-snug break-words">
                  {prod.name}
                </span>
                <span className="text-[11px] text-amber-400 font-medium block mt-0.5">
                  {prod.category_name || 'عام'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {prod.mode === 'packages' ? (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                    باقات ({prod.packages?.length || 0})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                    قياسي
                  </span>
                )}

                {prod.status === 'active' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    نشط
                  </span>
                )}
                {prod.status === 'out_of_stock' && (
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[10px]">
                    نفد
                  </span>
                )}
                {prod.status === 'hidden' && (
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-bold text-[10px]">
                    مخفي
                  </span>
                )}
              </div>

              <div className="font-mono font-black text-amber-400 text-sm">
                ${prod.base_price_usd.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenEdit(prod)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                onClick={() => handleDelete(prod.id, prod.name)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 font-bold text-xs border border-rose-900/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 bg-slate-800/80 border-b border-slate-700">
              <h3 className="font-bold text-sm text-white">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">اسم المنتج</label>
                  <input
                    type="text"
                    required
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">التصنيف</label>
                  <select
                    value={form.category_id || ''}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parent_id ? `↳ ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">نمط المنتج</label>
                  <select
                    value={form.mode || 'standard'}
                    onChange={(e) => setForm({ ...form, mode: e.target.value as ProductMode })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="standard">قياسي (سعر ثابت)</option>
                    <option value="packages">باقات متعددة (Packages)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">
                    السعر الأساسي بالدولار ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.base_price_usd || 0}
                    onChange={(e) => setForm({ ...form, base_price_usd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-bold block mb-1">حالة التوفر</label>
                  <select
                    value={form.status || 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="active">نشط (متوفر للشراء)</option>
                    <option value="out_of_stock">نفد من المخزون (غير متاح)</option>
                    <option value="hidden">مخفي من المتجر</option>
                  </select>
                </div>
              </div>

              {/* Product Image (Device Upload or URL) */}
              <ImageUploadField
                label="صورة المنتج (رفع من الجهاز أو رابط)"
                value={form.image_url || ''}
                onChange={(img) => setForm({ ...form, image_url: img })}
              />

              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Packages Manager Section (Only shown if mode === 'packages') */}
              {form.mode === 'packages' && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      إدارة باقات هذا المنتج ({form.packages?.length || 0})
                    </span>
                  </div>

                  {/* Existing Packages List */}
                  {form.packages && form.packages.length > 0 && (
                    <div className="space-y-1.5">
                      {form.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{pkg.name}</span>
                            <span className="text-slate-400 font-mono">({pkg.quantity_label})</span>
                            {pkg.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-emerald-400">
                              ${pkg.base_price_usd.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemovePackage(pkg.id)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Package Form */}
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-[11px] text-slate-400 block mb-1">إضافة باقة فرعية جديدة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="اسم الباقة (مثلاً 660 شدة)"
                        value={packageForm.name || ''}
                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="السعر بالدولار $"
                        value={packageForm.base_price_usd || ''}
                        onChange={(e) => setPackageForm({ ...packageForm, base_price_usd: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                      />
                      <input
                        type="text"
                        placeholder="الكمية / التسمية"
                        value={packageForm.quantity_label || ''}
                        onChange={(e) => setPackageForm({ ...packageForm, quantity_label: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddPackage}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs py-2 px-3 flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>أضف الباقة</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="تأكيد حذف المنتج"
        itemName={deleteModal.productName}
        itemType="المنتج"
        onConfirm={confirmDeleteProduct}
        onClose={() => setDeleteModal({ isOpen: false, productId: '', productName: '' })}
      />
    </div>
  );
}

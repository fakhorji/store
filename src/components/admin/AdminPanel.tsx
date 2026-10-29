import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminCurrency from './AdminCurrency';
import AdminSliders from './AdminSliders';
import AdminAdBanners from './AdminAdBanners';
import AdminNews from './AdminNews';
import AdminFAQs from './AdminFAQs';
import AdminSettings from './AdminSettings';
import {
  Shield,
  X,
  Package,
  Layers,
  DollarSign,
  Image,
  Flame,
  Megaphone,
  HelpCircle,
  Settings,
  Store,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

type AdminTab =
  | 'products'
  | 'categories'
  | 'currency'
  | 'sliders'
  | 'adbanners'
  | 'news'
  | 'faqs'
  | 'settings';

export default function AdminPanel() {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    categories,
    sliders,
    adBanners,
    settings,
    logoutAdmin,
    refreshData,
  } = useStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isAdminOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refreshData();
      showToast('تم تحديث البيانات ومزامنتها بنجاح ⚡', 'success');
    } catch {
      showToast('حدث خطأ أثناء المزامنة', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const tabs = [
    { id: 'products', name: 'المنتجات والباقات', icon: Package, count: products.length },
    { id: 'categories', name: 'التصنيفات', icon: Layers, count: categories.length },
    { id: 'currency', name: 'أسعار العملات', icon: DollarSign },
    { id: 'sliders', name: 'سلايدر العروض', icon: Image, count: sliders.length },
    { id: 'adbanners', name: 'سلايدر الإعلانات', icon: Flame, count: adBanners.length },
    { id: 'news', name: 'شريط الأخبار', icon: Megaphone },
    { id: 'faqs', name: 'الأسئلة الشائعة', icon: HelpCircle },
    { id: 'settings', name: 'الإعدادات والدفع', icon: Settings },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex flex-col" dir="rtl">
        {/* Admin Navigation Bar - Optimized for Mobile & Desktop */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shrink-0 gap-2">
          {/* Brand & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0 overflow-hidden p-0.5">
              {settings?.logo_url && settings.logo_url.trim() ? (
                <img
                  src={settings.logo_url.trim()}
                  alt="شعار لوحة التحكم"
                  className="w-full h-full object-contain rounded-lg bg-slate-950/40 p-0.5"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-extrabold text-white flex items-center gap-1.5 truncate">
                <span>لوحة تحكم المتجر</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  Admin
                </span>
              </h2>
              <span className="hidden md:block text-[11px] text-slate-400 truncate">
                إدارة المنتجات، الباقات، الإعلانات، وطرق الدفع
              </span>
            </div>
          </div>

          {/* Quick Actions (Never wrap or collide on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700/80"
              title="تحديث البيانات من السيرفر"
              aria-label="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">مزامنة</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700/80"
              title="معاينة واجهة المتجر"
              aria-label="معاينة المتجر"
            >
              <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">المتجر</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 text-xs font-bold transition-colors border border-rose-800/40"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">خروج</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 sm:p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="إغلاق اللوحة"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Admin Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar / Tabs (Swipeable horizontal tabs on mobile, vertical sidebar on desktop) */}
          <div className="w-full md:w-64 bg-slate-900/95 border-b md:border-b-0 md:border-l border-slate-800 p-2 sm:p-3 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar">
            <div className="flex md:flex-col gap-1.5 flex-nowrap md:flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 sm:p-3 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap min-h-[40px] ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/60 md:bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.name}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-white">
            <div className="max-w-5xl mx-auto">
              {activeTab === 'products' && <AdminProducts />}
              {activeTab === 'categories' && <AdminCategories />}
              {activeTab === 'currency' && <AdminCurrency />}
              {activeTab === 'sliders' && <AdminSliders />}
              {activeTab === 'adbanners' && <AdminAdBanners />}
              {activeTab === 'news' && <AdminNews />}
              {activeTab === 'faqs' && <AdminFAQs />}
              {activeTab === 'settings' && <AdminSettings />}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}

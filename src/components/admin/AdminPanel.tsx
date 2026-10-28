import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminCurrency from './AdminCurrency';
import AdminSliders from './AdminSliders';
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
  Megaphone,
  HelpCircle,
  Settings,
  Store,
  Sparkles,
} from 'lucide-react';

type AdminTab =
  | 'products'
  | 'categories'
  | 'currency'
  | 'sliders'
  | 'news'
  | 'faqs'
  | 'settings';

export default function AdminPanel() {
  const { isAdminOpen, setIsAdminOpen, products, categories, sliders } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  if (!isAdminOpen) return null;

  const tabs = [
    { id: 'products', name: 'المنتجات والباقات', icon: Package, count: products.length },
    { id: 'categories', name: 'التصنيفات', icon: Layers, count: categories.length },
    { id: 'currency', name: 'أسعار العملات', icon: DollarSign },
    { id: 'sliders', name: 'سلايدر العروض', icon: Image, count: sliders.length },
    { id: 'news', name: 'شريط الأخبار', icon: Megaphone },
    { id: 'faqs', name: 'الأسئلة الشائعة', icon: HelpCircle },
    { id: 'settings', name: 'إعدادات المتجر و Supabase', icon: Settings },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex flex-col" dir="rtl">
        {/* Admin Navigation Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>لوحة الإدارة والتحكم</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Admin Panel
                </span>
              </h2>
              <span className="text-[11px] text-slate-400">
                إدارة الكتالوج، أسعار الصرف، الباقات، والإعدادات
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>العودة للمتجر</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar / Tabs */}
          <div className="w-full md:w-64 bg-slate-900/95 border-b md:border-b-0 md:border-l border-slate-800 p-3 shrink-0 overflow-x-auto md:overflow-y-auto">
            <div className="flex md:flex-col gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.name}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
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

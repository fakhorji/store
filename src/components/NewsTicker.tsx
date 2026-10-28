import { useStore } from '../context/StoreContext';
import { Megaphone, Flame, Bell, AlertTriangle } from 'lucide-react';

export default function NewsTicker() {
  const { news } = useStore();
  const activeNews = news.filter((n) => n.is_active);

  if (activeNews.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 text-xs sm:text-sm font-semibold py-2 px-4 shadow-sm overflow-hidden select-none" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/20 backdrop-blur-sm px-2.5 py-1 rounded-md text-slate-950 font-bold">
          <Megaphone className="w-4 h-4 animate-bounce" />
          <span>آخر التنبيهات</span>
        </div>

        <div className="relative overflow-hidden w-full whitespace-nowrap">
          <div className="animate-marquee-rtl flex items-center gap-8">
            {activeNews.concat(activeNews).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
                {item.type === 'promo' && <Flame className="w-4 h-4 text-red-700 shrink-0" />}
                {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-orange-950 shrink-0" />}
                {item.type === 'info' && <Bell className="w-4 h-4 text-blue-900 shrink-0" />}
                <span>{item.message}</span>
                <span className="text-slate-950/40 text-base">✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

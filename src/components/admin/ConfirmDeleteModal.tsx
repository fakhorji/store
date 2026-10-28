import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemType?: string;
  message?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title = 'تأكيد الحذف النهائي',
  itemName,
  itemType = 'هذا العنصر',
  message,
  isDeleting = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl shadow-rose-950/50 p-6 text-center overflow-hidden"
        >
          {/* Ambient Danger Glow */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-rose-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Close X Button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glowing Danger Icon */}
          <div className="relative mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
            <Trash2 className="w-8 h-8 animate-pulse text-rose-500" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-slate-950 flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-slate-950" />
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-base sm:text-lg font-black text-white mb-2">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {message || (
              <>
                هل أنت متأكد تماماً من رغبتك في حذف {itemType}
                {itemName && (
                  <span className="block mt-1 font-bold text-amber-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                    "{itemName}"
                  </span>
                )}
                ؟ هذه العملية لا رجعة فيها وسيتم حذف البيانات نهائياً.
              </>
            )}
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              إلغاء التراجع
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'جاري الحذف...' : 'نعم، احذف الآن'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-300 font-bold block">{label}</label>

        {/* Mode Toggle Button */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>من الجهاز</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>رابط URL</span>
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="relative">
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="url"
            required={required}
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 bg-slate-800/60 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-xs text-slate-300 font-bold"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>اضغط هنا لاختيار صورة من جهازك</span>
          </button>
        </div>
      )}

      {/* Image Preview Thumbnail */}
      {Boolean(value && typeof value === 'string' && value.trim()) && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
          <img src={value.trim()} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 left-1 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="إزالة الصورة"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ImageUploadProps {
  userId: string;
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUpload({ userId, images, onChange, max = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    if (images.length >= max) return;
    setUploading(true);
    const urls: string[] = [...images];

    for (const file of Array.from(files)) {
      if (urls.length >= max) break;
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); continue; }

      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('listing-images').upload(path, file, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }

    onChange(urls);
    setUploading(false);
  };

  const remove = (url: string) => onChange(images.filter(u => u !== url));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map(url => (
          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#e5ddd8] group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(url)}
              className="absolute inset-0 bg-black/50 text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >✕</button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-[#d94f1e]/40 bg-[#fff5f0] flex flex-col items-center justify-center text-[#d94f1e] hover:border-[#d94f1e] transition-colors disabled:opacity-50"
          >
            {uploading ? <span className="text-xl animate-spin">⏳</span> : <>
              <span className="text-2xl">📷</span>
              <span className="text-[10px] font-semibold mt-0.5">Add photo</span>
            </>}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => e.target.files && upload(e.target.files)}
      />
      <div className="text-[11px] text-[#aaa]">Up to {max} photos · Max 5MB each</div>
    </div>
  );
}

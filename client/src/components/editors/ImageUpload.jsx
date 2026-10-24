import { useId, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { resizeImage } from '../../lib/image.js';
import { api } from '../../lib/api.js';

/** "Upload a photo" button: shrinks the file in the browser, uploads it, then calls onUploaded(url). */
export function ImageUpload({ onUploaded, label = 'Upload a photo', maxSide = 1000, keepAlpha = false, className = '' }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await resizeImage(file, { maxSide, keepAlpha });
      onUploaded(await api.uploadImage(blob));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <input ref={inputRef} id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/*" className="sr-only" onChange={pick} disabled={busy} />
      <label
        htmlFor={inputId}
        className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-ink bg-sign px-4 text-sm font-extrabold transition hover:bg-[#F0C252] has-[:focus-visible]:outline-none ${busy ? 'pointer-events-none opacity-60' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
      >
        {busy ? <Loader2 className="size-4.5 animate-spin" /> : <ImagePlus className="size-4.5" />}
        {busy ? 'Uploading...' : label}
      </label>
      {error && (
        <p className="mt-2 text-sm font-bold text-brick" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

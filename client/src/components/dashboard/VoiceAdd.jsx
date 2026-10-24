import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Plus } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { api } from '../../lib/api.js';
import { Button } from '../ui/primitives.jsx';

/** Speak or type "add plum cake for 450 and walnut brownie for 90" and new products are merged in. */
export function VoiceAdd({ store, onAdd }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const speech = useSpeechRecognition({ lang: 'en-IN', onFinal: (t) => setText((prev) => `${prev} ${t}`.trim()) });

  const submit = async (e) => {
    e?.preventDefault();
    if (speech.listening) speech.stop();
    if (text.trim().length < 3) return;
    setBusy(true);
    setResult(null);
    try {
      // Give the parser shop context so new items get the right icon and grouping.
      const res = await api.generate(`I run ${store.storeName}, a ${store.category}. ${text.replace(/^\s*(please\s+)?add\s+/i, 'we sell ')}`);
      const existing = new Set(store.products.map((p) => p.name.toLowerCase()));
      const fresh = res.store.products.filter((p) => !existing.has(p.name.toLowerCase()));
      onAdd(fresh);
      setResult(fresh.length ? `Added ${fresh.map((p) => p.name).join(', ')}. Remember to save.` : 'No new products with prices found. Try "add plum cake for 450".');
      if (fresh.length) setText('');
    } catch (err) {
      setResult(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[10px] bg-board p-2">
      <div className="rounded-md border-2 border-sign p-4 sm:p-5">
        <p className="sign-type text-[30px] text-sign">Add products by voice</p>
        <p className="mt-1 text-sm text-[#E9E3D2]">Say something like "add plum cake for 450 rupees and walnut brownie for 90".</p>
        <div className="mt-4 flex gap-2">
          {speech.supported && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={speech.listening ? speech.stop : speech.start}
              className={`relative grid size-12 shrink-0 place-items-center rounded-full border-[3px] border-ink ${speech.listening ? 'bg-brick text-white' : 'bg-sign text-ink'}`}
              aria-label={speech.listening ? 'Stop listening' : 'Speak new products'}
              aria-pressed={speech.listening}
            >
              {speech.listening ? <Square className="size-4 fill-current" /> : <Mic className="size-5" strokeWidth={2.2} />}
            </motion.button>
          )}
          <input
            className="sign-input h-12"
            value={speech.interim ? `${text} ${speech.interim}` : text}
            onChange={(e) => setText(e.target.value)}
            placeholder="add plum cake for 450..."
            aria-label="New products to add"
          />
          <Button type="submit" variant="sign" size="md" loading={busy} disabled={text.trim().length < 3}>
            {!busy && <Plus className="size-4.5" strokeWidth={2.6} />} Add
          </Button>
        </div>
        {(result || speech.error) && (
          <p className="mt-3 text-sm font-bold text-sign" role="status">
            {speech.error ?? result}
          </p>
        )}
      </div>
    </form>
  );
}

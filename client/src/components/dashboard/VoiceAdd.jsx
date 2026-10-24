import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Plus, Sparkles } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { api } from '../../lib/api.js';
import { Button } from '../ui/primitives.jsx';

/** Speak or type "add plum cake for 450 and walnut brownie for 90" → new products merged into the store. */
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
      // Give the parser shop context so new items get the right emoji and grouping.
      const res = await api.generate(`I run ${store.storeName}, a ${store.category}. ${text.replace(/^\s*(please\s+)?add\s+/i, 'we sell ')}`);
      const existing = new Set(store.products.map((p) => p.name.toLowerCase()));
      const fresh = res.store.products.filter((p) => !existing.has(p.name.toLowerCase()));
      onAdd(fresh);
      setResult(fresh.length ? `Added ${fresh.map((p) => p.name).join(', ')}. Don't forget to save.` : 'No new products with prices found — try “add plum cake for 450”.');
      if (fresh.length) setText('');
    } catch (err) {
      setResult(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-[linear-gradient(135deg,color-mix(in_oklab,#7c3aed_8%,var(--surface)),color-mix(in_oklab,#f97316_8%,var(--surface)))] p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Sparkles className="size-4 text-[#db2777]" /> Add products by voice
      </p>
      <p className="mt-0.5 text-sm text-muted">Say something like “add plum cake for 450 rupees and walnut brownie for 90”.</p>
      <div className="mt-3 flex gap-2">
        {speech.supported && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={speech.listening ? speech.stop : speech.start}
            className={`relative grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-soft ${speech.listening ? 'bg-ink' : 'vaani-gradient'}`}
            aria-label={speech.listening ? 'Stop listening' : 'Speak new products'}
            aria-pressed={speech.listening}
          >
            {speech.listening && <motion.span className="absolute inset-0 rounded-xl bg-[#db2777]/40" animate={{ scale: [1, 1.4], opacity: [0.7, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />}
            {speech.listening ? <Square className="size-4 fill-current" /> : <Mic className="size-5" />}
          </motion.button>
        )}
        <input
          className="field h-11"
          value={speech.interim ? `${text} ${speech.interim}` : text}
          onChange={(e) => setText(e.target.value)}
          placeholder="add plum cake for 450…"
          aria-label="New products to add"
        />
        <Button type="submit" size="md" loading={busy} disabled={text.trim().length < 3} className="h-11">
          {!busy && <Plus className="size-4" />} Add
        </Button>
      </div>
      {(result || speech.error) && (
        <p className="mt-2 text-sm font-medium text-ink/75" role="status">
          {speech.error ?? result}
        </p>
      )}
    </form>
  );
}

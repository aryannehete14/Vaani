import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Square, Wand2, MicOff, Languages, Eraser } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { Button } from '../ui/primitives.jsx';
import { SAMPLES, SPEECH_LANGS } from '../../lib/constants.js';

function MicButton({ listening, onClick, disabled }) {
  return (
    <div className="relative grid size-28 place-items-center sm:size-32">
      <AnimatePresence>
        {listening &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full bg-[#db2777]/25"
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: 1.9, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className={`relative grid size-24 place-items-center rounded-full text-white shadow-lift transition-colors disabled:opacity-40 sm:size-28 ${
          listening ? 'bg-ink' : 'vaani-gradient'
        }`}
        aria-label={listening ? 'Stop listening' : 'Start speaking'}
        aria-pressed={listening}
      >
        {listening ? <Square className="size-8 fill-current" /> : <Mic className="size-10" strokeWidth={2.2} />}
      </motion.button>
    </div>
  );
}

function Waveform() {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-[#db2777]"
          animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  );
}

export function VoiceComposer({ transcript, setTranscript, onGenerate, busy }) {
  const [lang, setLang] = useState('en-IN');
  const speech = useSpeechRecognition({
    lang,
    onFinal: (text) => setTranscript((t) => (t ? `${t.trimEnd()} ${text}` : text)),
  });
  const ready = transcript.trim().length >= 10;

  const submit = () => {
    if (speech.listening) speech.stop();
    onGenerate();
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/80 p-5 shadow-lift backdrop-blur-xl sm:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        {speech.supported ? (
          <>
            <MicButton listening={speech.listening} onClick={speech.listening ? speech.stop : speech.start} disabled={busy} />
            <div className="flex h-6 items-center gap-2 text-sm font-semibold" aria-live="polite">
              {speech.listening ? (
                <>
                  <Waveform /> <span>Listening… tap to stop</span>
                </>
              ) : (
                <span className="text-muted">Tap the mic and describe your shop</span>
              )}
            </div>
            <label className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-3 py-1 text-xs font-medium text-muted">
              <Languages className="size-3.5" />
              <span className="sr-only">Speech language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={speech.listening} className="bg-transparent font-semibold text-ink focus:outline-none">
                {SPEECH_LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl bg-sunken px-4 py-3 text-left text-sm text-ink/80">
            <MicOff className="mt-0.5 size-4.5 shrink-0 text-muted" />
            <p>
              Voice input isn't available in this browser — try Chrome, Edge or Safari. You can still <strong>type</strong> or pick an example below.
            </p>
          </div>
        )}
        {speech.error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="alert">
            {speech.error}
          </p>
        )}
      </div>

      <div className="relative mt-6">
        <label htmlFor="transcript" className="sr-only">
          Describe your shop
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="“I run Maya's Bakery on MG Road, open 9 to 8, closed Mondays. We sell sourdough for ₹150 and croissants for ₹80. WhatsApp 98765 43210.”"
          className="field min-h-36 resize-y rounded-2xl p-4 text-base leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && ready) submit();
          }}
        />
        <AnimatePresence>
          {speech.interim && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 rounded-xl bg-[#db2777]/8 px-3 py-2 text-sm italic text-ink/70"
              aria-live="polite"
            >
              {speech.interim}…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTranscript(s.text)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-soft"
          >
            <span aria-hidden>{s.emoji}</span> {s.label}
          </button>
        ))}
        {transcript && (
          <button type="button" onClick={() => setTranscript('')} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted hover:bg-ink/5 hover:text-ink">
            <Eraser className="size-4" /> Clear
          </button>
        )}
      </div>

      <Button variant="vaani" size="lg" onClick={submit} disabled={!ready} loading={busy} className="mt-6 w-full text-lg">
        {!busy && <Wand2 className="size-5" />}
        {busy ? 'Building your store…' : 'Build my store'}
      </Button>
      <p className="mt-2.5 text-center text-xs text-muted">{ready ? 'Takes a few seconds · you can edit everything after' : 'Say or type at least a sentence about your shop'}</p>
    </div>
  );
}

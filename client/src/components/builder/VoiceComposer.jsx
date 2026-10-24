import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Square, ArrowRight, MicOff, Languages, Eraser } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition.js';
import { Button } from '../ui/primitives.jsx';
import { ProductIcon } from '../../lib/icons.jsx';
import { SAMPLES, SPEECH_LANGS } from '../../lib/constants.js';

function MicButton({ listening, onClick, disabled }) {
  return (
    <div className="relative grid size-[96px] shrink-0 place-items-center">
      <AnimatePresence>
        {listening &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border-[3px] border-ink"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.55, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.93 }}
        className={`relative grid size-[88px] place-items-center rounded-full border-[3px] border-ink transition-colors disabled:opacity-40 ${listening ? 'bg-brick text-white' : 'bg-sign text-ink hover:bg-[#F0C252]'}`}
        aria-label={listening ? 'Stop listening' : 'Start speaking'}
        aria-pressed={listening}
      >
        {listening ? <Square className="size-8 fill-current" /> : <Mic className="size-9" strokeWidth={2.2} />}
      </motion.button>
    </div>
  );
}

function Waveform() {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span key={i} className="w-1 rounded-full bg-board" animate={{ height: ['30%', '100%', '45%', '80%', '30%'] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }} />
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
    <div className="sign-card sign-shadow flex flex-col gap-5 p-5 sm:p-7">
      {speech.supported ? (
        <div className="flex items-center gap-4">
          <MicButton listening={speech.listening} onClick={speech.listening ? speech.stop : speech.start} disabled={busy} />
          <div className="min-w-0">
            <p className="sign-type text-[28px]">{speech.listening ? 'Listening' : 'Tap and talk'}</p>
            <div className="mt-1 flex h-5 items-center gap-2 text-sm text-muted" aria-live="polite">
              {speech.listening ? (
                <>
                  <Waveform /> Tap the square when you are done
                </>
              ) : (
                'English, Hindi, or both'
              )}
            </div>
            <label className="mt-2 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-2.5 py-0.5 text-xs font-bold">
              <Languages className="size-3.5" />
              <span className="sr-only">Speech language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={speech.listening} className="bg-transparent font-bold focus:outline-none">
                {SPEECH_LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm">
          <MicOff className="mt-0.5 size-4.5 shrink-0" />
          <p>
            Voice input does not work in this browser. Try Chrome, Edge or Safari, or <strong>type</strong> below.
          </p>
        </div>
      )}
      {speech.error && (
        <p className="rounded-md border-2 border-ink bg-[#F6D9D0] px-3 py-2 text-sm font-bold" role="alert">
          {speech.error}
        </p>
      )}

      <div>
        <label htmlFor="transcript" className="sign-label mb-2 block">
          What you said
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="I run Maya's Bakery on MG Road, open 9 to 8, closed Mondays. We sell sourdough for 150 rupees and croissants for 80. WhatsApp 98765 43210."
          className="sign-input min-h-36 resize-y text-base leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && ready) submit();
          }}
        />
        <AnimatePresence>
          {speech.interim && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 rounded-md border-2 border-dashed border-ink/40 px-3 py-2 text-sm italic text-muted" aria-live="polite">
              {speech.interim}...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="sign-label mr-1 text-muted">Try</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTranscript(s.text)}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-sign"
          >
            <ProductIcon name={s.icon} className="size-4" strokeWidth={1.8} /> {s.label}
          </button>
        ))}
        {transcript && (
          <button type="button" onClick={() => setTranscript('')} className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-muted hover:bg-ink/5 hover:text-ink">
            <Eraser className="size-4" /> Clear
          </button>
        )}
      </div>

      <Button variant="board" size="lg" onClick={submit} disabled={!ready} loading={busy} className="w-full">
        {busy ? 'Building your shop' : 'Build my shop'}
        {!busy && <ArrowRight className="size-5" strokeWidth={2.6} />}
      </Button>
    </div>
  );
}

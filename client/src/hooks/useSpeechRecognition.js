import { useCallback, useEffect, useRef, useState } from 'react';

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

const ERRORS = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings, or type instead.',
  'service-not-allowed': 'Speech recognition is turned off in this browser. You can type instead.',
  'no-speech': "We didn't hear anything — tap the mic and try again.",
  'audio-capture': 'No microphone found. You can type instead.',
  network: 'Speech recognition needs an internet connection. You can type instead.',
};

/**
 * Browser speech-to-text. Final phrases are pushed to `onFinal`; in-progress words are in `interim`.
 */
export function useSpeechRecognition({ lang = 'en-IN', onFinal }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  const stop = useCallback(() => recRef.current?.stop(), []);

  const start = useCallback(() => {
    if (!Recognition) return;
    setError(null);
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let pending = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) onFinalRef.current?.(r[0].transcript.trim());
        else pending += r[0].transcript;
      }
      setInterim(pending);
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError(ERRORS[e.error] ?? 'Something went wrong with the microphone. Please try again.');
    };
    rec.onend = () => {
      setListening(false);
      setInterim('');
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start the microphone. Please try again.');
    }
  }, [lang]);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported: Boolean(Recognition), listening, interim, error, start, stop };
}

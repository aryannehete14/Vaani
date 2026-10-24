import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, ListChecks, Share2, Store, MessageCircle, Clock, MapPin, Search, Sparkles, Zap } from 'lucide-react';
import { Logo, ButtonLink } from '../components/ui/primitives.jsx';
import { VoiceComposer } from '../components/builder/VoiceComposer.jsx';
import { GenerationProgress } from '../components/builder/GenerationProgress.jsx';
import { ReviewPanel } from '../components/builder/ReviewPanel.jsx';
import { DeviceFrame } from '../components/builder/DeviceFrame.jsx';
import { PublishSuccess } from '../components/builder/PublishSuccess.jsx';
import { RecentStores } from '../components/builder/RecentStores.jsx';
import { Storefront } from '../components/storefront/Storefront.jsx';
import { api } from '../lib/api.js';
import { setEditKey } from '../lib/storage.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const FEATURES = [
  [Search, 'Product catalog with search'],
  [MessageCircle, 'WhatsApp ordering'],
  [Clock, 'Live “Open now” status'],
  [MapPin, 'Map & directions'],
];

const STEPS = [
  [Mic, 'Speak', 'Describe your shop like you would to a new customer — name, timings, what you sell and prices.'],
  [ListChecks, 'Review', 'Vaani’s AI pulls out every detail and designs your store. Fix anything with a tap.'],
  [Share2, 'Share', 'Publish and share one link. Customers browse, search and order on WhatsApp.'],
];

// Drop warnings the owner has already fixed in the editor.
function liveWarnings(warnings, draft) {
  return warnings.filter((w) => {
    if (/shop's name/.test(w)) return draft.storeName === 'My Shop';
    if (/phone or WhatsApp/.test(w)) return !draft.contact.phone && !draft.contact.whatsapp;
    if (/No address/.test(w)) return !draft.contact.address;
    if (/No products/.test(w)) return draft.products.length === 0;
    if (/no price/.test(w)) return draft.products.some((p) => !(p.price > 0));
    return true;
  });
}

function EngineStatus() {
  const [engine, setEngine] = useState(null);
  useEffect(() => {
    api.health().then((h) => setEngine(h.aiEngine)).catch(() => setEngine('offline'));
  }, []);
  if (!engine) return null;
  const claude = engine === 'claude';
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-ink/75 sm:inline-flex"
      title={claude ? 'Transcripts are parsed by Claude with structured outputs' : 'No API key set — using the built-in offline parser'}
    >
      {claude ? <Sparkles className="size-3.5 text-[#db2777]" /> : <Zap className="size-3.5 text-amber-500" />}
      {claude ? 'Claude AI engine' : engine === 'offline' ? 'Server offline' : 'Offline AI parser'}
    </span>
  );
}

export function BuilderPage() {
  const [phase, setPhase] = useState('compose');
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState(null);
  const [engine, setEngine] = useState('rules');
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(null);

  useEffect(() => {
    document.title = 'Vaani — Speak your shop into existence';
  }, []);

  const visibleWarnings = useMemo(() => (draft ? liveWarnings(warnings, draft) : []), [warnings, draft]);

  const generate = async () => {
    setError(null);
    setPhase('generating');
    try {
      const [res] = await Promise.all([api.generate(transcript), delay(2400)]);
      setDraft(res.store);
      setEngine(res.engine);
      setWarnings(res.warnings);
      setPhase('review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
      setPhase('compose');
    }
  };

  const publish = async () => {
    setError(null);
    setPublishing(true);
    try {
      const store = { ...draft, products: draft.products.filter((p) => p.name.trim()) };
      const res = await api.publish({ store, transcript, engine });
      setEditKey(res.slug, res.editToken);
      setPublished(res);
      setPhase('published');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const reset = () => {
    setPhase('compose');
    setDraft(null);
    setPublished(null);
    setError(null);
  };

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[42rem] overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-[#7c3aed]/15 blur-3xl" />
        <div className="absolute -right-32 top-10 size-[30rem] rounded-full bg-[#f97316]/15 blur-3xl" />
        <div className="absolute left-1/3 top-64 size-[24rem] rounded-full bg-[#db2777]/10 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <EngineStatus />
          <ButtonLink to="/s/mayas-bakery" variant="secondary" size="sm">
            <Store className="size-4" /> See a demo store
          </ButtonLink>
        </div>
      </header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {(phase === 'compose' || phase === 'generating') && (
            <motion.section
              key="compose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-14"
            >
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink/70 backdrop-blur"
                >
                  <span className="vaani-gradient size-1.5 rounded-full" /> For bakeries, boutiques & kirana stores
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="mt-5 font-display text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.98] tracking-tight text-balance"
                >
                  Speak your shop <span className="vaani-text italic">into existence.</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 max-w-lg text-lg leading-relaxed text-ink/70 text-pretty">
                  Describe your shop the way you'd tell a customer. Vaani builds a beautiful website with your products, hours, map and WhatsApp ordering — in seconds.{' '}
                  <strong className="font-semibold text-ink">No coding. No templates.</strong>
                </motion.p>
                <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-7 grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium text-ink/80">
                  {FEATURES.map(([Icon, label]) => (
                    <li key={label} className="flex items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface text-ink/70 shadow-soft ring-1 ring-line">
                        <Icon className="size-3.5" />
                      </span>
                      {label}
                    </li>
                  ))}
                </motion.ul>
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {phase === 'generating' ? (
                    <GenerationProgress key="progress" />
                  ) : (
                    <motion.div key="composer" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: 0.1 }}>
                      <VoiceComposer transcript={transcript} setTranscript={setTranscript} onGenerate={generate} busy={false} />
                      {error && (
                        <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300" role="alert">
                          {error}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {phase === 'review' && draft && (
            <motion.section
              key="review"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-12"
            >
              <ReviewPanel draft={draft} setDraft={setDraft} engine={engine} warnings={visibleWarnings} onPublish={publish} onReset={reset} publishing={publishing} error={error} />
              <div className="lg:sticky lg:top-6 lg:self-start">
                <DeviceFrame url={`vaani.shop/s/${draft.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <Storefront store={draft} preview />
                </DeviceFrame>
              </div>
            </motion.section>
          )}

          {phase === 'published' && published && (
            <motion.section key="published" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-16 pt-10 sm:px-6">
              <PublishSuccess published={published} onNew={() => { reset(); setTranscript(''); }} />
            </motion.section>
          )}
        </AnimatePresence>

        {phase !== 'review' && (
          <>
            <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
              <h2 id="how-title" className="sr-only">How it works</h2>
              <ol className="grid gap-4 md:grid-cols-3">
                {STEPS.map(([Icon, title, body], i) => (
                  <motion.li
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative rounded-3xl border border-line bg-surface/70 p-6 backdrop-blur"
                  >
                    <span className="absolute right-6 top-5 font-display text-5xl font-semibold text-ink/[0.06]">{i + 1}</span>
                    <span className="vaani-gradient grid size-11 place-items-center rounded-2xl text-white shadow-soft">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
                  </motion.li>
                ))}
              </ol>
            </section>
            <RecentStores refreshKey={published?.slug} />
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
          <p>Vaani · open source under the MIT License</p>
          <p>Built for small shops, with ❤️ and AI.</p>
        </div>
      </footer>
    </div>
  );
}

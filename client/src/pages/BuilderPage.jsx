import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Clock, MapPin, Lock, Sparkles, Zap, Store } from 'lucide-react';
import { Logo, ButtonLink, Tag } from '../components/ui/primitives.jsx';
import { VoiceComposer } from '../components/builder/VoiceComposer.jsx';
import { GenerationProgress } from '../components/builder/GenerationProgress.jsx';
import { ReviewPanel } from '../components/builder/ReviewPanel.jsx';
import { DeviceFrame } from '../components/builder/DeviceFrame.jsx';
import { PublishSuccess } from '../components/builder/PublishSuccess.jsx';
import { RecentStores } from '../components/builder/RecentStores.jsx';
import { Storefront } from '../components/storefront/Storefront.jsx';
import { WhatsAppIcon } from '../components/storefront/WhatsAppIcon.jsx';
import { api } from '../lib/api.js';
import { setEditKey } from '../lib/storage.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const FEATURES = [
  [Search, 'Product search'],
  [Clock, 'Open or closed, live'],
  [WhatsAppIcon, 'WhatsApp orders'],
  [MapPin, 'Map and directions'],
  [Lock, 'No account needed'],
];

const STEPS = [
  ['Speak', 'Half a minute about your shop. Or type it if that is easier.'],
  ['Check', 'See every item and price on a live preview. Tap to fix anything.'],
  ['Share', 'Send one link on WhatsApp status, Instagram or a QR on your counter.'],
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
      className="hidden items-center gap-1.5 rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-bold sm:inline-flex"
      title={claude ? 'Descriptions are read by Claude with structured output' : 'No API key set, so the built-in offline parser reads descriptions'}
    >
      {claude ? <Sparkles className="size-3.5" /> : <Zap className="size-3.5" />}
      {claude ? 'Claude AI engine' : engine === 'offline' ? 'Server offline' : 'Offline parser'}
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
    document.title = 'Vaani: speak your shop, we paint the sign';
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
    <div className="min-h-dvh overflow-x-clip bg-paper">
      <header className="mx-auto flex h-20 max-w-6xl items-center gap-3 px-4 sm:px-8">
        <Logo />
        <span className="flex-1" />
        <EngineStatus />
        <ButtonLink to="/s/mayas-bakery" variant="paper" size="sm">
          <Store className="size-4" /> <span className="hidden sm:inline">See a demo shop</span>
          <span className="sm:hidden">Demo</span>
        </ButtonLink>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {(phase === 'compose' || phase === 'generating') && (
            <motion.section key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-3 pt-2 sm:px-8">
              <div className="rounded-[10px] bg-board p-2 sm:p-3.5">
                <div className="flex flex-col gap-8 rounded-md border-2 border-sign px-5 py-7 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12">
                  <div className="flex-1">
                    <Tag tilt="rotate-0">No coding. No templates.</Tag>
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sign-type mt-5 text-[clamp(3.25rem,8.5vw,6rem)] leading-[0.9] text-sign"
                    >
                      Speak your shop.
                      <br />
                      We paint the sign.
                    </motion.h1>
                    <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-[#E9E3D2]">
                      Tell Vaani what you sell and when you are open. It builds a shop website with your prices, a map and a button that sends orders to your
                      WhatsApp.
                    </p>
                  </div>
                  <div className="w-full lg:w-[440px] lg:shrink-0">
                    <AnimatePresence mode="wait">
                      {phase === 'generating' ? (
                        <GenerationProgress key="progress" />
                      ) : (
                        <motion.div key="composer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          <VoiceComposer transcript={transcript} setTranscript={setTranscript} onGenerate={generate} busy={false} />
                          {error && (
                            <p className="mt-4 rounded-lg border-2 border-ink bg-[#F6D9D0] px-4 py-3 text-sm font-bold" role="alert">
                              {error}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {phase === 'review' && draft && (
            <motion.section
              key="review"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]"
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
            <motion.section key="published" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-16 pt-4 sm:px-8">
              <PublishSuccess
                published={published}
                onNew={() => {
                  reset();
                  setTranscript('');
                }}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {phase !== 'review' && (
          <>
            <section aria-labelledby="steps-title" className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-8">
              <h2 id="steps-title" className="sign-type text-[clamp(2.5rem,6vw,3.5rem)] text-board">
                Three steps. That is all.
              </h2>
              <ol className="mt-7 grid gap-5 md:grid-cols-3">
                {STEPS.map(([title, body], i) => (
                  <motion.li
                    key={title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="sign-card p-7"
                  >
                    <span className="sign-type block text-[64px] leading-none text-brick">{i + 1}</span>
                    <h3 className="mt-3 text-2xl font-extrabold">{title}</h3>
                    <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{body}</p>
                  </motion.li>
                ))}
              </ol>
              <ul className="mt-6 flex flex-wrap gap-3" aria-label="Every shop gets">
                {FEATURES.map(([Icon, label]) => (
                  <li key={label} className="inline-flex h-12 items-center gap-2.5 rounded-full border-2 border-ink bg-card px-5 font-bold">
                    <Icon className="size-5" strokeWidth={2} />
                    {label}
                  </li>
                ))}
              </ul>
            </section>
            <RecentStores refreshKey={published?.slug} />
          </>
        )}
      </main>

      <footer className="bg-board text-[#E9E3D2]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-7 text-sm sm:flex-row sm:px-8">
          <span className="sign-type text-[24px] text-sign">Vaani</span>
          <span>Open source, MIT License. Made for the shops on your street.</span>
        </div>
      </footer>
    </div>
  );
}

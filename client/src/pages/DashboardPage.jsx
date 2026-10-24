import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, KeyRound, Save, Undo2 } from 'lucide-react';
import { Logo, Button, ButtonLink, SignCard, CopyButton } from '../components/ui/primitives.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { DetailsEditor } from '../components/editors/DetailsEditor.jsx';
import { ProductsEditor } from '../components/editors/ProductsEditor.jsx';
import { VoiceAdd } from '../components/dashboard/VoiceAdd.jsx';
import { InquiriesList } from '../components/dashboard/InquiriesList.jsx';
import { CounterCard } from '../components/builder/CounterCard.jsx';
import { WhatsAppIcon } from '../components/storefront/WhatsAppIcon.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import { api } from '../lib/api.js';
import { getEditKey, setEditKey } from '../lib/storage.js';
import { shareLink } from '../lib/whatsapp.js';
import { getOpenStatus } from '../lib/hours.js';
import { useNow } from '../hooks/useNow.js';

const TABS = [
  ['overview', 'Overview'],
  ['products', 'Products'],
  ['details', 'Shop details'],
  ['inquiries', 'Messages'],
];

function KeyGate({ slug, error, onSubmit }) {
  const [key, setKey] = useState('');
  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4">
      <SignCard className="sign-shadow w-full max-w-md p-7">
        <Logo small />
        <span className="mt-8 grid size-12 place-items-center rounded-full border-[3px] border-ink bg-sign">
          <KeyRound className="size-6" />
        </span>
        <h1 className="sign-type mt-4 text-[40px] text-board">Enter your edit key</h1>
        <p className="mt-2 text-[15px] text-muted">
          To manage <strong className="text-ink">/s/{slug}</strong>, paste the private key you got when you put your shop online.
          {slug === 'mayas-bakery' && (
            <>
              {' '}For the demo shop the key is <code className="rounded border-2 border-ink bg-white px-1.5 font-mono text-ink">demo</code>.
            </>
          )}
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(key.trim());
          }}
        >
          <label htmlFor="edit-key" className="sr-only">
            Edit key
          </label>
          <input id="edit-key" className="sign-input font-mono" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste your key" autoFocus />
          {error && (
            <p className="rounded-md border-2 border-ink bg-[#F6D9D0] px-3 py-2 text-sm font-bold" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="board" className="w-full" disabled={!key.trim()}>
            Open my dashboard
          </Button>
        </form>
      </SignCard>
    </main>
  );
}

function Stat({ label, value, tone = 'bg-card' }) {
  return (
    <div className={`rounded-lg border-[3px] border-ink p-5 ${tone}`}>
      <p className="sign-type text-[52px] leading-none">{value}</p>
      <p className="mt-2 text-sm font-bold">{label}</p>
    </div>
  );
}

export function DashboardPage() {
  const { slug } = useParams();
  const toast = useToast();
  const now = useNow();
  const [token, setToken] = useState(() => getEditKey(slug));
  const [state, setState] = useState({ status: token ? 'loading' : 'locked' });
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [tab, setTab] = useState('overview');
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (key) => {
      setState({ status: 'loading' });
      try {
        const data = await api.getOwnerStore(slug, key);
        setEditKey(slug, key);
        setToken(key);
        setSaved(data.store);
        setDraft(data.store);
        setState({ status: 'ready' });
        api.listInquiries(slug, key).then((d) => setInquiries(d.inquiries)).catch(() => setInquiries([]));
      } catch (err) {
        if (err.status === 404) setState({ status: 'missing' });
        else setState({ status: 'locked', error: err.status === 401 ? "That key doesn't match this shop." : err.message });
      }
    },
    [slug],
  );

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const dirty = useMemo(() => draft && saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (saved) document.title = `Dashboard: ${saved.storeName}`;
  }, [saved]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updateStore(slug, { ...draft, products: draft.products.filter((p) => p.name.trim()) }, token);
      setSaved(res.store);
      setDraft(res.store);
      toast('Saved. Your shop is updated.');
    } catch (err) {
      toast(err.message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleInquiry = async (q) => {
    const status = q.status === 'done' ? 'new' : 'done';
    setInquiries((list) => list.map((x) => (x.id === q.id ? { ...x, status } : x)));
    try {
      await api.setInquiryStatus(slug, q.id, status, token);
    } catch (err) {
      setInquiries((list) => list.map((x) => (x.id === q.id ? q : x)));
      toast(err.message, { tone: 'error' });
    }
  };

  if (state.status === 'locked') return <KeyGate slug={slug} error={state.error} onSubmit={load} />;
  if (state.status === 'missing') return <NotFoundPage title="No shop here" message="We couldn't find that shop." />;
  if (state.status === 'loading' || !draft) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper" aria-busy="true">
        <div className="size-12 animate-spin rounded-full border-[5px] border-ink border-t-sign" />
      </div>
    );
  }

  const openCount = inquiries?.filter((q) => q.status === 'new').length ?? 0;
  const storeUrl = `${window.location.origin}/s/${slug}`;
  const status = getOpenStatus(draft.hours, now);

  return (
    <div className="min-h-dvh bg-paper pb-28">
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-paper">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Logo small />
          <span className="flex-1" />
          <ButtonLink to={`/s/${slug}`} variant="paper" size="sm">
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">View my shop</span>
          </ButtonLink>
          <Button variant="board" size="sm" onClick={save} loading={saving} disabled={!dirty}>
            {!saving && <Save className="size-4" />} Save
          </Button>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 sm:px-5" aria-label="Dashboard sections">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? 'page' : undefined}
              onClick={() => setTab(key)}
              className={`relative inline-flex h-12 shrink-0 items-center gap-2 px-3.5 text-[15px] font-extrabold transition ${tab === key ? 'text-ink' : 'text-muted hover:text-ink'}`}
            >
              {label}
              {key === 'inquiries' && openCount > 0 && <span className="rounded-[3px] border-2 border-ink bg-sign px-1.5 text-[11px]">{openCount}</span>}
              {tab === key && <motion.span layoutId="dash-tab" className="absolute inset-x-1 -bottom-[3px] h-[5px] bg-sign" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="rounded-[10px] bg-board p-2.5 shadow-[8px_8px_0_#1A1A17]">
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-md border-2 border-sign px-5 py-6 sm:px-7">
                    <div className="flex items-center gap-4">
                      {saved.logo && <img src={saved.logo} alt="" className="size-16 shrink-0 rounded-full border-[3px] border-sign bg-white object-contain" />}
                      <div>
                      <p className="text-xs font-bold tracking-[0.22em] text-[#E9E3D2]">NAMASTE, THIS IS YOUR SHOP</p>
                      <p className="sign-type mt-2 text-[clamp(2.5rem,7vw,4rem)] text-sign">{saved.storeName}</p>
                      </div>
                    </div>
                    <span className={`sign-type rotate-3 rounded-md border-[3px] border-ink bg-card px-3 py-1.5 text-[22px] ${status.isOpen ? 'text-[#1F6B3A]' : 'text-brick'}`}>
                      {status.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <Stat label="Products" value={draft.products.length} />
                  <Stat label="Categories" value={new Set(draft.products.map((p) => p.category)).size} />
                  <Stat label="New messages" value={openCount} tone={openCount ? 'bg-sign' : 'bg-card'} />
                  <Stat label="All messages" value={inquiries?.length ?? 0} />
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                  <SignCard className="flex-1 p-6">
                    <p className="sign-label">Your shop link</p>
                    <p className="mt-1 text-sm text-muted">Share it on WhatsApp status, your Instagram bio, or print the QR for your counter.</p>
                    <div className="mt-4 flex items-center gap-2 rounded-md border-2 border-ink bg-white p-1.5 pl-3.5">
                      <span className="min-w-0 flex-1 truncate font-mono text-sm">{storeUrl}</span>
                      <CopyButton text={storeUrl} />
                    </div>
                    <ButtonLink href={shareLink(`Order from ${saved.storeName} online: ${storeUrl}`)} variant="wa" className="mt-3 w-full">
                      <WhatsAppIcon className="size-5" /> Share on WhatsApp
                    </ButtonLink>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button type="button" onClick={() => setTab('products')} className="rounded-md border-2 border-ink bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1A1A17]">
                        <p className="font-extrabold">Update products by voice</p>
                        <p className="mt-0.5 text-sm text-muted">New stock or a price change? Just say it.</p>
                      </button>
                      <button type="button" onClick={() => setTab('details')} className="rounded-md border-2 border-ink bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1A1A17]">
                        <p className="font-extrabold">Change colours and timings</p>
                        <p className="mt-0.5 text-sm text-muted">Pick a new look or update your hours.</p>
                      </button>
                    </div>
                  </SignCard>
                  <CounterCard url={storeUrl} storeName={saved.storeName} className="lg:w-80" />
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div className="space-y-6">
                <VoiceAdd store={draft} onAdd={(items) => setDraft((d) => ({ ...d, products: [...d.products, ...items] }))} />
                <SignCard className="p-4 sm:p-5">
                  <ProductsEditor store={draft} onChange={setDraft} />
                </SignCard>
              </div>
            )}

            {tab === 'details' && (
              <SignCard className="p-5 sm:p-7">
                <DetailsEditor store={draft} onChange={setDraft} />
              </SignCard>
            )}

            {tab === 'inquiries' && <InquiriesList inquiries={inquiries} storeName={saved.storeName} onToggle={toggleInquiry} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-40 mx-auto flex max-w-lg items-center gap-3 rounded-lg border-[3px] border-ink bg-sign p-2 pl-5 shadow-[6px_6px_0_#1A1A17]"
            role="status"
          >
            <span className="flex-1 text-[15px] font-extrabold">You have unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={() => setDraft(saved)}>
              <Undo2 className="size-4" /> Discard
            </Button>
            <Button variant="board" size="sm" onClick={save} loading={saving}>
              {!saving && <Save className="size-4" />} Save
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

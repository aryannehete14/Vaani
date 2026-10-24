import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, KeyRound, LayoutGrid, Package, Store, Inbox, Save, Undo2, Tags, MessageSquare, Link2 } from 'lucide-react';
import { Logo, Button, ButtonLink, Card, CopyButton } from '../components/ui/primitives.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { DetailsEditor } from '../components/editors/DetailsEditor.jsx';
import { ProductsEditor } from '../components/editors/ProductsEditor.jsx';
import { VoiceAdd } from '../components/dashboard/VoiceAdd.jsx';
import { InquiriesList } from '../components/dashboard/InquiriesList.jsx';
import { StatusBadge } from '../components/storefront/StatusBadge.jsx';
import { WhatsAppIcon } from '../components/storefront/WhatsAppIcon.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import { api } from '../lib/api.js';
import { getEditKey, setEditKey } from '../lib/storage.js';
import { shareLink } from '../lib/whatsapp.js';
import { useNow } from '../hooks/useNow.js';

const TABS = [
  ['overview', 'Overview', LayoutGrid],
  ['products', 'Products', Package],
  ['details', 'Details', Store],
  ['inquiries', 'Inquiries', Inbox],
];

function KeyGate({ slug, error, onSubmit }) {
  const [key, setKey] = useState('');
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <Card className="w-full max-w-md p-7">
        <Logo />
        <span className="mt-8 grid size-12 place-items-center rounded-2xl bg-sunken">
          <KeyRound className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">Enter your edit key</h1>
        <p className="mt-1.5 text-sm text-muted">
          To manage <strong className="text-ink">/s/{slug}</strong>, paste the private key you got when you published.
          {slug === 'mayas-bakery' && (
            <>
              {' '}For the demo store, the key is <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-ink">demo</code>.
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
          <input id="edit-key" className="field font-mono" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste your key" autoFocus />
          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={!key.trim()}>
            Open dashboard
          </Button>
        </form>
      </Card>
    </main>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand-fg">
        <Icon className="size-4.5" />
      </span>
      <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </Card>
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
        else setState({ status: 'locked', error: err.status === 401 ? 'That key doesn’t match this store.' : err.message });
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
    if (saved) document.title = `Dashboard · ${saved.storeName}`;
  }, [saved]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updateStore(slug, { ...draft, products: draft.products.filter((p) => p.name.trim()) }, token);
      setSaved(res.store);
      setDraft(res.store);
      toast('Changes saved — your storefront is updated.');
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
  if (state.status === 'missing') return <NotFoundPage message="We couldn't find that store." />;
  if (state.status === 'loading' || !draft) {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <div className="size-10 animate-spin rounded-full border-4 border-line border-t-ink" />
      </div>
    );
  }

  const openCount = inquiries?.filter((q) => q.status === 'new').length ?? 0;
  const storeUrl = `${window.location.origin}/s/${slug}`;
  const categories = new Set(draft.products.map((p) => p.category)).size;

  return (
    <div className="brand-scope min-h-dvh pb-28" style={{ '--brand': draft.primaryColor }}>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Logo className="hidden sm:inline-flex" />
          <span className="hidden h-6 w-px bg-line sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold leading-tight">{saved.storeName}</p>
            <p className="text-xs text-muted">Owner dashboard</p>
          </div>
          <ButtonLink to={`/s/${slug}`} variant="secondary" size="sm">
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">View live</span>
          </ButtonLink>
          <Button variant="brand" size="sm" onClick={save} loading={saving} disabled={!dirty}>
            {!saving && <Save className="size-4" />} Save
          </Button>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 sm:px-5" role="tablist" aria-label="Dashboard sections">
          {TABS.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`relative inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-semibold transition ${tab === key ? 'text-ink' : 'text-muted hover:text-ink'}`}
            >
              <Icon className="size-4" />
              {label}
              {key === 'inquiries' && openCount > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{openCount}</span>}
              {tab === key && <motion.span layoutId="dash-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="font-display text-3xl font-semibold tracking-tight">Namaste! 👋</h1>
                  <StatusBadge hours={draft.hours} now={now} />
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <Stat icon={Package} label="Products" value={draft.products.length} />
                  <Stat icon={Tags} label="Categories" value={categories} />
                  <Stat icon={MessageSquare} label="New messages" value={openCount} />
                  <Stat icon={Inbox} label="All messages" value={inquiries?.length ?? '–'} />
                </div>
                <Card className="p-5 sm:p-6">
                  <p className="flex items-center gap-2 font-semibold">
                    <Link2 className="size-4.5" /> Your store link
                  </p>
                  <p className="mt-1 text-sm text-muted">Share it on WhatsApp status, Instagram bio, or print it at your counter.</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-canvas p-2 pl-4">
                      <span className="min-w-0 flex-1 truncate font-mono text-sm">{storeUrl}</span>
                      <CopyButton text={storeUrl} />
                    </div>
                    <ButtonLink href={shareLink(`🛍️ Order from ${saved.storeName} online: ${storeUrl}`)} variant="whatsapp">
                      <WhatsAppIcon className="size-5" /> Share
                    </ButtonLink>
                  </div>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button type="button" onClick={() => setTab('products')} className="rounded-3xl border border-line bg-surface p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                    <Package className="size-5 text-brand-fg" />
                    <p className="mt-3 font-semibold">Update products by voice</p>
                    <p className="text-sm text-muted">New stock or price change? Just say it.</p>
                  </button>
                  <button type="button" onClick={() => setTab('details')} className="rounded-3xl border border-line bg-surface p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                    <Store className="size-5 text-brand-fg" />
                    <p className="mt-3 font-semibold">Edit hours, contact & colours</p>
                    <p className="text-sm text-muted">Keep customers up to date.</p>
                  </button>
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div className="space-y-5">
                <VoiceAdd store={draft} onAdd={(items) => setDraft((d) => ({ ...d, products: [...d.products, ...items] }))} />
                <Card className="p-4 sm:p-5">
                  <ProductsEditor store={draft} onChange={setDraft} />
                </Card>
              </div>
            )}

            {tab === 'details' && (
              <Card className="p-5 sm:p-7">
                <DetailsEditor store={draft} onChange={setDraft} />
              </Card>
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
            className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-40 mx-auto flex max-w-lg items-center gap-3 rounded-3xl bg-ink p-2.5 pl-5 text-canvas shadow-lift"
            role="status"
          >
            <span className="flex-1 text-sm font-semibold">You have unsaved changes</span>
            <button type="button" onClick={() => setDraft(saved)} className="inline-flex h-10 items-center gap-1.5 rounded-2xl px-3 text-sm font-semibold text-canvas/75 transition hover:bg-canvas/10 hover:text-canvas">
              <Undo2 className="size-4" /> Discard
            </button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-brand px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
              <Save className="size-4" /> {saving ? 'Saving…' : 'Save'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

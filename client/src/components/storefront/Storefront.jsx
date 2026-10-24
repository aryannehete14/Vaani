import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Phone, MapPin, Clock, PackageOpen, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { ProductCard } from './ProductCard.jsx';
import { CartBar } from './CartBar.jsx';
import { InfoSection } from './InfoSection.jsx';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useNow } from '../../hooks/useNow.js';
import { catalogNoun, initials, isImageUrl } from '../../lib/format.js';
import { formatTime } from '../../lib/hours.js';
import { waLink } from '../../lib/whatsapp.js';

/**
 * The customer-facing store. Renders entirely from a store config, so the same component
 * powers the public page and the live preview inside the builder.
 * Uses container queries (@md:, @lg:) so it lays out by its own width, not the window's.
 */
export function Storefront({ store, slug, preview = false }) {
  const now = useNow();
  const cart = useCart(slug, store.products, { persist: !preview });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const noun = catalogNoun(store.category);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const p of store.products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [['All', store.products.length], ...counts];
  }, [store.products]);

  const activeCategory = categories.some(([c]) => c === category) ? category : 'All';
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.products.filter(
      (p) =>
        (activeCategory === 'All' || p.category === activeCategory) &&
        (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [store.products, query, activeCategory]);

  const { phone, whatsapp, address } = store.contact;
  const heroEmojis = store.products.filter((p) => !isImageUrl(p.image)).slice(0, 3).map((p) => p.image);

  return (
    <div className="brand-scope @container relative min-h-full bg-canvas text-ink" style={{ '--brand': store.primaryColor }}>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 @md:px-8">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand font-display text-[15px] font-bold text-white shadow-soft" aria-hidden>
            {initials(store.storeName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-semibold leading-tight tracking-tight">{store.storeName}</p>
            <p className="truncate text-xs text-muted">{store.category}{address ? ` · ${address}` : ''}</p>
          </div>
          <nav className="hidden items-center gap-1 text-sm font-semibold @lg:flex" aria-label="Store sections">
            <a href="#catalog" className="rounded-full px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">{noun}</a>
            <a href="#visit" className="rounded-full px-3 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">Visit</a>
          </nav>
          {whatsapp && (
            <a
              href={waLink(whatsapp, `Hi ${store.storeName}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1FAF54] px-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#1A9A49] active:scale-95"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="size-4.5" />
              <span className="hidden @sm:inline">Chat</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--brand)_18%,transparent),transparent_60%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--brand)_10%,transparent),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 @md:px-8 @md:pb-16 @md:pt-16 @3xl:grid-cols-[1.2fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <StatusBadge hours={store.hours} now={now} />
            <h1 className="mt-5 font-display text-[clamp(2.4rem,9cqi,4.5rem)] font-semibold leading-[1.02] tracking-tight text-balance">
              {store.storeName}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70 text-pretty @md:text-xl">{store.tagline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#catalog" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-white shadow-lift transition hover:brightness-110 active:scale-[0.97]">
                <Sparkles className="size-4.5" /> Browse {noun.toLowerCase()}
              </a>
              {phone && (
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-12 items-center gap-2 rounded-2xl border border-line bg-surface px-5 font-semibold transition hover:border-ink/25 active:scale-[0.97]">
                  <Phone className="size-4.5" /> Call
                </a>
              )}
              {address && (
                <a href="#visit" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-line bg-surface px-5 font-semibold transition hover:border-ink/25 active:scale-[0.97]">
                  <MapPin className="size-4.5" /> Directions
                </a>
              )}
            </div>
            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/70">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-brand-fg" />
                <dt className="sr-only">Hours</dt>
                <dd>
                  {store.hours.days} · {formatTime(store.hours.open)} – {formatTime(store.hours.close)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <PackageOpen className="size-4 text-brand-fg" />
                <dt className="sr-only">Catalog size</dt>
                <dd>{store.products.length} {store.products.length === 1 ? 'item' : 'items'}</dd>
              </div>
            </dl>
          </motion.div>

          {heroEmojis.length > 0 && (
            <div className="relative mx-auto hidden h-72 w-full max-w-sm @3xl:block" aria-hidden>
              {heroEmojis.map((emoji, i) => (
                <motion.div
                  key={`${emoji}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: [-8, 6, -3][i] }}
                  transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 200, damping: 18 }}
                  className={`absolute grid place-items-center rounded-[2rem] border border-line bg-surface shadow-lift ${
                    ['left-0 top-6 size-40 text-7xl', 'right-0 top-0 size-36 text-6xl', 'bottom-0 left-1/3 size-36 text-6xl'][i]
                  }`}
                >
                  <div className="absolute inset-2 rounded-[1.6rem] bg-brand/10" />
                  <span className="relative">{emoji}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-16 px-4 @md:px-8" aria-labelledby="catalog-title">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
          <div>
            <h2 id="catalog-title" className="font-display text-3xl font-semibold tracking-tight @md:text-4xl">
              Our {noun.toLowerCase()}
            </h2>
            <p className="mt-1 text-muted">Tap “Add”, then send your order on WhatsApp.</p>
          </div>
          <label className="relative block w-full @2xl:max-w-xs">
            <span className="sr-only">Search {noun.toLowerCase()}</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${noun.toLowerCase()}…`}
              className="field h-12 rounded-2xl pl-10 pr-10"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-ink/5" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        {categories.length > 2 && (
          <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 @md:mx-0 @md:flex-wrap @md:px-0" role="tablist" aria-label="Filter by category">
            {categories.map(([name, count]) => {
              const active = name === activeCategory;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(name)}
                  className={`relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                    active ? 'text-white' : 'border border-line bg-surface text-ink/75 hover:border-ink/25 hover:text-ink'
                  }`}
                >
                  {active && <motion.span layoutId={`chip-${slug ?? 'preview'}`} className="absolute inset-0 rounded-full bg-brand shadow-soft" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span className="relative">{name}</span>
                  <span className={`relative rounded-full px-1.5 text-[11px] tabular-nums ${active ? 'bg-white/20' : 'bg-sunken'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 @sm:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @md:gap-5" aria-live="polite">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                qty={cart.qty(product.id)}
                onAdd={() => cart.add(product.id)}
                onRemove={() => cart.remove(product.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
            <PackageOpen className="size-10 text-muted" />
            {store.products.length === 0 ? (
              <>
                <p className="font-display text-xl font-semibold">{noun} coming soon</p>
                <p className="max-w-sm text-sm text-muted">Message us on WhatsApp or call to ask what's available today.</p>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-semibold">Nothing matches “{query}”</p>
                <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="text-sm font-semibold text-brand-fg hover:underline">
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <InfoSection store={store} slug={slug} now={now} preview={preview} />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted @md:flex-row @md:px-8">
          <p>© {now.getFullYear()} {store.storeName}</p>
          <Link to="/" className="inline-flex items-center gap-1.5 font-medium transition hover:text-ink">
            Made with <span className="vaani-text font-display font-semibold">Vaani</span> — build yours by voice
          </Link>
        </div>
      </footer>

      <CartBar cart={cart} store={store} />
    </div>
  );
}

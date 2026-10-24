import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Phone, Clock, MapPin, PackageOpen, ListChecks, Store } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { BestsellerTile, ProductRow } from './ProductCard.jsx';
import { CartBar } from './CartBar.jsx';
import { AboutSection, VisitSection } from './InfoSection.jsx';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useNow } from '../../hooks/useNow.js';
import { initials } from '../../lib/format.js';
import { formatTime } from '../../lib/hours.js';
import { waLink } from '../../lib/whatsapp.js';
import { ProductIcon, isImageUrl } from '../../lib/icons.jsx';
import { themeStyle } from '../../lib/themes.js';

const CATEGORY_ICON = {
  Bakery: 'bread', Cafe: 'cup', 'Sweet Shop': 'sweet', Restaurant: 'bowl', Boutique: 'dress', Grocery: 'basket',
  'Fruits & Vegetables': 'apple', Florist: 'flower', Pharmacy: 'pill', Electronics: 'phone', 'Books & Stationery': 'book',
  'Salon & Beauty': 'drop', Handicrafts: 'pot',
};

function Feature({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-leaf-brand">
        <Icon className="size-5" strokeWidth={1.6} />
      </span>
      <div>
        <p className="mt-0.5 font-extrabold">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-leaf-muted">{children}</p>
      </div>
    </div>
  );
}

/** Shop logo and name: back to the top of the shop. Inside the builder preview it only scrolls. */
function ShopHome({ slug, preview, rootRef, label, children }) {
  const cls = 'flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left @4xl:flex-none';
  if (preview || !slug) {
    return (
      <button type="button" className={cls} aria-label={label} onClick={() => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
        {children}
      </button>
    );
  }
  return (
    <Link to={`/s/${slug}`} className={cls} aria-label={label} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      {children}
    </Link>
  );
}

/**
 * The Leaf storefront. Renders entirely from a store config, so the same component powers the
 * public page and the live preview in the builder. Container queries (@md:, @3xl:) make it lay
 * out by its own width rather than the window's.
 */
export function Storefront({ store, slug, preview = false }) {
  const now = useNow();
  const cart = useCart(slug, store.products, { persist: !preview });
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const counts = new Map();
    for (const p of store.products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return [['All', store.products.length], ...counts];
  }, [store.products]);

  const activeCategory = categories.some(([c]) => c === category) ? category : 'All';
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.products.filter(
      (p) => (activeCategory === 'All' || p.category === activeCategory) && (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [store.products, query, activeCategory]);

  const { phone, whatsapp, address } = store.contact;
  const heroIcon = store.products.find((p) => !isImageUrl(p.image))?.image ?? CATEGORY_ICON[store.category] ?? 'basket';
  const heroPhoto = store.products.find((p) => isImageUrl(p.image))?.image;
  const bestsellers = store.products.slice(0, 3);
  const area = address.split(',').map((s) => s.trim()).filter(Boolean).slice(-2).join(', ');
  const daysLabel = store.hours.days === 'Daily' ? 'Every day' : store.hours.days;

  return (
    <div ref={rootRef} className="leaf @container relative min-h-full bg-leaf-ground font-leaf text-leaf-deep" style={themeStyle(store.theme)}>
      <header className="sticky top-0 z-20 border-b border-leaf-line bg-leaf-ground/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-3 px-4 @3xl:h-[84px] @3xl:gap-6 @3xl:px-8">
          <ShopHome slug={slug} preview={preview} rootRef={rootRef} label={`${store.storeName} home`}>
            {store.logo ? (
              <img src={store.logo} alt="" className="size-11 shrink-0 rounded-full bg-white object-contain ring-1 ring-leaf-line" />
            ) : (
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-leaf-brand font-serif text-[15px] font-bold text-white" aria-hidden>
                {initials(store.storeName)}
              </span>
            )}
            <span className="block min-w-0">
              <span className="block truncate font-serif text-[17px] font-bold leading-tight @3xl:text-[19px]">{store.storeName}</span>
              <span className="block truncate text-xs text-leaf-muted">{area || store.category}</span>
            </span>
          </ShopHome>
          <nav className="hidden flex-1 justify-center gap-6 text-[15px] font-semibold @4xl:flex" aria-label="Store sections">
            {bestsellers.length >= 3 && <a href="#bestsellers" className="hover:text-leaf-action">Bestsellers</a>}
            <a href="#products" className="hover:text-leaf-action">All products</a>
            {store.about && <a href="#about" className="hover:text-leaf-action">About</a>}
            <a href="#visit" className="hover:text-leaf-action">Visit</a>
          </nav>
          {whatsapp && (
            <a
              href={waLink(whatsapp, `Hi ${store.storeName}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-leaf-action px-3 font-bold text-white transition hover:brightness-110 active:scale-95 @md:px-5"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="size-5" />
              <span className="hidden @md:inline">Order on WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-4 @3xl:px-8 @3xl:pt-6">
        <div className="flex flex-col overflow-hidden rounded-[32px] bg-white @4xl:flex-row @4xl:rounded-[40px]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex-1 p-6 @md:p-8 @4xl:p-14">
            <StatusBadge hours={store.hours} now={now} />
            <h1 className="mt-5 font-serif text-[clamp(2.1rem,7cqi,3.6rem)] font-semibold leading-[1.07] tracking-[-0.01em] text-balance">{store.tagline}</h1>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-leaf-muted @3xl:text-[17px]">
              {address ? `Find us at ${address}. ` : ''}Add what you need to your list and send it to us{whatsapp ? ' on WhatsApp' : ''}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex h-12 items-center rounded-full bg-leaf-action px-6 font-extrabold text-white transition hover:brightness-110 active:scale-[0.97]">
                Browse products
              </a>
              {phone && (
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-leaf-deep px-5 font-bold transition hover:bg-leaf-ground active:scale-[0.97]">
                  <Phone className="size-4.5" strokeWidth={1.8} /> Call the shop
                </a>
              )}
            </div>
            <dl className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-[13px] font-semibold text-leaf-muted">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-full border-[1.5px] border-leaf-brand text-leaf-deep"><Clock className="size-4.5" strokeWidth={1.6} /></span>
                <dt className="sr-only">Hours</dt>
                <dd className="leading-tight">{daysLabel}<br />{formatTime(store.hours.open)} to {formatTime(store.hours.close)}</dd>
              </div>
              {area && (
                <div className="flex items-center gap-2.5">
                  <span className="grid size-10 place-items-center rounded-full border-[1.5px] border-leaf-brand text-leaf-deep"><MapPin className="size-4.5" strokeWidth={1.6} /></span>
                  <dt className="sr-only">Location</dt>
                  <dd className="max-w-36 leading-tight">{area}</dd>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-full border-[1.5px] border-leaf-brand text-leaf-deep"><ProductIcon name="basket" className="size-4.5" strokeWidth={1.6} /></span>
                <dt className="sr-only">Catalogue</dt>
                <dd className="leading-tight">{store.products.length} products<br />{categories.length - 1} {categories.length - 1 === 1 ? 'category' : 'categories'}</dd>
              </div>
            </dl>
          </motion.div>

          <div className="relative flex min-h-64 items-center justify-center rounded-bl-[120px] bg-leaf-panel p-10 @4xl:w-[42%] @4xl:rounded-bl-[200px]" aria-hidden="true">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 160, damping: 18 }}
              className="grid aspect-square w-[min(300px,62cqi)] place-items-center overflow-hidden rounded-full bg-leaf-ground text-leaf-brand shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]"
            >
              {heroPhoto ? <img src={heroPhoto} alt="" className="size-full object-cover" /> : <ProductIcon name={heroIcon} className="size-[36%]" strokeWidth={0.9} />}
            </motion.div>
            {whatsapp && (
              <span className="absolute bottom-8 right-8 hidden size-24 flex-col items-center justify-center rounded-full bg-white text-center text-[11px] font-extrabold leading-tight shadow-[0_12px_30px_-16px_rgba(0,0,0,0.5)] @4xl:flex">
                <WhatsAppIcon className="mb-1 size-5 text-leaf-brand" />
                Order on<br />WhatsApp
              </span>
            )}
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pt-10 @xl:grid-cols-2 @4xl:grid-cols-4 @3xl:px-8" aria-label="How ordering works">
        <Feature icon={Store} title={`${store.category} essentials`}>Everything we stock, with today's prices.</Feature>
        <Feature icon={ListChecks} title="Make a list">Add items to your cart as you browse.</Feature>
        <Feature icon={WhatsAppIcon} title={whatsapp ? 'Send on WhatsApp' : 'Call to order'}>{whatsapp ? 'Your list arrives with prices and a total.' : 'Read your list out to us on the phone.'}</Feature>
        <Feature icon={MapPin} title="Pick up nearby">{address ? 'Directions to the shop in one tap.' : 'Ask us for directions.'}</Feature>
      </section>

      {/* Bestsellers */}
      {bestsellers.length >= 3 && (
        <section id="bestsellers" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12 @3xl:px-8">
          <div className="flex flex-col gap-7 rounded-[32px] bg-leaf-panel p-6 @3xl:rounded-[40px] @3xl:p-10 @5xl:flex-row @5xl:items-center">
            <div className="@5xl:w-56 @5xl:shrink-0">
              <h2 className="font-serif text-[32px] font-semibold leading-tight @3xl:text-[38px]">Bestsellers</h2>
              <p className="mt-2 text-[15px] leading-relaxed">What our regulars pick up every week.</p>
              <a href="#products" className="mt-5 hidden h-11 items-center rounded-full bg-white px-5 font-bold @5xl:inline-flex">See all products</a>
            </div>
            <div className="grid flex-1 gap-4 @xl:grid-cols-3">
              {bestsellers.map((p) => (
                <BestsellerTile key={p.id} product={p} store={store} cart={cart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue */}
      <section id="products" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14 @3xl:px-8" aria-labelledby="products-title">
        <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <h2 id="products-title" className="font-serif text-[32px] font-semibold @3xl:text-[38px]">All products</h2>
          <label className="relative block w-full @3xl:max-w-sm">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-leaf-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="leaf-input h-12 rounded-full pl-11 pr-11" />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-leaf-muted hover:bg-leaf-ground" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        {categories.length > 2 && (
          <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 @3xl:mx-0 @3xl:flex-wrap @3xl:px-0" role="group" aria-label="Filter by category">
            {categories.map(([name, count]) => {
              const active = name === activeCategory;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(name)}
                  className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition ${
                    active ? 'text-white' : 'border border-leaf-line bg-white hover:border-leaf-deep/40'
                  }`}
                >
                  {active && <motion.span layoutId={`chip-${slug ?? 'preview'}`} className="absolute inset-0 rounded-full bg-leaf-deep" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span className="relative">{name}</span>
                  <span className={`relative text-xs tabular-nums ${active ? 'text-white/75' : 'text-leaf-muted'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3" aria-live="polite">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <ProductRow key={product.id} product={product} store={store} cart={cart} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-[32px] border border-dashed border-leaf-line bg-white/60 px-6 py-14 text-center">
            <PackageOpen className="size-10 text-leaf-muted" strokeWidth={1.4} />
            {store.products.length === 0 ? (
              <>
                <p className="font-serif text-xl font-semibold">Products coming soon</p>
                <p className="max-w-sm text-sm text-leaf-muted">Message or call us to ask what is in stock today.</p>
              </>
            ) : (
              <>
                <p className="font-serif text-xl font-semibold">Nothing matches "{query}"</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('All');
                  }}
                  className="text-sm font-bold text-leaf-action underline underline-offset-4"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <AboutSection store={store} icon={heroIcon} />
      <VisitSection store={store} slug={slug} now={now} preview={preview} />

      <footer className="border-t border-leaf-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-7 text-sm text-leaf-muted @3xl:flex-row @3xl:px-8">
          <p>
            {store.storeName}
            {area ? `, ${area}` : ''}
          </p>
          <Link to="/" className="font-semibold hover:text-leaf-deep">
            Made with Vaani
          </Link>
        </div>
      </footer>

      <CartBar cart={cart} store={store} />
    </div>
  );
}

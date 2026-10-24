import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, MessageCircle } from 'lucide-react';
import { formatPrice, isImageUrl } from '../../lib/format.js';
import { buildProductInquiryUrl } from '../../lib/whatsapp.js';

export function ProductVisual({ product, className = '' }) {
  if (isImageUrl(product.image)) {
    return <img src={product.image} alt="" loading="lazy" className={`size-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`@container grid size-full place-items-center bg-[radial-gradient(circle_at_30%_25%,color-mix(in_oklab,var(--brand)_22%,transparent),transparent_65%),linear-gradient(160deg,color-mix(in_oklab,var(--brand)_14%,var(--surface)),color-mix(in_oklab,var(--brand)_4%,var(--surface)))] ${className}`}
    >
      <span className="text-[clamp(2.75rem,12cqi,4.5rem)] drop-shadow-[0_8px_16px_rgb(0_0_0/0.12)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden>
        {product.image || '🛍️'}
      </span>
    </div>
  );
}

export function ProductCard({ product, store, qty, onAdd, onRemove }) {
  const canWhatsApp = Boolean(store.contact.whatsapp);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductVisual product={product} />
        <span className="absolute left-3 top-3 rounded-full bg-surface/85 px-2.5 py-1 text-[11px] font-semibold text-ink/75 backdrop-blur">
          {product.category}
        </span>
        {canWhatsApp && (
          <a
            href={buildProductInquiryUrl(store, product)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-surface/85 text-ink/70 opacity-100 backdrop-blur transition hover:text-[#1FAF54] @md:opacity-0 @md:group-hover:opacity-100 @md:focus:opacity-100"
            aria-label={`Ask about ${product.name} on WhatsApp`}
            title="Ask on WhatsApp"
          >
            <MessageCircle className="size-4" />
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-[17px] font-bold tracking-tight">{product.price > 0 ? formatPrice(product.price, store.currency) : 'Ask for price'}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            {qty === 0 ? (
              <motion.button
                key="add"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onAdd}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 active:scale-95"
                aria-label={`Add ${product.name} to order`}
              >
                <Plus className="size-4" /> Add
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex h-9 items-center rounded-full bg-brand text-white shadow-soft"
              >
                <button type="button" onClick={onRemove} className="grid size-9 place-items-center rounded-full transition hover:bg-white/15 active:scale-90" aria-label={`Remove one ${product.name}`}>
                  <Minus className="size-4" />
                </button>
                <motion.span key={qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-w-5 text-center text-sm font-bold tabular-nums" aria-live="polite">
                  {qty}
                </motion.span>
                <button type="button" onClick={onAdd} className="grid size-9 place-items-center rounded-full transition hover:bg-white/15 active:scale-90" aria-label={`Add one more ${product.name}`}>
                  <Plus className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

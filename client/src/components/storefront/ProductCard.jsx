import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../lib/format.js';
import { ProductVisual } from '../../lib/icons.jsx';
import { buildProductInquiryUrl } from '../../lib/whatsapp.js';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';

const unitOf = (p) => p.description.match(/Priced per (\w+)/)?.[1];

function Price({ product, currency }) {
  if (!(product.price > 0)) return <span className="font-extrabold">Ask for price</span>;
  const unit = unitOf(product);
  return (
    <span className="font-extrabold tabular-nums">
      {formatPrice(product.price, currency)}
      {unit && <span className="text-xs font-semibold text-leaf-muted">/{unit}</span>}
    </span>
  );
}

/** Round add button that turns into a quantity stepper once something is in the cart. */
export function Stepper({ qty, onAdd, onRemove, name, outline = false }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {qty === 0 ? (
        <motion.button
          key="add"
          type="button"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          onClick={onAdd}
          className={`grid size-11 shrink-0 place-items-center rounded-full transition active:scale-90 ${
            outline ? 'border-[1.5px] border-leaf-deep bg-white text-leaf-deep hover:bg-leaf-deep hover:text-white' : 'bg-leaf-brand text-white hover:brightness-110'
          }`}
          aria-label={`Add ${name}`}
        >
          <Plus className="size-4.5" strokeWidth={2.2} />
        </motion.button>
      ) : (
        <motion.div
          key="stepper"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="flex h-11 shrink-0 items-center rounded-full bg-leaf-brand text-white"
        >
          <button type="button" onClick={onRemove} className="grid size-11 place-items-center rounded-full hover:bg-white/15 active:scale-90" aria-label={`Remove one ${name}`}>
            <Minus className="size-4" strokeWidth={2.2} />
          </button>
          <motion.span key={qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-w-4 text-center font-extrabold tabular-nums" aria-live="polite">
            {qty}
          </motion.span>
          <button type="button" onClick={onAdd} className="grid size-11 place-items-center rounded-full hover:bg-white/15 active:scale-90" aria-label={`Add one more ${name}`}>
            <Plus className="size-4" strokeWidth={2.2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Round tile used in the Bestsellers band. */
export function BestsellerTile({ product, store, cart }) {
  return (
    <div className="flex flex-col rounded-[28px] bg-white p-5 text-center">
      <ProductVisual product={product} className="mx-auto size-28 rounded-full" />
      <p className="mt-4 font-extrabold leading-snug">{product.name}</p>
      <p className="mt-0.5 line-clamp-1 text-[13px] text-leaf-muted">{product.category}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-left">
        <Price product={product} currency={store.currency} />
        <Stepper qty={cart.qty(product.id)} onAdd={() => cart.add(product.id)} onRemove={() => cart.remove(product.id)} name={product.name} />
      </div>
    </div>
  );
}

/** Horizontal card used in the full catalogue. */
export function ProductRow({ product, store, cart }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="group flex items-center gap-4 rounded-[28px] bg-white p-3.5 pr-4"
    >
      <ProductVisual product={product} className="size-20 shrink-0 rounded-[22px] @md:size-24" />
      <div className="min-w-0 flex-1">
        <h3 className="font-extrabold leading-snug">{product.name}</h3>
        {product.description && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-leaf-muted">{product.description}</p>}
        <div className="mt-1.5 flex items-center gap-3">
          <Price product={product} currency={store.currency} />
          {store.contact.whatsapp && (
            <a
              href={buildProductInquiryUrl(store, product)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-leaf-muted underline-offset-2 hover:text-leaf-deep hover:underline"
            >
              <WhatsAppIcon className="size-3.5" /> Ask
            </a>
          )}
        </div>
      </div>
      <Stepper qty={cart.qty(product.id)} onAdd={() => cart.add(product.id)} onRemove={() => cart.remove(product.id)} name={product.name} outline />
    </motion.article>
  );
}

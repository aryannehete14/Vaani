import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Trash2, Phone, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../lib/format.js';
import { buildOrderUrl } from '../../lib/whatsapp.js';
import { ProductIcon, ProductVisual } from '../../lib/icons.jsx';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';

export function CartBar({ cart, store }) {
  const [open, setOpen] = useState(false);
  const canWhatsApp = Boolean(store.contact.whatsapp);
  const phoneHref = store.contact.phone ? `tel:${store.contact.phone.replace(/[^\d+]/g, '')}` : null;

  return (
    <div className="pointer-events-none sticky bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] @md:px-6">
      <AnimatePresence>
        {cart.count > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="pointer-events-auto mx-auto max-w-xl overflow-hidden rounded-[26px] border border-leaf-line bg-white shadow-[0_18px_40px_-16px_rgba(0,0,0,0.35)]"
          >
            <AnimatePresence initial={false}>
              {open && (
                <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="max-h-64 overflow-y-auto border-b border-leaf-line" aria-label="Your order">
                  {cart.lines.map(({ product, qty }) => (
                    <li key={product.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <ProductVisual product={product} className="size-9 shrink-0 rounded-xl" />
                      <span className="min-w-0 flex-1 truncate font-bold">{product.name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-leaf-tile p-0.5">
                        <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white" onClick={() => cart.remove(product.id)} aria-label={`Remove one ${product.name}`}>
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-5 text-center font-extrabold tabular-nums">{qty}</span>
                        <button type="button" className="grid size-8 place-items-center rounded-full hover:bg-white" onClick={() => cart.add(product.id)} aria-label={`Add one ${product.name}`}>
                          <Plus className="size-3.5" />
                        </button>
                      </span>
                      <span className="w-20 text-right font-extrabold tabular-nums">{formatPrice(product.price * qty, store.currency)}</span>
                    </li>
                  ))}
                  <li className="flex justify-end px-4 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        cart.clear();
                        setOpen(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-leaf-muted hover:text-leaf-action"
                    >
                      <Trash2 className="size-3.5" /> Clear order
                    </button>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 p-2.5 pl-3.5">
              <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-leaf-tile text-leaf-deep">
                  <ProductIcon name="basket" className="size-5" strokeWidth={1.7} />
                  <motion.span key={cart.count} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-leaf-action px-1 text-[11px] font-extrabold text-white">
                    {cart.count}
                  </motion.span>
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-xs font-semibold text-leaf-muted">
                    {cart.count} {cart.count === 1 ? 'item' : 'items'}
                    <span className="hidden @md:inline">, tap to review</span>
                  </span>
                  <span className="block text-lg font-extrabold tabular-nums">{formatPrice(cart.total, store.currency)}</span>
                </span>
                <ChevronUp className={`ml-auto size-4 shrink-0 text-leaf-muted transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {canWhatsApp ? (
                <a
                  href={buildOrderUrl(store, cart.lines)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-leaf-action px-5 font-extrabold text-white transition hover:brightness-110 active:scale-[0.97]"
                >
                  <WhatsAppIcon className="size-5" />
                  Send order
                </a>
              ) : phoneHref ? (
                <a href={phoneHref} className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-leaf-action px-5 font-extrabold text-white">
                  <Phone className="size-4.5" /> Call to order
                </a>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

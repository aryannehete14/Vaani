import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/primitives.jsx';
import { isImageUrl } from '../../lib/format.js';

const CURRENCY_SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const newId = () => `p_new-${Math.random().toString(36).slice(2, 8)}`;

export function ProductsEditor({ store, onChange, compact = false }) {
  const products = store.products;
  const setProducts = (next) => onChange({ ...store, products: next });
  const update = (id, patch) => setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id) => setProducts(products.filter((p) => p.id !== id));
  const add = () =>
    setProducts([...products, { id: newId(), name: '', price: 0, category: products.at(-1)?.category ?? 'Featured', description: '', image: '🛍️' }]);
  const symbol = CURRENCY_SYMBOL[store.currency] ?? '₹';

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="group rounded-2xl border border-line bg-canvas/60 p-3 transition focus-within:border-brand/50 focus-within:bg-surface hover:border-ink/15">
              <div className="flex items-center gap-2.5">
                <label className="relative grid size-11 shrink-0 cursor-text place-items-center overflow-hidden rounded-xl bg-brand/10 text-2xl" title="Emoji or https image URL">
                  {isImageUrl(p.image) ? <img src={p.image} alt="" className="size-full object-cover" /> : <span aria-hidden>{p.image || '🛍️'}</span>}
                  <input
                    className="absolute inset-0 w-full cursor-text bg-transparent text-center text-transparent caret-ink opacity-0 focus:bg-surface focus:text-sm focus:text-ink focus:opacity-100 focus:outline-none"
                    value={p.image}
                    onChange={(e) => update(p.id, { image: e.target.value })}
                    aria-label={`Emoji or image URL for product ${i + 1}`}
                  />
                </label>
                <input
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 font-semibold placeholder:text-muted focus:bg-sunken focus:outline-none"
                  value={p.name}
                  placeholder="Product name"
                  maxLength={80}
                  onChange={(e) => update(p.id, { name: e.target.value })}
                  aria-label={`Name of product ${i + 1}`}
                />
                <div className="flex w-28 shrink-0 items-center rounded-lg bg-sunken/70 px-2 focus-within:ring-2 focus-within:ring-brand/30">
                  <span className="text-sm font-semibold text-muted">{symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    className="w-full bg-transparent px-1 py-1.5 text-right font-semibold tabular-nums focus:outline-none"
                    value={p.price}
                    onChange={(e) => update(p.id, { price: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })}
                    aria-label={`Price of ${p.name || `product ${i + 1}`}`}
                  />
                </div>
                <button type="button" onClick={() => remove(p.id)} className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-600" aria-label={`Delete ${p.name || 'product'}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
              {!compact && (
                <div className="mt-2 grid gap-2 pl-[3.375rem] sm:grid-cols-[10rem_1fr]">
                  <input
                    className="rounded-lg bg-sunken/70 px-2.5 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                    value={p.category}
                    placeholder="Category"
                    maxLength={40}
                    onChange={(e) => update(p.id, { category: e.target.value })}
                    aria-label={`Category of ${p.name || 'product'}`}
                  />
                  <input
                    className="rounded-lg bg-sunken/70 px-2.5 py-1.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                    value={p.description}
                    placeholder="Short description"
                    maxLength={240}
                    onChange={(e) => update(p.id, { description: e.target.value })}
                    aria-label={`Description of ${p.name || 'product'}`}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {products.length === 0 && <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">No products yet. Add one below or by voice.</p>}
      <Button variant="secondary" size="sm" onClick={add} className="w-full border-dashed">
        <Plus className="size-4" /> Add product
      </Button>
    </div>
  );
}

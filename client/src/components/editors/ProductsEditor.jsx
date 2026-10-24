import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { ICON_KEYS, ProductIcon, isImageUrl } from '../../lib/icons.jsx';
import { ImageUpload } from './ImageUpload.jsx';

const CURRENCY_SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

const newId = () => `p_new-${Math.random().toString(36).slice(2, 8)}`;

function IconPicker({ value, onPick }) {
  const [url, setUrl] = useState(isImageUrl(value) ? value : '');
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-3 rounded-md border-2 border-ink bg-white p-3">
        <div className="mb-4 flex flex-wrap items-center gap-3 border-b-2 border-dashed border-rule pb-4">
          {isImageUrl(value) && <img src={value} alt="" className="size-14 rounded-md border-2 border-ink object-cover" />}
          <ImageUpload onUploaded={onPick} label={isImageUrl(value) ? 'Upload a different photo' : 'Upload a photo'} />
          <span className="text-xs text-muted">From your phone or computer. We shrink it so your shop stays fast.</span>
        </div>
        <p className="sign-label mb-2">Or pick an icon</p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Product icon">
          {ICON_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={value === key}
              aria-label={key}
              title={key}
              onClick={() => onPick(key)}
              className={`grid size-11 place-items-center rounded-md border-2 transition ${value === key ? 'border-ink bg-sign' : 'border-transparent hover:border-rule hover:bg-paper'}`}
            >
              <ProductIcon name={key} className="size-5" strokeWidth={1.7} />
            </button>
          ))}
        </div>
        <label className="mt-3 block text-[13px] font-bold">
          Or paste a photo link
          <span className="mt-1.5 flex gap-2">
            <input className="sign-input h-10 py-0 text-sm" type="url" value={url} placeholder="https://..." onChange={(e) => setUrl(e.target.value)} />
            <button type="button" disabled={!isImageUrl(url)} onClick={() => onPick(url)} className="h-10 shrink-0 rounded-md border-2 border-ink bg-sign px-3 text-sm font-extrabold disabled:opacity-40">
              Use photo
            </button>
          </span>
        </label>
      </div>
    </motion.div>
  );
}

export function ProductsEditor({ store, onChange, compact = false }) {
  const [picking, setPicking] = useState(null);
  const products = store.products;
  const setProducts = (next) => onChange({ ...store, products: next });
  const update = (id, patch) => setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id) => setProducts(products.filter((p) => p.id !== id));
  const add = () => setProducts([...products, { id: newId(), name: '', price: 0, category: products.at(-1)?.category ?? 'Featured', description: '', image: 'package' }]);
  const symbol = CURRENCY_SYMBOL[store.currency] ?? '₹';

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {products.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="rounded-md border-2 border-ink bg-white p-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPicking((cur) => (cur === p.id ? null : p.id))}
                  className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border-2 transition ${picking === p.id ? 'border-ink bg-sign' : 'border-rule bg-paper hover:border-ink'}`}
                  aria-label={`Change picture for ${p.name || `product ${i + 1}`}`}
                  aria-expanded={picking === p.id}
                >
                  {isImageUrl(p.image) ? <img src={p.image} alt="" className="size-full object-cover" /> : <ProductIcon name={p.image} className="size-6" strokeWidth={1.6} />}
                </button>
                <input
                  className="min-w-0 flex-1 rounded-md bg-transparent px-2 py-2 text-[16px] font-bold placeholder:text-muted focus:bg-paper focus:outline-none"
                  value={p.name}
                  placeholder="Product name"
                  maxLength={80}
                  onChange={(e) => update(p.id, { name: e.target.value })}
                  aria-label={`Name of product ${i + 1}`}
                />
                <label className="flex h-10 w-24 shrink-0 items-center rounded-md border-2 border-ink bg-white px-2 focus-within:ring-4 focus-within:ring-sign/60">
                  <span className="text-sm font-bold text-muted">{symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    className="w-full bg-transparent px-1 text-right font-extrabold tabular-nums focus:outline-none"
                    value={p.price}
                    onChange={(e) => update(p.id, { price: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })}
                    aria-label={`Price of ${p.name || `product ${i + 1}`}`}
                  />
                </label>
                <button type="button" onClick={() => remove(p.id)} className="grid size-10 shrink-0 place-items-center rounded-md text-muted transition hover:bg-brick/10 hover:text-brick" aria-label={`Delete ${p.name || 'product'}`}>
                  <Trash2 className="size-4.5" />
                </button>
              </div>
              {!compact && (
                <div className="mt-2 grid gap-2 sm:grid-cols-[10rem_1fr] sm:pl-[3.375rem]">
                  <input className="sign-input h-10 py-0 text-sm" value={p.category} placeholder="Category" maxLength={40} onChange={(e) => update(p.id, { category: e.target.value })} aria-label={`Category of ${p.name || 'product'}`} />
                  <input className="sign-input h-10 py-0 text-sm" value={p.description} placeholder="Short description" maxLength={240} onChange={(e) => update(p.id, { description: e.target.value })} aria-label={`Description of ${p.name || 'product'}`} />
                </div>
              )}
              <AnimatePresence>
                {picking === p.id && (
                  <IconPicker
                    value={p.image}
                    onPick={(image) => {
                      update(p.id, { image });
                      setPicking(null);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {products.length === 0 && <p className="rounded-md border-2 border-dashed border-ink/40 px-4 py-6 text-center text-sm text-muted">No products yet. Add one below or by voice.</p>}
      <button type="button" onClick={add} className="flex h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink font-extrabold transition hover:bg-white">
        <Plus className="size-4.5" strokeWidth={2.4} /> Add a product
      </button>
    </div>
  );
}

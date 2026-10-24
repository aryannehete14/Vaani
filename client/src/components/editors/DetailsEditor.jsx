import { Check } from 'lucide-react';
import { Field } from '../ui/primitives.jsx';
import { BRAND_SWATCHES, CATEGORY_OPTIONS, DAY_PRESETS } from '../../lib/constants.js';

/** Controlled editor for everything except products. `sections` picks which groups to show. */
export function DetailsEditor({ store, onChange, sections = ['basics', 'hours', 'contact'] }) {
  const set = (patch) => onChange({ ...store, ...patch });
  const setContact = (patch) => onChange({ ...store, contact: { ...store.contact, ...patch } });
  const setHours = (patch) => onChange({ ...store, hours: { ...store.hours, ...patch } });
  const categories = CATEGORY_OPTIONS.includes(store.category) ? CATEGORY_OPTIONS : [store.category, ...CATEGORY_OPTIONS];
  const dayOptions = DAY_PRESETS.includes(store.hours.days) ? DAY_PRESETS : [store.hours.days, ...DAY_PRESETS];

  return (
    <div className="space-y-6">
      {sections.includes('basics') && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Basics</legend>
          <Field label="Shop name" className="sm:col-span-2">
            {(id) => <input id={id} className="field" value={store.storeName} maxLength={80} onChange={(e) => set({ storeName: e.target.value })} />}
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            {(id) => <input id={id} className="field" value={store.tagline} maxLength={120} onChange={(e) => set({ tagline: e.target.value })} />}
          </Field>
          <Field label="Type of shop">
            {(id) => (
              <select id={id} className="field" value={store.category} onChange={(e) => set({ category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink/80" id="brand-colour-label">
              Brand colour
            </span>
            <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-labelledby="brand-colour-label">
              {BRAND_SWATCHES.map((c) => {
                const active = c.toLowerCase() === store.primaryColor.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={c}
                    onClick={() => set({ primaryColor: c })}
                    className={`grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-surface transition hover:scale-110 ${active ? 'ring-2 ring-ink' : ''}`}
                    style={{ background: c }}
                  >
                    {active && <Check className="size-3.5 text-white" />}
                  </button>
                );
              })}
              <label className="relative grid size-7 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-ink/30 text-xs text-muted" title="Custom colour">
                +
                <input type="color" className="absolute inset-0 cursor-pointer opacity-0" value={store.primaryColor} onChange={(e) => set({ primaryColor: e.target.value.toUpperCase() })} aria-label="Custom brand colour" />
              </label>
            </div>
          </div>
        </fieldset>
      )}

      {sections.includes('hours') && (
        <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Opening hours</legend>
          <Field label="Opens">
            {(id) => <input id={id} type="time" className="field" value={store.hours.open} onChange={(e) => setHours({ open: e.target.value })} />}
          </Field>
          <Field label="Closes">
            {(id) => <input id={id} type="time" className="field" value={store.hours.close} onChange={(e) => setHours({ close: e.target.value })} />}
          </Field>
          <Field label="Days" className="col-span-2 sm:col-span-1">
            {(id) => (
              <select id={id} className="field" value={store.hours.days} onChange={(e) => setHours({ days: e.target.value })}>
                {dayOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            )}
          </Field>
        </fieldset>
      )}

      {sections.includes('contact') && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Contact & location</legend>
          <Field label="Phone">
            {(id) => <input id={id} type="tel" className="field" value={store.contact.phone} placeholder="+91 98765 43210" onChange={(e) => setContact({ phone: e.target.value })} />}
          </Field>
          <Field label="WhatsApp number" hint="With country code, e.g. 919876543210">
            {(id) => (
              <input
                id={id}
                inputMode="numeric"
                className="field"
                value={store.contact.whatsapp}
                placeholder="919876543210"
                onChange={(e) => setContact({ whatsapp: e.target.value.replace(/\D/g, '').slice(0, 15) })}
              />
            )}
          </Field>
          <Field label="Email">
            {(id) => <input id={id} type="email" className="field" value={store.contact.email} placeholder="hello@yourshop.in" onChange={(e) => setContact({ email: e.target.value })} />}
          </Field>
          <Field label="Instagram">
            {(id) => (
              <input
                id={id}
                className="field"
                value={store.social?.instagram ?? ''}
                placeholder="yourshop"
                onChange={(e) => set({ social: { ...store.social, instagram: e.target.value.replace(/^@/, '') } })}
              />
            )}
          </Field>
          <Field label="Address" className="sm:col-span-2" hint="Shown on the map and used for directions.">
            {(id) => <input id={id} className="field" value={store.contact.address} placeholder="Shop 4, MG Road, Pune" onChange={(e) => setContact({ address: e.target.value })} />}
          </Field>
        </fieldset>
      )}
    </div>
  );
}

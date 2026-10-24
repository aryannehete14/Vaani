import { Field } from '../ui/primitives.jsx';
import { ThemePicker } from './ThemePicker.jsx';
import { ImageUpload } from './ImageUpload.jsx';
import { initials } from '../../lib/format.js';
import { CATEGORY_OPTIONS, DAY_PRESETS } from '../../lib/constants.js';

/** Controlled editor for everything except products. `sections` picks which groups to show. */
export function DetailsEditor({ store, onChange, sections = ['basics', 'theme', 'hours', 'contact'] }) {
  const set = (patch) => onChange({ ...store, ...patch });
  const setContact = (patch) => onChange({ ...store, contact: { ...store.contact, ...patch } });
  const setHours = (patch) => onChange({ ...store, hours: { ...store.hours, ...patch } });
  const categories = CATEGORY_OPTIONS.includes(store.category) ? CATEGORY_OPTIONS : [store.category, ...CATEGORY_OPTIONS];
  const dayOptions = DAY_PRESETS.includes(store.hours.days) ? DAY_PRESETS : [store.hours.days, ...DAY_PRESETS];

  return (
    <div className="space-y-7">
      {sections.includes('basics') && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sign-label mb-3">Shop details</legend>
          <Field label="Shop name" className="sm:col-span-2">
            {(id) => <input id={id} className="sign-input text-[17px] font-bold" value={store.storeName} maxLength={80} onChange={(e) => set({ storeName: e.target.value })} />}
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            {(id) => <input id={id} className="sign-input" value={store.tagline} maxLength={120} onChange={(e) => set({ tagline: e.target.value })} />}
          </Field>
          <Field label="Type of shop">
            {(id) => (
              <select id={id} className="sign-input" value={store.category} onChange={(e) => set({ category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-bold">Logo</span>
            <div className="flex flex-wrap items-center gap-4">
              {store.logo ? (
                <img src={store.logo} alt={`${store.storeName} logo`} className="size-16 rounded-full border-2 border-ink bg-white object-contain" />
              ) : (
                <span className="grid size-16 place-items-center rounded-full border-2 border-dashed border-ink/50 font-serif text-lg font-bold text-muted" aria-hidden>
                  {initials(store.storeName)}
                </span>
              )}
              <ImageUpload onUploaded={(logo) => set({ logo })} label={store.logo ? 'Change logo' : 'Upload a logo'} maxSide={400} keepAlpha />
              {store.logo && (
                <button type="button" onClick={() => set({ logo: '' })} className="text-sm font-bold text-muted underline underline-offset-4 hover:text-brick">
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Optional. Without a logo, your shop shows its initials.</p>
          </div>
          <Field label="About the shop" hint="Optional. Shown in an About section on your store." className="sm:col-span-2">
            {(id) => (
              <textarea
                id={id}
                className="sign-input min-h-20 resize-y"
                value={store.about ?? ''}
                maxLength={600}
                placeholder="How long you have been open, who runs the counter, what customers come back for."
                onChange={(e) => set({ about: e.target.value })}
              />
            )}
          </Field>
        </fieldset>
      )}

      {sections.includes('theme') && (
        <fieldset>
          <legend className="sign-label mb-3">Store colours</legend>
          <ThemePicker value={store.theme} onChange={(theme) => set({ theme })} />
        </fieldset>
      )}

      {sections.includes('hours') && (
        <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <legend className="sign-label mb-3">Timings</legend>
          <Field label="Opens">
            {(id) => <input id={id} type="time" className="sign-input" value={store.hours.open} onChange={(e) => setHours({ open: e.target.value })} />}
          </Field>
          <Field label="Closes">
            {(id) => <input id={id} type="time" className="sign-input" value={store.hours.close} onChange={(e) => setHours({ close: e.target.value })} />}
          </Field>
          <Field label="Days" className="col-span-2 sm:col-span-1">
            {(id) => (
              <select id={id} className="sign-input" value={store.hours.days} onChange={(e) => setHours({ days: e.target.value })}>
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
          <legend className="sign-label mb-3">Contact and location</legend>
          <Field label="Phone">
            {(id) => <input id={id} type="tel" className="sign-input" value={store.contact.phone} placeholder="+91 98765 43210" onChange={(e) => setContact({ phone: e.target.value })} />}
          </Field>
          <Field label="WhatsApp number" hint="With country code, like 919876543210">
            {(id) => (
              <input
                id={id}
                inputMode="numeric"
                className="sign-input"
                value={store.contact.whatsapp}
                placeholder="919876543210"
                onChange={(e) => setContact({ whatsapp: e.target.value.replace(/\D/g, '').slice(0, 15) })}
              />
            )}
          </Field>
          <Field label="Email">
            {(id) => <input id={id} type="email" className="sign-input" value={store.contact.email} placeholder="hello@yourshop.in" onChange={(e) => setContact({ email: e.target.value })} />}
          </Field>
          <Field label="Instagram">
            {(id) => (
              <input id={id} className="sign-input" value={store.social?.instagram ?? ''} placeholder="yourshop" onChange={(e) => set({ social: { ...store.social, instagram: e.target.value.replace(/^@/, '') } })} />
            )}
          </Field>
          <Field label="Address" className="sm:col-span-2" hint="Shown on the map and used for directions.">
            {(id) => <input id={id} className="sign-input" value={store.contact.address} placeholder="Shop 4, MG Road, Pune" onChange={(e) => setContact({ address: e.target.value })} />}
          </Field>
        </fieldset>
      )}
    </div>
  );
}

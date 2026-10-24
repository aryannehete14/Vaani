import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, MapPin, Phone, Mail, AtSign, Navigation, Send, CheckCircle2, MessageSquareText } from 'lucide-react';
import { weekSchedule } from '../../lib/hours.js';
import { waLink } from '../../lib/whatsapp.js';
import { api } from '../../lib/api.js';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';

function InfoCard({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-5 shadow-soft @md:p-6 ${className}`}>
      <h3 className="mb-4 flex items-center gap-2.5 font-display text-lg font-semibold">
        <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand-fg">
          <Icon className="size-4.5" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function HoursCard({ hours, now }) {
  return (
    <InfoCard icon={Clock} title="Opening hours">
      <ul className="space-y-1">
        {weekSchedule(hours, now).map((d) => (
          <li
            key={d.name}
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${d.isToday ? 'bg-brand/10 font-semibold text-ink' : 'text-ink/75'}`}
          >
            <span className="flex items-center gap-2">
              {d.name}
              {d.isToday && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Today</span>}
            </span>
            <span className={`tabular-nums ${d.isOpen ? '' : 'text-muted'}`}>{d.range}</span>
          </li>
        ))}
      </ul>
    </InfoCard>
  );
}

function ContactRow({ href, icon: Icon, label, value, external }) {
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-sunken"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-ink/70 transition group-hover:text-brand-fg">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted">{label}</span>
        <span className="block truncate text-[15px] font-semibold">{value}</span>
      </span>
    </a>
  );
}

function ContactCard({ store }) {
  const { phone, whatsapp, email, address } = store.contact;
  const insta = store.social?.instagram;
  return (
    <InfoCard icon={Phone} title="Get in touch">
      <div className="space-y-1">
        {phone && <ContactRow href={`tel:${phone.replace(/[^\d+]/g, '')}`} icon={Phone} label="Call us" value={phone} />}
        {whatsapp && <ContactRow href={waLink(whatsapp, `Hi ${store.storeName}!`)} icon={WhatsAppIcon} label="WhatsApp" value="Chat with us" external />}
        {email && <ContactRow href={`mailto:${email}`} icon={Mail} label="Email" value={email} />}
        {insta && <ContactRow href={`https://instagram.com/${insta}`} icon={AtSign} label="Instagram" value={`@${insta}`} external />}
        {address && (
          <ContactRow href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} icon={Navigation} label="Directions" value={address} external />
        )}
        {!phone && !whatsapp && !email && !address && <p className="text-sm text-muted">Contact details coming soon.</p>}
      </div>
    </InfoCard>
  );
}

function MapCard({ store }) {
  const q = encodeURIComponent(`${store.storeName}, ${store.contact.address}`);
  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-3 p-5 pb-4 @md:px-6">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-brand/12 text-brand-fg">
            <MapPin className="size-4.5" />
          </span>
          Find us
        </h3>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.contact.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-3 py-1.5 text-xs font-semibold transition hover:bg-ink/10"
        >
          <Navigation className="size-3.5" /> Directions
        </a>
      </div>
      <p className="-mt-2 px-5 pb-4 text-sm text-muted @md:px-6">{store.contact.address}</p>
      <iframe
        title={`Map showing ${store.storeName}`}
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0 grayscale-[0.2] @lg:h-72"
      />
    </section>
  );
}

function InquiryForm({ store, slug, preview }) {
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [state, setState] = useState({ status: 'idle', error: null });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'sending', error: null });
    try {
      if (preview) await new Promise((r) => setTimeout(r, 500));
      else await api.sendInquiry(slug, form);
      setState({ status: 'sent', error: null });
      setForm({ name: '', contact: '', message: '' });
    } catch (err) {
      setState({ status: 'idle', error: err.message });
    }
  };

  return (
    <InfoCard icon={MessageSquareText} title="Send us a message" className="@lg:col-span-2">
      <AnimatePresence mode="wait">
        {state.status === 'sent' ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-8 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <CheckCircle2 className="size-12 text-emerald-500" />
            </motion.span>
            <p className="font-display text-xl font-semibold">Message sent!</p>
            <p className="text-sm text-muted">{store.storeName} will get back to you soon.</p>
            <button type="button" onClick={() => setState({ status: 'idle', error: null })} className="mt-2 text-sm font-semibold text-brand-fg hover:underline">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="grid gap-3 @md:grid-cols-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">Your name</span>
              <input className="field" value={form.name} onChange={set('name')} required maxLength={80} autoComplete="name" placeholder="Rahul" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">Phone or email</span>
              <input className="field" value={form.contact} onChange={set('contact')} required minLength={5} maxLength={120} autoComplete="tel" placeholder="98765 00000" />
            </label>
            <label className="block @md:col-span-2">
              <span className="mb-1.5 block text-[13px] font-semibold text-ink/80">Message</span>
              <textarea className="field min-h-24 resize-y" value={form.message} onChange={set('message')} required minLength={2} maxLength={1000} placeholder="Do you take custom cake orders for Saturday?" />
            </label>
            {state.error && (
              <p className="text-sm font-medium text-red-600 @md:col-span-2" role="alert">
                {state.error}
              </p>
            )}
            <div className="flex items-center justify-between gap-3 @md:col-span-2">
              <p className="text-xs text-muted">We only use your details to reply to you.</p>
              <button
                type="submit"
                disabled={state.status === 'sending'}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white shadow-soft transition hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
              >
                <Send className="size-4" /> {state.status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </InfoCard>
  );
}

export function InfoSection({ store, slug, now, preview }) {
  return (
    <section id="visit" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 @md:px-8 @md:py-16" aria-labelledby="visit-title">
      <h2 id="visit-title" className="mb-6 font-display text-3xl font-semibold tracking-tight @md:text-4xl">
        Visit us
      </h2>
      <div className="grid gap-4 @lg:grid-cols-2 @md:gap-5">
        <HoursCard hours={store.hours} now={now} />
        <ContactCard store={store} />
        {store.contact.address && (
          <div className="@lg:col-span-2">
            <MapCard store={store} />
          </div>
        )}
        <InquiryForm store={store} slug={slug} preview={preview} />
      </div>
    </section>
  );
}

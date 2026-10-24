import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, MapPin, Phone, Mail, AtSign, Navigation, Send, CheckCircle2 } from 'lucide-react';
import { weekSchedule } from '../../lib/hours.js';
import { waLink } from '../../lib/whatsapp.js';
import { api } from '../../lib/api.js';
import { ProductIcon } from '../../lib/icons.jsx';
import { WhatsAppIcon } from './WhatsAppIcon.jsx';

export function AboutSection({ store, icon }) {
  if (!store.about) return null;
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14 @3xl:px-8">
      <div className="flex flex-col overflow-hidden rounded-[32px] bg-leaf-panel @3xl:flex-row @3xl:rounded-[40px]">
        <div className="flex-1 p-7 @3xl:p-12">
          <h2 className="font-serif text-[30px] font-semibold leading-tight @3xl:text-[38px]">About {store.storeName}</h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-leaf-deep/85">{store.about}</p>
        </div>
        <div className="flex min-h-48 items-center justify-center gap-4 rounded-tl-[120px] bg-white/45 p-8 @3xl:w-[38%] @3xl:rounded-tl-[160px]" aria-hidden="true">
          <span className="grid h-40 w-32 place-items-center rounded-full bg-leaf-ground text-leaf-brand">
            <ProductIcon name={icon} className="size-14" strokeWidth={1} />
          </span>
          <span className="grid size-28 place-items-center rounded-full bg-white text-leaf-brand">
            <ProductIcon name="leaf" className="size-10" strokeWidth={1.1} />
          </span>
        </div>
      </div>
    </section>
  );
}

function Row({ href, icon: Icon, children, external }) {
  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="flex items-center gap-3 rounded-2xl px-2 py-2 text-[15px] transition hover:bg-leaf-ground"
    >
      <Icon className="size-5 shrink-0 text-leaf-brand" strokeWidth={1.8} />
      <span className="min-w-0 truncate">{children}</span>
    </a>
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

  const input =
    'mt-1.5 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-leaf text-[15px] text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-4 focus:ring-white/10';

  return (
    <div className="flex-1 rounded-[32px] bg-leaf-deep p-7 text-white @3xl:p-9">
      <h2 className="font-serif text-[28px] font-semibold">Ask us anything</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-white/75">Need something that is not listed? Leave a message and {store.storeName} will get back to you.</p>
      <AnimatePresence mode="wait">
        {state.status === 'sent' ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 flex flex-col items-center gap-2 rounded-3xl bg-white/10 py-10 text-center">
            <CheckCircle2 className="size-11" strokeWidth={1.5} />
            <p className="font-serif text-xl font-semibold">Message sent</p>
            <p className="text-sm text-white/75">We will reply as soon as we can.</p>
            <button type="button" onClick={() => setState({ status: 'idle', error: null })} className="mt-2 text-sm font-bold underline underline-offset-4">
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} className="mt-6 grid gap-3.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid gap-3.5 @xl:grid-cols-2">
              <label className="block text-[13px] font-bold">
                Your name
                <input className={input} value={form.name} onChange={set('name')} required maxLength={80} autoComplete="name" placeholder="Rahul" />
              </label>
              <label className="block text-[13px] font-bold">
                Phone or email
                <input className={input} value={form.contact} onChange={set('contact')} required minLength={5} maxLength={120} autoComplete="tel" placeholder="98765 00000" />
              </label>
            </div>
            <label className="block text-[13px] font-bold">
              Message
              <textarea className={`${input} min-h-24 resize-y`} value={form.message} onChange={set('message')} required minLength={2} maxLength={1000} placeholder="Do you take orders for Saturday?" />
            </label>
            {state.error && (
              <p className="text-sm font-bold text-[#FFC9B8]" role="alert">
                {state.error}
              </p>
            )}
            <button
              type="submit"
              disabled={state.status === 'sending'}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-leaf-action font-extrabold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              <Send className="size-4.5" /> {state.status === 'sending' ? 'Sending...' : 'Send message'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VisitSection({ store, slug, now, preview }) {
  const { phone, whatsapp, email, address } = store.contact;
  const insta = store.social?.instagram;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section id="visit" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14 @3xl:px-8" aria-labelledby="visit-title">
      <div className="flex flex-col gap-5 @4xl:flex-row">
        <div className="flex-1 rounded-[32px] bg-white p-7 @3xl:p-9">
          <h2 id="visit-title" className="font-serif text-[28px] font-semibold">
            Visit us
          </h2>
          <div className="mt-4 space-y-0.5">
            {address && (
              <Row href={directions} icon={MapPin} external>
                {address}
              </Row>
            )}
            {phone && (
              <Row href={`tel:${phone.replace(/[^\d+]/g, '')}`} icon={Phone}>
                {phone}
              </Row>
            )}
            {whatsapp && (
              <Row href={waLink(whatsapp, `Hi ${store.storeName}!`)} icon={WhatsAppIcon} external>
                Chat on WhatsApp
              </Row>
            )}
            {email && (
              <Row href={`mailto:${email}`} icon={Mail}>
                {email}
              </Row>
            )}
            {insta && (
              <Row href={`https://instagram.com/${insta}`} icon={AtSign} external>
                @{insta}
              </Row>
            )}
          </div>

          <h3 className="mt-6 flex items-center gap-2 text-sm font-extrabold">
            <Clock className="size-4.5 text-leaf-brand" strokeWidth={1.8} /> Opening hours
          </h3>
          <ul className="mt-2 grid gap-1 @xl:grid-cols-2 @xl:gap-x-4">
            {weekSchedule(store.hours, now).map((d) => (
              <li key={d.name} className={`flex justify-between rounded-xl px-3 py-1.5 text-sm ${d.isToday ? 'bg-leaf-tile font-extrabold' : ''}`}>
                <span>{d.name}</span>
                <span className={`tabular-nums ${d.isOpen ? '' : 'text-leaf-muted'}`}>{d.range}</span>
              </li>
            ))}
          </ul>

          {address && (
            <div className="mt-6 overflow-hidden rounded-[22px] border border-leaf-line">
              <iframe
                title={`Map showing ${store.storeName}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${store.storeName}, ${address}`)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-56 w-full border-0"
              />
              <a href={directions} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-leaf-tile py-3 text-sm font-extrabold hover:bg-leaf-panel">
                <Navigation className="size-4" /> Get directions
              </a>
            </div>
          )}
        </div>
        <InquiryForm store={store} slug={slug} preview={preview} />
      </div>
    </section>
  );
}

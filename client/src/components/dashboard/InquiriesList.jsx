import { AnimatePresence, motion } from 'framer-motion';
import { Inbox, Check, RotateCcw, Mail, Phone } from 'lucide-react';
import { timeAgo } from '../../lib/format.js';
import { waLink } from '../../lib/whatsapp.js';
import { WhatsAppIcon } from '../storefront/WhatsAppIcon.jsx';

const replyLink = (inquiry, storeName) => {
  const contact = inquiry.contact.trim();
  if (contact.includes('@')) return { href: `mailto:${contact}?subject=${encodeURIComponent(`Re: your message to ${storeName}`)}`, icon: Mail, label: 'Reply by email' };
  const digits = contact.replace(/\D/g, '');
  if (digits.length >= 10) {
    const wa = digits.length === 10 ? `91${digits}` : digits;
    return { href: waLink(wa, `Hi ${inquiry.name}, thanks for contacting ${storeName}! `), icon: WhatsAppIcon, label: 'Reply on WhatsApp', external: true };
  }
  return { href: `tel:${digits}`, icon: Phone, label: 'Call' };
};

export function InquiriesList({ inquiries, storeName, onToggle }) {
  if (!inquiries) return <div className="h-40 animate-pulse rounded-3xl bg-sunken" />;
  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
        <Inbox className="size-10 text-muted" />
        <p className="font-display text-xl font-semibold">No messages yet</p>
        <p className="max-w-sm text-sm text-muted">When customers use the contact form on your storefront, their messages appear here.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {inquiries.map((q) => {
          const reply = replyLink(q, storeName);
          const done = q.status === 'done';
          return (
            <motion.li
              key={q.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border border-line bg-surface p-5 shadow-soft transition ${done ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {!done && <span className="size-2 rounded-full bg-brand" aria-label="New" />}
                    {q.name}
                  </p>
                  <p className="text-sm text-muted">
                    {q.contact} · {timeAgo(q.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <a
                    href={reply.href}
                    {...(reply.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-semibold transition hover:bg-sunken"
                  >
                    <reply.icon className="size-4" /> <span className="hidden sm:inline">{reply.label}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onToggle(q)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition ${done ? 'border border-line hover:bg-sunken' : 'bg-ink text-canvas hover:bg-ink/90'}`}
                  >
                    {done ? <RotateCcw className="size-4" /> : <Check className="size-4" />}
                    {done ? 'Reopen' : 'Mark done'}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{q.message}</p>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

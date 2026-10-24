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
  if (!inquiries) return <div className="h-40 animate-pulse rounded-lg border-[3px] border-ink/20 bg-card" />;
  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border-[3px] border-dashed border-ink/40 px-6 py-16 text-center">
        <Inbox className="size-10" strokeWidth={1.6} />
        <p className="sign-type text-[30px]">No messages yet</p>
        <p className="max-w-sm text-sm text-muted">When customers use the contact form on your shop, their messages show up here.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      <AnimatePresence initial={false}>
        {inquiries.map((q) => {
          const reply = replyLink(q, storeName);
          const done = q.status === 'done';
          return (
            <motion.li key={q.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`sign-card p-5 transition ${done ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-lg font-extrabold">
                    {!done && <span className="rounded-[3px] border-2 border-ink bg-sign px-1.5 text-[10px] font-extrabold tracking-[0.12em]">NEW</span>}
                    {q.name}
                  </p>
                  <p className="text-sm text-muted">
                    {q.contact}, {timeAgo(q.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={reply.href}
                    {...(reply.external && { target: '_blank', rel: 'noopener noreferrer' })}
                    className="inline-flex h-10 items-center gap-1.5 rounded-md border-2 border-ink bg-white px-3 text-sm font-extrabold hover:bg-paper"
                  >
                    <reply.icon className="size-4" /> <span className="hidden sm:inline">{reply.label}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onToggle(q)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-md border-2 border-ink px-3 text-sm font-extrabold ${done ? 'bg-white hover:bg-paper' : 'bg-board text-card'}`}
                  >
                    {done ? <RotateCcw className="size-4" /> : <Check className="size-4" strokeWidth={3} />}
                    {done ? 'Reopen' : 'Mark done'}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[16px] leading-relaxed">{q.message}</p>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

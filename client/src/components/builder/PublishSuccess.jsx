import { motion } from 'framer-motion';
import { ExternalLink, LayoutDashboard, KeyRound, PartyPopper, Plus } from 'lucide-react';
import { ButtonLink, CopyButton, Button } from '../ui/primitives.jsx';
import { WhatsAppIcon } from '../storefront/WhatsAppIcon.jsx';
import { shareLink } from '../../lib/whatsapp.js';

const CONFETTI = ['🎉', '✨', '🛍️', '🎊', '⭐', '💫', '🥳', '🌟'];

export function PublishSuccess({ published, onNew }) {
  const url = `${window.location.origin}/s/${published.slug}`;
  const { store } = published;

  return (
    <div className="brand-scope relative mx-auto max-w-xl" style={{ '--brand': store.primaryColor }}>
      <div className="pointer-events-none absolute inset-x-0 -top-6 flex justify-center" aria-hidden>
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{ x: 0, y: 40, opacity: 0, scale: 0.4 }}
            animate={{ x: (i - CONFETTI.length / 2) * 46, y: [-10, -70 - (i % 3) * 30, 20], opacity: [0, 1, 0], scale: 1, rotate: (i % 2 ? 1 : -1) * 40 }}
            transition={{ duration: 1.6, delay: 0.1 + i * 0.04, ease: 'easeOut' }}
          >
            {c}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="rounded-[2rem] border border-line bg-surface p-6 text-center shadow-lift sm:p-8"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand text-white shadow-lift">
          <PartyPopper className="size-8" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">Your store is live!</h2>
        <p className="mt-2 text-muted">
          <strong className="text-ink">{store.storeName}</strong> is ready for customers. Share the link on WhatsApp, Instagram, or print it on a QR at your counter.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-canvas p-2 pl-4 text-left">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">{url}</span>
          <CopyButton text={url} label="Copy link" />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ButtonLink to={`/s/${published.slug}`} variant="brand" size="lg">
            <ExternalLink className="size-4.5" /> Open storefront
          </ButtonLink>
          <ButtonLink href={shareLink(`🛍️ ${store.storeName} is now online! Browse and order on WhatsApp: ${url}`)} variant="whatsapp" size="lg">
            <WhatsAppIcon className="size-5" /> Share on WhatsApp
          </ButtonLink>
        </div>

        <div className="mt-6 rounded-2xl bg-sunken/70 p-4 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="size-4 text-brand-fg" /> Your private edit key
          </p>
          <p className="mt-1 text-xs text-muted">This browser remembers it. Save it to edit your store from another phone or computer.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-surface px-3 py-2 font-mono text-xs">{published.editToken}</code>
            <CopyButton text={published.editToken} label="Copy key" />
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink to={`/dashboard/${published.slug}`} variant="secondary">
            <LayoutDashboard className="size-4.5" /> Manage store
          </ButtonLink>
          <Button variant="ghost" onClick={onNew}>
            <Plus className="size-4.5" /> Build another
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

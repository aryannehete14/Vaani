import { motion } from 'framer-motion';
import { ExternalLink, LayoutDashboard, Plus } from 'lucide-react';
import { ButtonLink, CopyButton, Button } from '../ui/primitives.jsx';
import { WhatsAppIcon } from '../storefront/WhatsAppIcon.jsx';
import { CounterCard } from './CounterCard.jsx';
import { shareLink } from '../../lib/whatsapp.js';

export function PublishSuccess({ published, onNew }) {
  const url = `${window.location.origin}/s/${published.slug}`;
  const { store } = published;
  const area = store.contact.address;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hanging signboard */}
      <motion.div
        initial={{ y: -60, rotate: -3, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 160, damping: 12 }}
        className="relative mx-auto flex max-w-3xl flex-col items-center"
        style={{ transformOrigin: 'top center' }}
      >
        <div className="flex gap-[min(300px,40vw)]" aria-hidden>
          <span className="h-9 w-1 bg-ink" />
          <span className="h-9 w-1 bg-ink" />
        </div>
        <div className="w-full rounded-[10px] bg-board p-3 shadow-[10px_10px_0_#1A1A17]">
          <div className="rounded-md border-2 border-sign px-5 py-7 text-center sm:py-8">
            <p className="text-[13px] font-bold tracking-[0.22em] text-[#E9E3D2]">NOW ONLINE</p>
            <p className="sign-type mt-2 text-[clamp(2.75rem,9vw,5.25rem)] text-sign">{store.storeName}</p>
            <p className="mt-3 text-[15px] font-semibold text-[#E9E3D2]">
              {store.category}
              {area ? `, ${area}` : ''}
            </p>
          </div>
        </div>
        <motion.span
          initial={{ rotate: 30, opacity: 0 }}
          animate={{ rotate: 8, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 10 }}
          className="sign-type absolute -right-2 top-24 rounded-md border-[3px] border-ink bg-card px-3.5 py-2 text-[22px] text-[#1F6B3A] sm:right-6"
        >
          Open
        </motion.span>
      </motion.div>

      <div className="mt-12 flex flex-col gap-6 lg:flex-row">
        <section className="sign-card flex flex-1 flex-col gap-4 p-6">
          <h1 className="sign-type text-[42px] text-board">Your shop is live</h1>
          <p className="text-[16px] text-muted">Share this link with customers. Every order comes to your WhatsApp.</p>
          <div className="flex items-center gap-2 rounded-md border-2 border-ink bg-white p-1.5 pl-3.5">
            <span className="min-w-0 flex-1 truncate font-mono text-sm">{url}</span>
            <CopyButton text={url} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink href={shareLink(`${store.storeName} is now online. Browse and order on WhatsApp: ${url}`)} variant="wa">
              <WhatsAppIcon className="size-5" /> Share on WhatsApp
            </ButtonLink>
            <ButtonLink to={`/s/${published.slug}`} variant="paper">
              <ExternalLink className="size-4.5" /> Open my shop
            </ButtonLink>
          </div>

          <div className="mt-1 border-t-2 border-dashed border-rule pt-4">
            <p className="sign-label">Your edit key</p>
            <p className="mt-1 text-sm text-muted">This browser remembers it. Keep a copy to change your shop from another phone.</p>
            <div className="mt-3 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border-2 border-ink bg-paper px-3 py-2.5 font-mono text-[13px]">{published.editToken}</code>
              <CopyButton text={published.editToken} label="Copy key" />
            </div>
          </div>

          <div className="mt-1 flex flex-wrap gap-3">
            <ButtonLink to={`/dashboard/${published.slug}`} variant="board">
              <LayoutDashboard className="size-4.5" /> Manage my shop
            </ButtonLink>
            <Button variant="ghost" onClick={onNew}>
              <Plus className="size-4.5" /> Build another
            </Button>
          </div>
        </section>

        <CounterCard url={url} storeName={store.storeName} className="lg:w-80 lg:-rotate-1" />
      </div>
    </div>
  );
}

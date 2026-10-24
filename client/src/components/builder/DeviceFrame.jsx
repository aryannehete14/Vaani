import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Monitor, Lock } from 'lucide-react';

export function DeviceFrame({ children, url = 'vaani.shop/your-store' }) {
  const [device, setDevice] = useState('phone');

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 inline-flex rounded-full border border-line bg-surface p-1 shadow-soft" role="tablist" aria-label="Preview size">
        {[
          ['phone', Smartphone, 'Phone'],
          ['desktop', Monitor, 'Desktop'],
        ].map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={device === key}
            onClick={() => setDevice(key)}
            className={`relative inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${device === key ? 'text-canvas' : 'text-muted hover:text-ink'}`}
          >
            {device === key && <motion.span layoutId="device-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
        className={
          device === 'phone'
            ? 'relative h-[min(780px,78vh)] w-[min(390px,100%)] rounded-[3rem] border-[10px] border-[#1c1917] bg-[#1c1917] shadow-lift'
            : 'relative h-[min(760px,76vh)] w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lift'
        }
      >
        {device === 'phone' ? (
          <div className="absolute left-1/2 top-2 z-40 h-6 w-24 -translate-x-1/2 rounded-full bg-[#1c1917]" aria-hidden />
        ) : (
          <div className="flex h-10 items-center gap-3 border-b border-line bg-sunken px-4" aria-hidden>
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="mx-auto flex h-6 max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md bg-surface px-3 text-xs text-muted">
              <Lock className="size-3" /> {url}
            </div>
          </div>
        )}
        <div className={`overflow-y-auto overscroll-contain ${device === 'phone' ? 'h-full rounded-[2.4rem] pt-6 bg-canvas' : 'h-[calc(100%-2.5rem)]'}`}>{children}</div>
      </motion.div>
    </div>
  );
}

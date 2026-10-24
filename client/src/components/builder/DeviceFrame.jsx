import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Tag } from '../ui/primitives.jsx';

export function DeviceFrame({ children, url = 'vaani.shop/s/your-shop' }) {
  const [device, setDevice] = useState('phone');

  return (
    <div className="flex flex-col items-center gap-4">
      <Tag tilt="rotate-2">Live preview</Tag>

      <div
        className={
          device === 'phone'
            ? 'relative h-[min(780px,78vh)] w-[min(380px,100%)] overflow-hidden rounded-[44px] border-[10px] border-ink bg-ink shadow-[10px_10px_0_#0F3B2E]'
            : 'relative h-[min(760px,76vh)] w-full overflow-hidden rounded-lg border-[3px] border-ink bg-white shadow-[10px_10px_0_#0F3B2E]'
        }
      >
        {device === 'phone' ? (
          <div className="absolute left-1/2 top-2 z-40 h-6 w-24 -translate-x-1/2 rounded-full bg-ink" aria-hidden />
        ) : (
          <div className="flex h-10 items-center gap-3 border-b-[3px] border-ink bg-paper px-4" aria-hidden>
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full border-2 border-ink bg-brick" />
              <span className="size-3 rounded-full border-2 border-ink bg-sign" />
              <span className="size-3 rounded-full border-2 border-ink bg-board" />
            </div>
            <div className="mx-auto flex h-6 max-w-sm flex-1 items-center justify-center gap-1.5 rounded border-2 border-ink bg-white px-3 font-mono text-xs">
              <Lock className="size-3" /> {url}
            </div>
          </div>
        )}
        <div className={`overflow-y-auto overscroll-contain ${device === 'phone' ? 'h-full rounded-[34px] bg-white pt-6' : 'h-[calc(100%-2.5rem)]'}`}>{children}</div>
      </div>

      <div className="inline-flex overflow-hidden rounded-full border-2 border-ink bg-card" role="group" aria-label="Preview size">
        {[
          ['phone', 'Phone'],
          ['desktop', 'Computer'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={device === key}
            onClick={() => setDevice(key)}
            className={`h-10 px-5 text-sm font-extrabold transition ${device === key ? 'bg-ink text-card' : 'hover:bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { getOpenStatus } from '../../lib/hours.js';

export function StatusBadge({ hours, now, size = 'md', className = '' }) {
  const status = getOpenStatus(hours, now);
  const tone = status.isOpen
    ? status.closingSoon
      ? 'bg-amber-500/12 text-amber-700 ring-amber-600/20 dark:text-amber-300'
      : 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300'
    : 'bg-ink/6 text-ink/70 ring-ink/10';
  const dot = status.isOpen ? (status.closingSoon ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-ink/35';
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-semibold ring-1 ring-inset ${tone} ${pad} ${className}`} aria-live="polite">
      <span className="relative flex size-2">
        {status.isOpen && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dot}`} />}
        <span className={`relative inline-flex size-2 rounded-full ${dot}`} />
      </span>
      {status.label}
      <span className="font-medium opacity-70">· {status.detail}</span>
    </span>
  );
}

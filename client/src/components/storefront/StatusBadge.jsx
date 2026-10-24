import { getOpenStatus } from '../../lib/hours.js';

export function StatusBadge({ hours, now, className = '' }) {
  const status = getOpenStatus(hours, now);
  const tone = status.isOpen
    ? status.closingSoon
      ? 'bg-[#FBEBD0] text-[#7A4A00]'
      : 'bg-[#E5F1E8] text-[#1F6B3A]'
    : 'bg-white/80 text-leaf-deep ring-1 ring-inset ring-leaf-line';
  const dot = status.isOpen ? (status.closingSoon ? 'bg-[#C77800]' : 'bg-[#1F8A4C]') : 'bg-leaf-muted';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${tone} ${className}`} aria-live="polite">
      <span className="relative flex size-2">
        {status.isOpen && <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dot}`} />}
        <span className={`relative inline-flex size-2 rounded-full ${dot}`} />
      </span>
      {status.detail === 'Open 24 hours' ? status.detail : `${status.label}, ${status.detail.charAt(0).toLowerCase()}${status.detail.slice(1)}`}
    </span>
  );
}

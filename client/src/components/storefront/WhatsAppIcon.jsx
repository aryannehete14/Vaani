// Outline chat bubble used for every WhatsApp action (no filled brand glyphs).
export function WhatsAppIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" />
    </svg>
  );
}

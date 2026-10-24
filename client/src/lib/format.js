const LOCALES = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' };

export function formatPrice(amount, currency = 'INR') {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat(LOCALES[currency] ?? 'en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function initials(name = '') {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? 'S').toUpperCase() + (words[1]?.[0] ?? '').toUpperCase();
}

export function timeAgo(iso, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export const isImageUrl = (s) => /^https:\/\/\S+$/i.test(String(s ?? ''));

/** "Menu" for food businesses, "Products" for everyone else. */
export function catalogNoun(category = '') {
  return /bakery|cafe|restaurant|sweet/i.test(category) ? 'Menu' : 'Products';
}

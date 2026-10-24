import { formatPrice } from './format.js';

export const waLink = (number, text) =>
  `https://wa.me/${String(number ?? '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const shareLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

/**
 * @param {object} store
 * @param {{ product: object, qty: number }[]} lines
 */
export function buildOrderMessage(store, lines) {
  const cur = store.currency;
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const items = lines.map((l) => `• ${l.qty} × ${l.product.name}: ${formatPrice(l.product.price * l.qty, cur)}`);
  return [
    `Hi ${store.storeName}, I'd like to order:`,
    '',
    ...items,
    '',
    `*Total: ${formatPrice(total, cur)}*`,
    '',
    'Name: ',
    'Pickup or delivery: ',
    '',
    '(Sent from your Vaani shop page)',
  ].join('\n');
}

export const buildOrderUrl = (store, lines) => waLink(store.contact.whatsapp, buildOrderMessage(store, lines));

export function buildProductInquiryUrl(store, product) {
  return waLink(
    store.contact.whatsapp,
    `Hi ${store.storeName}! I'm interested in *${product.name}* (${formatPrice(product.price, store.currency)}). Is it available today?`,
  );
}

// Single gate between any parsing engine and the rest of the app: fills defaults,
// repairs common LLM/regex quirks, collects owner-facing warnings, then validates.

import { StoreSchema } from './schema.js';
import { CATEGORIES, detectCategory, emojiFor, fallbackDescription, productGroupFor, themeFor, DEFAULT_CATEGORY } from './catalog.js';
import { normalizeDays, normalizeTime } from './hours.js';
import { formatPhone, titleCase } from './ruleParser.js';

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// ---------------------------------------------------------------- colour
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrastWithWhite = (hex) => 1.05 / (luminance(hex) + 0.05);

/** Darken a colour until white text on it meets WCAG AA (4.5:1). */
export function ensureContrast(hex) {
  let [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  let out = hex.toUpperCase();
  for (let i = 0; i < 30 && contrastWithWhite(out) < 4.5; i++) {
    [r, g, b] = [r, g, b].map((c) => Math.round(c * 0.92));
    out = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
  }
  return out;
}

// ---------------------------------------------------------------- contact
export function toWhatsApp(value) {
  let d = String(value ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = `91${d}`;
  return d.length >= 10 && d.length <= 15 ? d : '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const isEmoji = (s) => /\p{Extended_Pictographic}/u.test(s) && [...s].length <= 4;
const isImageUrl = (s) => /^https:\/\/\S+$/i.test(s);

function slugify(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 40) || 'item';
}

function parsePrice(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.round(v * 100) / 100);
  const n = Number(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

// ---------------------------------------------------------------- main
export function normalizeStore(raw = {}) {
  const warnings = [];

  let storeName = str(raw.storeName, 80);
  if (!storeName) {
    storeName = 'My Shop';
    warnings.push("We didn't catch your shop's name — tap the name to add it.");
  } else if (storeName === storeName.toLowerCase()) {
    storeName = titleCase(storeName);
  }

  const rawCategory = str(raw.category, 40);
  const known = CATEGORIES.find((c) => c.name.toLowerCase() === rawCategory.toLowerCase());
  const theme = known ?? (rawCategory ? themeFor(rawCategory) : detectCategory(storeName));
  const category = known?.name ?? (rawCategory ? titleCase(rawCategory) : theme.name);

  const colorIn = str(raw.primaryColor, 7);
  const primaryColor = ensureContrast(/^#[0-9a-f]{6}$/i.test(colorIn) ? colorIn : theme.color ?? DEFAULT_CATEGORY.color);

  const tagline = str(raw.tagline, 120) || theme.taglines?.[0] || DEFAULT_CATEGORY.taglines[0];

  // Contact
  const c = raw.contact ?? {};
  const phoneDigits = String(c.phone ?? '').replace(/\D/g, '');
  const phone = phoneDigits.length >= 8 ? (/^\+/.test(str(c.phone)) && phoneDigits.length > 12 ? str(c.phone, 30) : formatPhone(phoneDigits)) : '';
  const whatsapp = toWhatsApp(c.whatsapp) || toWhatsApp(c.phone);
  const email = EMAIL_RE.test(str(c.email, 120)) ? str(c.email, 120).toLowerCase() : '';
  const address = str(c.address, 200);
  if (!phone && !whatsapp) warnings.push('No phone or WhatsApp number heard — add one so customers can order from you.');
  if (!address) warnings.push('No address heard — add it so customers can find you on the map.');

  // Hours
  const h = raw.hours ?? {};
  let open = normalizeTime(h.open);
  let close = normalizeTime(h.close);
  if (!open || !close) {
    warnings.push("We didn't catch your opening hours — we've set 9:00 AM to 9:00 PM. Edit them if that's wrong.");
    open ??= '09:00';
    close ??= '21:00';
  }
  const days = normalizeDays(h.days);

  // Products
  const seen = new Set();
  const ids = new Set();
  const products = [];
  for (const p of Array.isArray(raw.products) ? raw.products : []) {
    const name = str(p?.name, 80);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    let id = `p_${slugify(name)}`;
    for (let n = 2; ids.has(id); n++) id = `p_${slugify(name)}-${n}`;
    ids.add(id);
    const image = str(p.image, 500);
    const group = str(p.category, 40) || productGroupFor(name, category);
    let description = str(p.description, 240);
    // Offline parser only records a unit ("Priced per kg."); lead with a friendly line.
    if (!description || /^Priced per /.test(description)) description = `${fallbackDescription(group)} ${description}`.trim();
    products.push({
      id,
      name: name === name.toLowerCase() ? titleCase(name) : name,
      price: parsePrice(p.price),
      category: group,
      description,
      image: isEmoji(image) || isImageUrl(image) ? image : emojiFor(name, category),
    });
    if (products.length >= 200) break;
  }
  if (!products.length) warnings.push('No products with prices heard — try "we sell sourdough for ₹150".');
  else if (products.some((p) => p.price === 0)) warnings.push('Some products have no price yet — tap them to add one.');

  const social = raw.social ?? {};
  const store = StoreSchema.parse({
    storeName,
    tagline,
    category,
    primaryColor,
    currency: ['INR', 'USD', 'EUR', 'GBP'].includes(raw.currency) ? raw.currency : 'INR',
    contact: { phone, whatsapp, email, address },
    hours: { open, close, days },
    products,
    social: {
      instagram: str(social.instagram, 60).replace(/^@/, ''),
      facebook: str(social.facebook, 120),
    },
  });
  return { store, warnings };
}

// Deterministic, offline transcript parser. Turns a spoken description into a raw
// store object; normalize.js fills gaps and validates. No network, ~1 ms.

import { detectCategory } from './catalog.js';
import { parseDays, formatDays } from './hours.js';

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
  eighty: 80, ninety: 90, hundred: 100,
};

const SMALL_WORDS = new Set(['and', 'of', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'with', 'by', '&']);
const KEEP_CASE = new Set(['st', 'rd']);
const UNITS_LOWER = new Set(['kg', 'g', 'gm', 'ml', 'pcs', 'pc']);

export function titleCase(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (UNITS_LOWER.has(lower)) return lower;
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      // Speech often gives "mg road" / "hsr layout": vowel-less short words are acronyms.
      if (word.length <= 3 && !/[aeiouy]/i.test(word) && /^[a-z]+$/i.test(word) && !KEEP_CASE.has(lower)) {
        return word.toUpperCase();
      }
      if (word !== lower && word !== word.toUpperCase()) return word; // already mixed-case, keep
      return lower.replace(/(^|[-/(])([a-z])/g, (_, p, c) => p + c.toUpperCase());
    })
    .join(' ')
    .replace(/'S\b/g, "'s");
}

function preprocess(raw) {
  return String(raw)
    .replace(/\s+/g, ' ')
    .replace(/(\d),(\d{3})\b/g, '$1$2') // 1,200 -> 1200
    .replace(/\brs\.\s*/gi, 'Rs ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

// ---------------------------------------------------------------- currency
function detectCurrency(text) {
  if (/₹|\brs\b|\brupees?\b|\binr\b|\/-/i.test(text)) return 'INR';
  if (/\$|\bdollars?\b|\busd\b|\bbucks\b/i.test(text)) return 'USD';
  if (/€|\beuros?\b/i.test(text)) return 'EUR';
  if (/£|\bpounds?\b(?!\s+of)/i.test(text)) return 'GBP';
  return 'INR';
}

// ---------------------------------------------------------------- name
const NAME_STOP = String.raw`(?=\s+(?:on|in|at|near|located|which|that|and|open|opens|we|since|with|from|where|here|selling|it's|it\s+is|is\s+a|is\s+an)\b|\s*[,.;!?]|$)`;
const NAME_PATTERNS = [
  new RegExp(String.raw`\b(?:called|named)\s+["']?(.{2,60}?)["']?${NAME_STOP}`, 'i'),
  new RegExp(String.raw`\b(?:i|we)\s+(?:run|own|have|manage|started)\s+(.{2,60}?)${NAME_STOP}`, 'i'),
  new RegExp(String.raw`\bwelcome\s+to\s+(.{2,60}?)${NAME_STOP}`, 'i'),
  new RegExp(String.raw`\b(?:this\s+is|we\s+are|we're)\s+(.{2,60}?)${NAME_STOP}`, 'i'),
  new RegExp(String.raw`\b(?:shop|store|business)(?:'s|\s+is)?\s+name\s+is\s+(.{2,60}?)${NAME_STOP}`, 'i'),
  /^([A-Z][\w'&]*(?:\s+[A-Z][\w'&]*){0,4})\s+(?:is|sells|offers|has)\b/,
];

function extractName(text) {
  for (const re of NAME_PATTERNS) {
    const m = text.match(re);
    if (!m) continue;
    let name = m[1].trim().replace(/^(?:my|our)\s+/i, '');
    // "I run a small bakery" describes, it doesn't name: skip generic descriptions.
    if (/^(?:a|an|the)\s/i.test(name) || /^(?:small|little|local|family)\b/i.test(name)) continue;
    if (name.split(/\s+/).length > 6) continue;
    return titleCase(name);
  }
  return '';
}

// ---------------------------------------------------------------- contact
function toDigits(s) {
  return String(s).replace(/\D/g, '');
}

const PHONE_RE = /(?:\+?\d[\d -]{7,15}\d)/g;

function extractPhones(text) {
  const phones = [];
  for (const m of text.matchAll(PHONE_RE)) {
    const digits = toDigits(m[0]);
    if (digits.length >= 10 && digits.length <= 13) phones.push({ raw: m[0].trim(), digits, index: m.index });
  }
  return phones;
}

export function formatPhone(digits) {
  const d = toDigits(digits);
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  if (d.length === 11 && d.startsWith('0')) return `+91 ${d.slice(1, 6)} ${d.slice(6)}`;
  return `+${d}`;
}

function extractContact(text) {
  const phones = extractPhones(text);
  let whatsapp = '';
  const waMention = text.search(/whats\s?app/i);
  if (waMention >= 0) {
    const near = phones.find((p) => Math.abs(p.index - waMention) < 40);
    if (near) whatsapp = near.digits;
  }
  const phone = phones.find((p) => p.digits !== whatsapp) ?? phones[0];

  let email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? '';
  if (!email) {
    const spoken = text.match(/\b([\w.]+)\s+at\s+([\w-]+)\s+dot\s+(com|in|org|net|co(?:\s+dot\s+in)?)\b/i);
    if (spoken) email = `${spoken[1]}@${spoken[2]}.${spoken[3].replace(/\s+dot\s+/g, '.')}`.toLowerCase();
  }

  const insta =
    text.match(/insta(?:gram)?(?:\s+(?:handle|id|page|account))?\s*(?:is|:)?\s*@?([a-z0-9_.]{3,30})/i)?.[1] ??
    text.match(/(?:^|\s)@([a-z0-9_.]{3,30})\b/i)?.[1] ??
    '';

  return {
    phone: phone ? formatPhone(phone.digits) : '',
    whatsapp: whatsapp || phone?.digits || '',
    email: email.replace(/\.$/, ''),
    instagram: insta.replace(/\.$/, ''),
    consumed: [...phones.map((p) => p.raw), email].filter(Boolean),
  };
}

// ---------------------------------------------------------------- address
const PLACE_SUFFIX = String.raw`(?:road|rd|street|st|nagar|lane|marg|market|bazaar|bazar|avenue|colony|circle|chowk|layout|cross|complex|plaza|mall|gali|square|block|sector\s*\d+|main|peth|wadi|pada|enclave|vihar|bagh|ganj|puram|halli)`;
const ADDRESS_RE = new RegExp(
  String.raw`\b(?:located\s+(?:at|on|in)|address\s+is|find\s+us\s+(?:at|on|in)|we(?:'re|\s+are)\s+(?:at|on|in)|situated\s+(?:at|on|in)|on|at|near|in|opposite)\s+` +
    String.raw`((?:(?!open\b|opens\b|from\b)[A-Za-z0-9#'./-]+\s+){0,5}?${PLACE_SUFFIX}\b` +
    String.raw`(?:\s*,?\s*(?!open\b|opens\b|we\b|and\b|from\b|timings?\b|call\b|phone\b)[A-Za-z]{3,}){0,2})`,
  'i',
);

function extractAddress(text) {
  const m = text.match(ADDRESS_RE);
  if (m) return titleCase(m[1].replace(/[,\s]+$/, '').replace(/\s*,\s*/g, ', '));
  const city = text.match(/\b(?:located|based)\s+in\s+([A-Za-z]{3,}(?:\s*,?\s+[A-Za-z]{3,})?)/i);
  return city ? titleCase(city[1]) : '';
}

// ---------------------------------------------------------------- hours
const TIME_TOKEN = String.raw`(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|noon)(?:[:.](\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|in\s+the\s+morning|in\s+the\s+evening|at\s+night)?`;
const HOURS_RE = new RegExp(`${TIME_TOKEN}\\s*(?:-|–|to|till|until|up\\s*to|upto)\\s*${TIME_TOKEN}`, 'i');

const toHour = (tok) => (tok.toLowerCase() === 'noon' ? 12 : NUMBER_WORDS[tok.toLowerCase()] ?? Number(tok));
const meridiem = (s) => {
  if (!s) return null;
  const t = s.toLowerCase();
  if (t.startsWith('a') || t.includes('morning')) return 'am';
  return 'pm';
};
const pad = (n) => String(n).padStart(2, '0');

function to24(h, mer) {
  if (mer === 'pm' && h < 12) return h + 12;
  if (mer === 'am' && h === 12) return 0;
  return h;
}

function extractHours(text) {
  if (/\b(24\s*[x/]\s*7|24\s+hours|round\s+the\s+clock|open\s+all\s+day\s+and\s+night)\b/i.test(text)) {
    return { open: '00:00', close: '23:59', days: 'Daily', consumed: [] };
  }
  const days = parseDays(text);
  const m = text.match(HOURS_RE);
  if (!m) return { open: '', close: '', days: days ? formatDays(days) : '', consumed: [] };

  const [full, oTok, oMin = '00', oMerRaw, cTok, cMin = '00', cMerRaw] = m;
  let o = toHour(oTok);
  let c = toHour(cTok);
  const oMer = meridiem(oMerRaw);
  const cMer = meridiem(cMerRaw);
  const hasMeridiem = oMer || cMer || /noon/i.test(full);
  const before = text.slice(Math.max(0, m.index - 30), m.index);
  const looksLikeHours = hasMeridiem || /\b(open|opens|timings?|hours|from|between)\b/i.test(before) || /[:.]/.test(full);
  if (!looksLikeHours || o > 24 || c > 24) return { open: '', close: '', days: days ? formatDays(days) : '', consumed: [] };

  // 24h clock already ("09:00 to 21:00")
  if (o > 12 || c > 12) {
    return { open: `${pad(o % 24)}:${oMin}`, close: c === 24 ? '23:59' : `${pad(c)}:${cMin}`, days: days ? formatDays(days) : '', consumed: [full] };
  }

  o = oMer ? to24(o, oMer) : o === 12 ? 12 : o <= 4 ? o + 12 : o;
  if (cMer) c = to24(c, cMer);
  else if (c <= o % 12 || c - o < 4) c = c === 12 ? 12 : c + 12;
  if (c >= 24) c = c === 24 ? 23 : c - 12;

  return {
    open: `${pad(o)}:${oMin}`,
    close: `${pad(c)}:${cMin}`,
    days: days ? formatDays(days) : '',
    consumed: [full],
  };
}

// ---------------------------------------------------------------- products
const CURRENCY_BEFORE = String.raw`(?:₹|\bRs\b|\bINR\b|\$|€|£)\s*`;
const CURRENCY_AFTER = String.raw`\s*(?:₹|rs\b|rupees?\b|inr\b|\/-|bucks\b|dollars?\b|euros?\b|pounds?\b)`;
const UNIT_BODY = String.raw`\s*(?:per|a|an|\/|for\s+(?:a|one|1))\s*(kg|kilo|kilogram|litre|liter|piece|pc|pcs|dozen|packet|pack|box|plate|cup|glass|metre|meter|pair|slice|loaf|bottle|jar|bunch|250\s?g|500\s?g|100\s?g|gram|grams)\b`;
const UNIT = `(?:${UNIT_BODY})?`;

// Ordered by confidence; the first that matches a segment wins.
const PRICE_PATTERNS = [
  new RegExp(`(?:\\b(?:for|at|@|costs?|priced\\s+at|is|are|just|only)\\s+)?${CURRENCY_BEFORE}(\\d+(?:\\.\\d{1,2})?)${UNIT}`, 'i'),
  new RegExp(`(?:\\b(?:for|at|@|costs?|priced\\s+at|is|are|just|only)\\s+)?(\\d+(?:\\.\\d{1,2})?)${CURRENCY_AFTER}${UNIT}`, 'i'),
  new RegExp(`\\b(?:for|at|@|costs?|priced\\s+at|just|only)\\s+(\\d+(?:\\.\\d{1,2})?)(?!\\s*(?:am|pm|a\\.m|p\\.m|hours?|hrs|minutes?|mins?|years?|%|percent))\\b${UNIT}`, 'i'),
  new RegExp(`(\\d+(?:\\.\\d{1,2})?)\\s*(?:each|apiece|a\\s+piece)\\b${UNIT}`, 'i'),
  new RegExp(`(\\d+(?:\\.\\d{1,2})?)${UNIT_BODY}`, 'i'), // "basmati rice 120 per kg"
  new RegExp(`\\s[-:]\\s*(\\d+(?:\\.\\d{1,2})?)\\b${UNIT}`, 'i'),
];

const LEADING_FILLER = new RegExp(
  '^(?:' +
    [
      String.raw`(?:we|i)\s+(?:also\s+)?(?:sell|have|make|bake|offer|stock|serve|carry|got|do|prepare)`,
      String.raw`(?:our|my)\s+(?:menu|products?|items?|range|specials?|bestsellers?)\s*(?:include|includes|are|is|:)?`,
      String.raw`there(?:'s|\s+is|\s+are)`,
      String.raw`we've\s+got`,
      String.raw`selling`,
      String.raw`(?:items?|products?)\s+like`,
      String.raw`(?:items?|products?)\s*(?:are|include|:)`,
      'like', 'also', 'and', 'plus', 'then', 'with', 'a', 'an', 'the', 'some', 'our', 'my', 'fresh', 'freshly\\s+made',
      String.raw`(?:pure|homemade|home-made)\s+(?=\w+\s+\w)`,
    ].join('|') +
    String.raw`)\s+`,
  'i',
);

const TRAILING_FILLER = /\s+(?:for|at|is|are|costs?|priced|which\s+(?:is|are)|that\s+(?:is|are)|cost|just|only|@|-|:)\s*$/i;
const NOT_PRODUCTS = /^(?:open|opens|closed|call|phone|whatsapp|contact|timings?|hours|address|located|we|i|it|price|prices|everything|all|delivery|minimum\s+order)\b/i;

function cleanProductName(raw) {
  let name = raw.trim().replace(/^[,:;\-–\s]+/, '');
  for (let i = 0; i < 6; i++) {
    const next = name.replace(LEADING_FILLER, '');
    if (next === name) break;
    name = next;
  }
  name = name.replace(TRAILING_FILLER, '').replace(/[,:;\-–\s]+$/, '').replace(/^["']|["']$/g, '').trim();
  return name;
}

function splitSegments(text) {
  return text
    .split(/(?<!\d)[.;!?](?!\d)|,(?!\d{3}\b)|\band\b|\bthen\b|\balso\b|\bplus\b|\n/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractProducts(text) {
  const products = [];
  const seen = new Set();
  for (const segment of splitSegments(text)) {
    let match = null;
    for (const re of PRICE_PATTERNS) {
      match = segment.match(re);
      if (match) break;
    }
    if (!match) continue;

    const name = cleanProductName(segment.slice(0, match.index));
    const words = name.split(/\s+/);
    if (!/[a-z]/i.test(name) || name.length < 2 || name.length > 50 || words.length > 6 || NOT_PRODUCTS.test(name)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const unit = match[2]?.toLowerCase().replace(/^(kilo|kilogram)$/, 'kg').replace(/^liter$/, 'litre');
    products.push({
      name: titleCase(name),
      price: Number(match[1]),
      unit: unit ?? '',
    });
  }
  return products;
}

// ---------------------------------------------------------------- main
export function parseWithRules(transcript) {
  const text = preprocess(transcript);
  const category = detectCategory(text);
  const storeName = extractName(text);
  const contact = extractContact(text);
  const hours = extractHours(text);

  // Strip phone numbers, emails and the hours phrase so their digits aren't read as prices.
  // Replace with a sentence break so the neighbouring clauses don't merge into one "product".
  let productText = text;
  for (const s of [...contact.consumed, ...hours.consumed]) productText = productText.replace(s, ' ; ');
  const address = extractAddress(text);
  if (address) productText = productText.replace(new RegExp(address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ; ');

  return {
    storeName,
    tagline: '',
    category: category.name,
    primaryColor: '',
    currency: detectCurrency(text),
    contact: { phone: contact.phone, whatsapp: contact.whatsapp, email: contact.email, address },
    hours: { open: hours.open, close: hours.close, days: hours.days },
    products: extractProducts(productText).map((p) => ({
      name: p.name,
      price: p.price,
      category: '',
      description: p.unit ? `Priced per ${p.unit}.` : '',
      image: '',
    })),
    social: { instagram: contact.instagram, facebook: '' },
  };
}

// Helpers for business hours. Day indexes: 0 = Mon ... 6 = Sun.

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_PATTERNS = [
  /^mon(day)?s?$/, /^tue(s|sday)?s?$/, /^wed(nesday)?s?$/, /^thu(r|rs|rsday)?s?$/,
  /^fri(day)?s?$/, /^sat(urday)?s?$/, /^sun(day)?s?$/,
];
const DAY_WORD = '(?:mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)s?';

export function dayIndex(word) {
  const w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  return DAY_PATTERNS.findIndex((re) => re.test(w));
}

function range(from, to) {
  const out = [];
  for (let i = from; ; i = (i + 1) % 7) {
    out.push(i);
    if (i === to || out.length > 7) break;
  }
  return out;
}

/** Parse free text like "Mon-Sat", "monday to friday", "daily", "closed on sunday" into a Set of day indexes. */
export function parseDays(text) {
  const t = String(text ?? '').toLowerCase();
  if (!t.trim()) return null;
  const all = new Set([0, 1, 2, 3, 4, 5, 6]);

  if (/\b(daily|every\s*day|everyday|all\s+(?:days|week)|7\s*days|seven\s+days|24\s*[x/]\s*7|all\s+7\s+days|open\s+all\s+week)\b/.test(t)) {
    const closed = t.match(new RegExp(`(?:except\\s+|closed\\s+(?:on\\s+)?)(${DAY_WORD})`));
    if (closed) all.delete(dayIndex(closed[1]));
    return all;
  }

  const closedMatch = t.match(new RegExp(`(?:except\\s+|closed\\s+(?:on\\s+|every\\s+)?|holiday\\s+(?:on\\s+)?|off\\s+on\\s+)(${DAY_WORD})(?:\\s*(?:and|&|,)\\s*(${DAY_WORD}))?`));
  const rangeMatch = t.match(new RegExp(`(${DAY_WORD})\\s*(?:-|–|to|through|till|until|thru)\\s*(${DAY_WORD})`));

  let days = null;
  if (rangeMatch) days = new Set(range(dayIndex(rangeMatch[1]), dayIndex(rangeMatch[2])));
  else if (/\bweekdays?\b/.test(t)) days = new Set([0, 1, 2, 3, 4]);
  else if (/\bweekends?\b/.test(t) && !closedMatch) days = new Set([5, 6]);

  if (closedMatch) {
    days ??= new Set(all);
    days.delete(dayIndex(closedMatch[1]));
    if (closedMatch[2]) days.delete(dayIndex(closedMatch[2]));
  }

  if (!days) {
    const listed = [...t.matchAll(new RegExp(`\\b${DAY_WORD}\\b`, 'g'))].map((m) => dayIndex(m[0]));
    if (listed.length) days = new Set(listed.filter((i) => i >= 0));
  }
  return days && days.size ? days : null;
}

/** Format a Set of day indexes into "Daily", "Mon-Sat", "Tue-Sun" or "Mon, Wed, Fri". */
export function formatDays(set) {
  if (!set || set.size === 0) return 'Daily';
  if (set.size === 7) return 'Daily';
  const sorted = [...set].sort((a, b) => a - b);
  // Find a start day such that the set is one contiguous (wrapping) run.
  for (const start of sorted) {
    if (set.has((start + 6) % 7)) continue;
    const run = range(start, (start + set.size - 1) % 7);
    if (run.every((d) => set.has(d))) {
      return set.size === 1 ? DAY_SHORT[start] : `${DAY_SHORT[run[0]]}-${DAY_SHORT[run.at(-1)]}`;
    }
  }
  return sorted.map((d) => DAY_SHORT[d]).join(', ');
}

export function normalizeDays(text) {
  return formatDays(parseDays(text));
}

const pad = (n) => String(n).padStart(2, '0');

/** Normalise "9", "9am", "9:30 PM", "21:00", "21.30" to 24h "HH:MM". Returns null if unparseable. */
export function normalizeTime(value) {
  const t = String(value ?? '').trim().toLowerCase();
  if (!t) return null;
  if (/midnight/.test(t)) return '23:59';
  if (/noon/.test(t)) return '12:00';
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const mer = m[3]?.[0];
  if (min > 59 || h > 24) return null;
  if (mer === 'p' && h < 12) h += 12;
  if (mer === 'a' && h === 12) h = 0;
  if (h === 24) return '23:59';
  return `${pad(h)}:${pad(min)}`;
}

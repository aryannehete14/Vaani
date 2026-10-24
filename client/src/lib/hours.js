// Business-hours logic for the storefront status badge. Days: 0 = Mon ... 6 = Sun.

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const idx = (word) => DAY_SHORT.findIndex((d) => d.toLowerCase() === String(word).trim().slice(0, 3).toLowerCase());

/** Parse the canonical day strings the server produces: "Daily", "Mon-Sat", "Tue-Sun", "Mon, Wed, Fri", "Sat". */
export function parseDays(text) {
  const t = String(text ?? '').trim();
  if (!t || /^daily$/i.test(t)) return new Set([0, 1, 2, 3, 4, 5, 6]);
  const out = new Set();
  for (const part of t.split(',')) {
    const [a, b] = part.split(/\s*[-–]\s*/);
    const from = idx(a);
    if (from < 0) continue;
    const to = b ? idx(b) : from;
    if (to < 0) continue;
    for (let i = from; ; i = (i + 1) % 7) {
      out.add(i);
      if (i === to) break;
    }
  }
  return out.size ? out : new Set([0, 1, 2, 3, 4, 5, 6]);
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};

export function formatTime(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  if (h === 23 && m === 59) return '12:00 AM';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, '0')} ${suffix}`;
}

const dayOf = (date) => (date.getDay() + 6) % 7;

/**
 * @returns {{ isOpen: boolean, label: string, detail: string, closingSoon: boolean }}
 */
export function getOpenStatus(hours, now = new Date()) {
  const days = parseDays(hours?.days);
  const open = toMinutes(hours?.open ?? '09:00');
  const close = toMinutes(hours?.close ?? '21:00');
  const allDay = open === 0 && close >= 23 * 60 + 59;
  const overnight = !allDay && close <= open;
  const today = dayOf(now);
  const yesterday = (today + 6) % 7;
  const mins = now.getHours() * 60 + now.getMinutes();

  if (allDay && days.has(today)) {
    return { isOpen: true, label: 'Open now', detail: 'Open 24 hours', closingSoon: false };
  }

  let minutesLeft = null;
  if (days.has(today) && (overnight ? mins >= open : mins >= open && mins < close)) {
    minutesLeft = overnight ? 24 * 60 - mins + close : close - mins;
  } else if (overnight && days.has(yesterday) && mins < close) {
    minutesLeft = close - mins;
  }
  if (minutesLeft !== null) {
    const closingSoon = minutesLeft <= 30;
    return {
      isOpen: true,
      label: closingSoon ? 'Closing soon' : 'Open now',
      detail: `Closes ${formatTime(hours.close)}`,
      closingSoon,
    };
  }

  if (days.has(today) && mins < open) {
    return { isOpen: false, label: 'Closed', detail: `Opens today ${formatTime(hours.open)}`, closingSoon: false };
  }
  for (let k = 1; k <= 7; k++) {
    const d = (today + k) % 7;
    if (days.has(d)) {
      const when = k === 1 ? 'tomorrow' : DAY_SHORT[d];
      return { isOpen: false, label: 'Closed', detail: `Opens ${when} ${formatTime(hours.open)}`, closingSoon: false };
    }
  }
  return { isOpen: false, label: 'Closed', detail: 'Hours not set', closingSoon: false };
}

/** Seven rows for the weekly hours card, starting Monday. */
export function weekSchedule(hours, now = new Date()) {
  const days = parseDays(hours?.days);
  const today = dayOf(now);
  const allDay = hours?.open === '00:00' && hours?.close === '23:59';
  return DAY_LONG.map((name, i) => ({
    name,
    isToday: i === today,
    isOpen: days.has(i),
    range: days.has(i) ? (allDay ? 'Open 24 hours' : `${formatTime(hours.open)} – ${formatTime(hours.close)}`) : 'Closed',
  }));
}

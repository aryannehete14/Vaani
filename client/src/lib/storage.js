// localStorage can throw (private mode, blocked storage), so every access is guarded.

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // non-fatal
  }
}

const KEYS = 'vaani:keys';

export const getEditKey = (slug) => read(KEYS, {})[slug] ?? null;
export const setEditKey = (slug, key) => write(KEYS, { ...read(KEYS, {}), [slug]: key });
export const ownedSlugs = () => Object.keys(read(KEYS, {}));

export const loadCart = (slug) => read(`vaani:cart:${slug}`, {});
export const saveCart = (slug, cart) => write(`vaani:cart:${slug}`, cart);

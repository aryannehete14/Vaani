import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS stores (
  slug        TEXT PRIMARY KEY,
  edit_token  TEXT NOT NULL,
  config      TEXT NOT NULL,
  engine      TEXT NOT NULL,
  transcript  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  store_slug  TEXT NOT NULL REFERENCES stores(slug) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_store ON inquiries(store_slug, created_at DESC);
`;

export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'shop'
  );
}

export const newEditToken = () => randomBytes(24).toString('base64url');

export function tokensMatch(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

// SQLite returns "YYYY-MM-DD HH:MM:SS" in UTC; make it unambiguous ISO for clients.
const iso = (s) => (s ? `${s.replace(' ', 'T')}Z` : s);

const toInquiry = (row) => row && { id: row.id, name: row.name, contact: row.contact, message: row.message, status: row.status, createdAt: iso(row.created_at) };

/** Opens (and migrates) the database. Pass ':memory:' for tests. */
export function openDb(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const q = {
    exists: db.prepare('SELECT 1 FROM stores WHERE slug = ?'),
    insert: db.prepare('INSERT INTO stores (slug, edit_token, config, engine, transcript) VALUES (?, ?, ?, ?, ?)'),
    get: db.prepare('SELECT * FROM stores WHERE slug = ?'),
    list: db.prepare('SELECT slug, config, created_at FROM stores ORDER BY created_at DESC, rowid DESC LIMIT ?'),
    update: db.prepare("UPDATE stores SET config = ?, updated_at = datetime('now') WHERE slug = ?"),
    addInquiry: db.prepare('INSERT INTO inquiries (store_slug, name, contact, message) VALUES (?, ?, ?, ?)'),
    getInquiry: db.prepare('SELECT * FROM inquiries WHERE id = ? AND store_slug = ?'),
    listInquiries: db.prepare('SELECT * FROM inquiries WHERE store_slug = ? ORDER BY created_at DESC, id DESC'),
    setInquiryStatus: db.prepare('UPDATE inquiries SET status = ? WHERE id = ? AND store_slug = ?'),
    countInquiries: db.prepare("SELECT COUNT(*) AS total, SUM(status = 'new') AS open FROM inquiries WHERE store_slug = ?"),
  };

  return {
    raw: db,

    uniqueSlug(name) {
      const base = slugify(name);
      let slug = base;
      for (let n = 2; q.exists.get(slug); n++) slug = `${base}-${n}`;
      return slug;
    },

    createStore({ slug, editToken = newEditToken(), store, engine = 'manual', transcript = null }) {
      q.insert.run(slug, editToken, JSON.stringify(store), engine, transcript);
      return { slug, editToken };
    },

    getStore(slug) {
      const row = q.get.get(slug);
      if (!row) return null;
      return {
        slug: row.slug,
        editToken: row.edit_token,
        store: JSON.parse(row.config),
        engine: row.engine,
        createdAt: iso(row.created_at),
        updatedAt: iso(row.updated_at),
      };
    },

    listStores(limit = 12) {
      return q.list.all(limit).map((row) => {
        const s = JSON.parse(row.config);
        return {
          slug: row.slug,
          storeName: s.storeName,
          tagline: s.tagline,
          category: s.category,
          primaryColor: s.primaryColor,
          productCount: s.products.length,
          preview: s.products.slice(0, 3).map((p) => p.image),
          createdAt: iso(row.created_at),
        };
      });
    },

    updateStore(slug, store) {
      q.update.run(JSON.stringify(store), slug);
      return this.getStore(slug);
    },

    addInquiry(slug, { name, contact, message }) {
      const { lastInsertRowid } = q.addInquiry.run(slug, name, contact, message);
      return toInquiry(q.getInquiry.get(Number(lastInsertRowid), slug));
    },

    listInquiries(slug) {
      return q.listInquiries.all(slug).map(toInquiry);
    },

    countInquiries(slug) {
      const { total, open } = q.countInquiries.get(slug);
      return { total: Number(total), open: Number(open ?? 0) };
    },

    setInquiryStatus(slug, id, status) {
      q.setInquiryStatus.run(status, id, slug);
      return toInquiry(q.getInquiry.get(id, slug));
    },

    close: () => db.close(),
  };
}

import { Router } from 'express';
import { z } from 'zod';
import { StoreSchema } from '../ai/schema.js';
import { normalizeStore, upgradeStore } from '../ai/normalize.js';
import { tokensMatch } from '../db.js';
import { rateLimit } from '../rateLimit.js';
import { HttpError } from '../errors.js';

const PublishBody = z.object({
  store: z.object({}).passthrough(),
  transcript: z.string().max(5000).optional(),
  engine: z.enum(['claude', 'rules', 'manual']).default('manual'),
});

const InquiryBody = z.object({
  name: z.string().trim().min(1, 'Please add your name.').max(80),
  contact: z.string().trim().min(5, 'Add a phone number or email so the shop can reply.').max(120),
  message: z.string().trim().min(2, 'Write a short message.').max(1000),
});

const StatusBody = z.object({ status: z.enum(['new', 'done']) });

// Client edits go through the same normaliser as AI output, so a hand-edited
// store can never be saved in a shape the storefront can't render.
function cleanStore(input) {
  const { store } = normalizeStore(input);
  return StoreSchema.parse(store);
}

export function storesRouter({ db }) {
  const router = Router();

  const load = (req) => {
    const record = db.getStore(req.params.slug);
    if (!record) throw new HttpError(404, 'NOT_FOUND', 'Store not found.');
    return { ...record, store: upgradeStore(record.store) };
  };

  const requireOwner = (req) => {
    const record = load(req);
    if (!tokensMatch(req.get('x-edit-token'), record.editToken)) {
      throw new HttpError(401, 'UNAUTHORIZED', 'That edit key does not match this store.');
    }
    return record;
  };

  router.get('/stores', (_req, res) => {
    res.json({ stores: db.listStores(12) });
  });

  router.post('/stores', rateLimit({ windowMs: 60_000, max: 10 }), (req, res) => {
    const body = PublishBody.parse(req.body ?? {});
    const store = cleanStore(body.store);
    const slug = db.uniqueSlug(store.storeName);
    const { editToken } = db.createStore({ slug, store, engine: body.engine, transcript: body.transcript ?? null });
    res.status(201).json({ slug, editToken, store });
  });

  router.get('/stores/:slug', (req, res) => {
    const { slug, store, updatedAt } = load(req);
    res.json({ slug, store, updatedAt });
  });

  router.put('/stores/:slug', (req, res) => {
    const { slug } = requireOwner(req);
    const store = cleanStore(req.body?.store ?? {});
    const updated = db.updateStore(slug, store);
    res.json({ slug, store: updated.store, updatedAt: updated.updatedAt });
  });

  router.get('/stores/:slug/owner', (req, res) => {
    const { slug, store, engine, createdAt, updatedAt } = requireOwner(req);
    res.json({ slug, store, engine, createdAt, updatedAt, inquiries: db.countInquiries(slug) });
  });

  router.post('/stores/:slug/inquiries', rateLimit({ windowMs: 60_000, max: 5 }), (req, res) => {
    const { slug } = load(req);
    const inquiry = db.addInquiry(slug, InquiryBody.parse(req.body ?? {}));
    res.status(201).json({ inquiry });
  });

  router.get('/stores/:slug/inquiries', (req, res) => {
    const { slug } = requireOwner(req);
    res.json({ inquiries: db.listInquiries(slug) });
  });

  router.patch('/stores/:slug/inquiries/:id', (req, res) => {
    const { slug } = requireOwner(req);
    const { status } = StatusBody.parse(req.body ?? {});
    const inquiry = db.setInquiryStatus(slug, Number(req.params.id), status);
    if (!inquiry) throw new HttpError(404, 'NOT_FOUND', 'Inquiry not found.');
    res.json({ inquiry });
  });

  return router;
}

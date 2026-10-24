import express, { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rateLimit } from '../rateLimit.js';
import { HttpError } from '../errors.js';

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

// Identify the format from the file's own bytes; never trust the declared type or name.
export function sniffImage(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/** Product photos and shop logos. Open to anyone (shops are built before publishing), so rate limited. */
export function uploadsRouter({ uploadsDir }) {
  mkdirSync(uploadsDir, { recursive: true });
  const router = Router();

  router.post(
    '/uploads',
    rateLimit({ windowMs: 60_000, max: 30 }),
    express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_UPLOAD_BYTES }),
    (req, res) => {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || buf.length === 0) {
        throw new HttpError(400, 'BAD_IMAGE', 'Send a JPEG, PNG or WebP image.');
      }
      const ext = sniffImage(buf);
      if (!ext) throw new HttpError(400, 'BAD_IMAGE', 'That file is not a JPEG, PNG or WebP image.');
      const name = `${randomBytes(12).toString('hex')}.${ext}`;
      writeFileSync(join(uploadsDir, name), buf);
      res.status(201).json({ url: `/uploads/${name}` });
    },
  );

  return router;
}

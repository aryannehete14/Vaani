import { Router } from 'express';
import { z } from 'zod';
import { rateLimit } from '../rateLimit.js';

const GenerateBody = z.object({
  transcript: z.string().trim().min(10, 'Tell us a little more about your shop (at least 10 characters).').max(5000),
  engine: z.enum(['auto', 'rules']).default('auto'),
});

export function generateRouter({ generator }) {
  const router = Router();

  router.post('/generate', rateLimit({ windowMs: 60_000, max: 20 }), async (req, res) => {
    const { transcript, engine } = GenerateBody.parse(req.body ?? {});
    const result = await generator(transcript, { engine });
    res.json(result);
  });

  return router;
}

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { openDb } from './db.js';
import { createApp } from './app.js';
import { seedDemo, DEMO_SLUG } from './seed.js';
import { activeEngine } from './ai/pipeline.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

try {
  process.loadEnvFile(join(root, '.env'));
} catch {
  // .env is optional
}

const PORT = Number(process.env.PORT) || 8787;
const DATA_DIR = resolve(root, process.env.DATA_DIR || 'server/data');

const db = openDb(join(DATA_DIR, 'vaani.db'));
if (seedDemo(db)) console.log(`[seed] Created demo store /s/${DEMO_SLUG} (edit key: "demo")`);

const app = createApp({ db, clientDist: join(root, 'client/dist') });
app.listen(PORT, () => {
  console.log(`[vaani] API listening on http://localhost:${PORT}  ·  AI engine: ${activeEngine()}`);
});

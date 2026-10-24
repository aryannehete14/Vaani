---
doc: spec
status: draft
---

# Vaani — Technical Spec

## How This Works, In Plain Language
Vaani has three pieces:

1. **The web app** (what people see). It has three screens: the **Builder**, where the owner talks; the **Storefront**, which customers visit; and the **Dashboard**, where the owner edits. It runs in the browser and uses the browser's built-in speech recognition to turn talking into text.
2. **The server** (the shop's memory and brain). It receives the owner's words, asks the **AI engine** to turn them into a structured description of the store, and saves published stores and customer inquiries in a small database file.
3. **The AI engine** (the translator). It turns messy sentences ("open nine to eight except Sundays, croissants are eighty rupees") into a tidy, checked list of facts: name, hours, products with prices and so on. It uses Claude when an API key is configured, and a built-in rule-based parser otherwise. Either way, the output passes the same checker, so the rest of the app never has to worry about which one ran.

The storefront isn't generated code. It's one well-designed page that renders whatever store description it's given. That's why generation is fast, previews are live, and every store looks polished.

**Why this shape:** one Node process, one database file, no external services required. Anyone can clone it and run it in a minute, and nothing can break during a demo.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The owner taps the mic → `useSpeechRecognition` hook (Web Speech API) streams interim and final text into the `transcript` state → the textarea shows the words live.
2. The owner taps **Build my store** → the client sends `POST /api/generate { transcript }` → the server route validates length → `generateStore()` in `server/src/ai/pipeline.js`.
3. The pipeline picks an engine. If `ANTHROPIC_API_KEY` is set, it calls `parseWithClaude()` (Claude structured output against a Zod schema). Otherwise, or on any error, it calls `parseWithRules()`.
4. The raw result goes to `normalizeStore()`, which applies the theme colour fallback, hex validation, price coercion, unique IDs, hours normalised to `HH:MM`, emoji assignment and the WhatsApp number derived from the phone. It returns `{ store, engine, warnings }`.
5. The client puts `store` into the `draft` state → `<ReviewPanel>` (editable) and `<DeviceFrame><Storefront store={draft} preview /></DeviceFrame>` re-render on every change.
6. **Publish** → `POST /api/stores { store, transcript, engine }` → re-validated by the Zod `StoreSchema` → slug made unique → `editToken` generated → row inserted in SQLite → the client stores `{slug: editToken}` in localStorage and shows the share card.
7. A customer opens `/s/:slug` → `GET /api/stores/:slug` → `<Storefront>` renders. `getOpenStatus(hours, now)` computes the badge, `useCart` holds the cart, and `buildWhatsAppOrderUrl()` composes the `wa.me` link.
8. The customer submits the inquiry form → `POST /api/stores/:slug/inquiries` → saved → the owner's dashboard lists it via `GET /api/stores/:slug/inquiries` (edit key required).
9. The owner speaks on the dashboard → `POST /api/generate` with the new sentence → only `products` are merged into the existing store (skipping duplicate names) → **Save** → `PUT /api/stores/:slug`.

## Stack
| Layer | Choice | Version | Docs | Why |
|---|---|---|---|---|
| Runtime | Node.js | ≥ 22.13 (tested on 24) | https://nodejs.org/api/ | Built-in `node:sqlite`, so no native compile step on Windows/macOS/Linux |
| Frontend build | Vite | 6.x | https://vite.dev | Instant dev server, simple production build |
| UI | React | 18.x | https://react.dev | Component model fits the three screens |
| Routing | React Router | 6.x | https://reactrouter.com | `/`, `/s/:slug`, `/dashboard/:slug` |
| Styling | Tailwind CSS | 4.x (`@tailwindcss/vite`) | https://tailwindcss.com | Fast, consistent, responsive utility styling; brand colours via CSS variables |
| Motion | Framer Motion | 11.x | https://motion.dev | Mic rings, layout-animated tabs, cart bar springs |
| Icons | Lucide React | latest | https://lucide.dev | Clean, consistent icon set |
| API | Express | 4.x | https://expressjs.com | Minimal, well known |
| Validation | Zod | 3.x | https://zod.dev | One schema validates LLM output *and* API writes |
| LLM | Anthropic SDK + Claude Opus 5.5 (`claude-opus-5-5`) | `@anthropic-ai/sdk` latest | https://platform.claude.com/docs | Structured outputs (`messages.parse` + `zodOutputFormat`) guarantee schema-shaped JSON |
| Database | SQLite via `node:sqlite` | built-in | https://nodejs.org/api/sqlite.html | Zero-config persistence, a single file |
| Tests | `node:test` | built-in | https://nodejs.org/api/test.html | No extra test framework |

`node:sqlite` prints an "experimental" warning on some Node versions. The API used here (`DatabaseSync`, `prepare`, `run`, `get`, `all`) is stable across 22.13+ and 24.

## Where It Runs and How Someone Tries It
- **Requirements:** Node ≥ 22.13 and npm. `ANTHROPIC_API_KEY` is optional; without it the offline parser is used.
- **Dev:** `npm install` then `npm run dev`. That starts the API on `http://localhost:8787` and Vite on `http://localhost:5173` (proxying `/api`).
- **Production:** `npm run build && npm start`. Express serves the built client and the API on one port (`PORT`, default 8787).
- **Tests:** `npm test` runs the parser, normaliser, hours logic and API integration tests.
- **Demo recording:** open `/`, tap the mic (Chrome or Edge), speak the bakery description, publish, open the storefront on a phone-sized window and order on WhatsApp.
- **Deploy (optional):** any Node host (Render, Railway, Fly.io) with `npm run build` as the build command, `npm start` as the start command, and a persistent disk for `DATA_DIR`.

## Look and Feel
PRD ref: `prd.md > Look and Feel`.
- **Tokens (CSS variables in `client/src/index.css`):** `--bg` warm off-white `#FBF8F3` (dark: `#0E0D0C`), `--ink` `#1C1917`, a Vaani accent gradient from violet `#7C3AED` to orange `#F97316`, and `--brand`, set per store from `primaryColor`.
- **Type:** Fraunces (display, 600–700) and Plus Jakarta Sans (UI, 400–700), loaded from Google Fonts.
- **Shape:** `rounded-2xl` cards, `rounded-full` pills, a 1px hairline border at 8% ink, and layered soft shadows.
- **Density:** spacious on desktop; on mobile, 16px gutters, 44px minimum tap targets and a sticky bottom action bar.
- **Motion:** 150–300 ms ease-out, springs for the cart and tabs, all gated behind `useReducedMotion()`.
- **Copy:** second person, short, warm ("Your store is live!").

## Components

### Client (`client/src`)
```
App (Router)
├── BuilderPage                     PRD: Voice and text intake; Review, edit and publish
│   ├── Hero + VoiceRecorder        (useSpeechRecognition) mic, rings, language select
│   ├── SamplePrompts
│   ├── GenerationProgress          4-step animated stepper
│   ├── ReviewPanel                 editable fields, warnings, engine badge
│   │   ├── DetailsEditor           (shared with dashboard)
│   │   └── ProductsEditor          (shared with dashboard)
│   ├── DeviceFrame → Storefront(preview)
│   ├── PublishSuccess              links, copy, WhatsApp share
│   └── RecentStores                gallery from GET /api/stores
├── StorefrontPage → Storefront     PRD: Storefront for customers
│   ├── StoreHeader (search)        ├── StatusBadge (getOpenStatus)
│   ├── Hero (CTAs)                 ├── CategoryChips
│   ├── ProductGrid → ProductCard (QuantityStepper, Ask on WhatsApp)
│   ├── InfoSection: HoursCard, ContactCard, MapCard, InquiryForm
│   └── CartBar (useCart → buildWhatsAppOrderUrl)
├── DashboardPage                   PRD: Owner dashboard
│   ├── KeyGate                     edit-key prompt when unknown
│   ├── Tabs (layoutId underline)
│   ├── OverviewTab / ProductsTab (+VoiceAdd) / DetailsTab / InquiriesTab
└── NotFoundPage
Shared: ui/ (Button, Field, Toast, Badge), lib/ (api, hours, whatsapp, format, storage, productVisual)
```

### Server (`server/src`)
- **`app.js`**: `createApp({ db, generator })` builds the Express app (JSON limit, routes, error handler, static client in production). Injectable for tests.
- **`index.js`**: opens the DB, seeds the demo store and listens.
- **`db.js`**: `openDb(path)` creates tables and returns a repository: `createStore`, `getStore`, `listStores`, `updateStore`, `addInquiry`, `listInquiries`, `setInquiryStatus`.
- **`routes/generate.js`**, **`routes/stores.js`**: HTTP handlers with Zod validation.
- **`ai/schema.js`**: `StoreSchema` (Zod) for the stored and validated shape, and `LlmStoreSchema` for the structured-output target.
- **`ai/claudeParser.js`**: `parseWithClaude(transcript)`.
- **`ai/ruleParser.js`**: `parseWithRules(transcript)`, deterministic extraction.
- **`ai/normalize.js`**: `normalizeStore(raw)` → `{ store, warnings }`.
- **`ai/catalog.js`**: category → colour, tagline and emoji tables shared by both engines.
- **`ai/pipeline.js`**: `generateStore(transcript, { engine })` → `{ store, engine, warnings }`.
- **`seed.js`**: demo store "Maya's Bakery" with edit key `demo`.

## State Management
- **Builder:** local `useState` holds `transcript`, `phase` (`idle | listening | generating | review | published`), `draft` (the store object), `warnings`, `engine` and `published`. Edits replace `draft` immutably, and the preview reads `draft` directly with no sync step.
- **Storefront:** `useCart(slug)` is a reducer persisted to `localStorage["vaani:cart:<slug>"]`. Search and category are local state, and `useNow(60_000)` re-renders the status every minute.
- **Dashboard:** `store` is the server copy and `draft` is the working copy. `dirty = JSON.stringify(draft) !== JSON.stringify(store)`. The edit key comes from `localStorage["vaani:keys"]`.
- No global store library is used; each page owns its state, and shared editors receive `value`/`onChange` props.

## Data Model

### Store config (JSON, validated by `StoreSchema`)
```json
{
  "storeName": "Maya's Bakery",
  "tagline": "Fresh from our oven, every morning",
  "category": "Bakery",
  "primaryColor": "#D97706",
  "currency": "INR",
  "contact": { "phone": "+91 98765 43210", "whatsapp": "919876543210", "email": "hello@mayas.in", "address": "MG Road, Pune" },
  "hours": { "open": "09:00", "close": "20:00", "days": "Mon-Sat" },
  "products": [
    { "id": "p_sourdough", "name": "Sourdough", "price": 150, "category": "Breads", "description": "Slow-fermented, crackly crust.", "image": "🍞" }
  ],
  "social": { "instagram": "mayasbakery", "facebook": "" }
}
```
- `hours.days` is a human string parsed by `parseDays()`: `Daily`, `Mon-Sat`, `Mon-Fri`, `Mon, Wed, Fri` or `Tue-Sun`.
- `image` is either an emoji (rendered on a brand-tinted gradient tile) or an `https://` URL (rendered as a photo).
- `whatsapp` is digits only, with the country code (defaults to `91` for 10-digit Indian numbers).

### SQLite tables
```sql
CREATE TABLE stores (
  slug        TEXT PRIMARY KEY,
  edit_token  TEXT NOT NULL,
  config      TEXT NOT NULL,          -- JSON StoreSchema
  engine      TEXT NOT NULL,          -- 'claude' | 'rules' | 'manual'
  transcript  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  store_slug  TEXT NOT NULL REFERENCES stores(slug) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',   -- 'new' | 'done'
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_inquiries_store ON inquiries(store_slug, created_at DESC);
```
The database lives in `DATA_DIR/vaani.db` (default `server/data/`), so it persists across restarts. Edit keys and the cart live in the browser and survive reloads on the same device.

## API Spec
Base path `/api`. JSON in and out. Errors use the shape `{ "error": { "code": "string", "message": "string", "details"?: any } }`.

```yaml
openapi: 3.0.3
info: { title: Vaani API, version: 1.0.0 }
paths:
  /api/health:
    get:
      summary: Liveness + active AI engine
      responses: { '200': { description: '{ ok: true, aiEngine: "claude" | "rules" }' } }
  /api/generate:
    post:
      summary: Transcript → store config (not persisted)
      requestBody: { content: { application/json: { schema: { type: object, required: [transcript],
        properties: { transcript: { type: string, minLength: 10, maxLength: 5000 },
                      engine: { type: string, enum: [auto, rules] } } } } } }
      responses:
        '200': { description: '{ store: Store, engine: "claude"|"rules", warnings: string[] }' }
        '400': { description: VALIDATION_ERROR }
  /api/stores:
    get:
      summary: Recently published stores (public summary, max 12)
      responses: { '200': { description: '{ stores: [{ slug, storeName, tagline, category, primaryColor, productCount, createdAt }] }' } }
    post:
      summary: Publish a store
      requestBody: { content: { application/json: { schema: { type: object, required: [store],
        properties: { store: { $ref: '#/components/schemas/Store' }, transcript: { type: string }, engine: { type: string } } } } } }
      responses: { '201': { description: '{ slug, editToken, store }' }, '400': { description: VALIDATION_ERROR } }
  /api/stores/{slug}:
    get:
      summary: Public store config
      responses: { '200': { description: '{ slug, store, updatedAt }' }, '404': { description: NOT_FOUND } }
    put:
      summary: Replace store config (owner)
      parameters: [{ in: header, name: x-edit-token, required: true, schema: { type: string } }]
      responses: { '200': { description: '{ slug, store, updatedAt }' }, '401': { description: UNAUTHORIZED } }
  /api/stores/{slug}/owner:
    get:
      summary: Owner view — store + engine + inquiry counts (validates the edit key)
      parameters: [{ in: header, name: x-edit-token, required: true, schema: { type: string } }]
      responses: { '200': { description: '{ slug, store, engine, createdAt, updatedAt, inquiries: { total, open } }' }, '401': { description: UNAUTHORIZED } }
  /api/stores/{slug}/inquiries:
    post:
      summary: Customer inquiry (public)
      requestBody: { content: { application/json: { schema: { type: object, required: [name, contact, message],
        properties: { name: { type: string, maxLength: 80 }, contact: { type: string, maxLength: 120 }, message: { type: string, maxLength: 1000 } } } } } }
      responses: { '201': { description: '{ inquiry }' } }
    get:
      summary: List inquiries (owner)
      parameters: [{ in: header, name: x-edit-token, required: true, schema: { type: string } }]
      responses: { '200': { description: '{ inquiries: Inquiry[] }' }, '401': { description: UNAUTHORIZED } }
  /api/stores/{slug}/inquiries/{id}:
    patch:
      summary: Set inquiry status (owner)
      requestBody: { content: { application/json: { schema: { type: object, properties: { status: { type: string, enum: [new, done] } } } } } }
      responses: { '200': { description: '{ inquiry }' } }
```

## Integration Contracts

### Claude structured output
- **Call:** `client.messages.parse({ model: "claude-opus-5-5", max_tokens: 8000, output_config: { effort: "low", format: zodOutputFormat(LlmStoreSchema) }, system, messages: [{ role: "user", content: transcript }] })`.
- **Contract:** `parsed_output` matches `LlmStoreSchema` (all fields required, empty string when unknown). It is then passed to `normalizeStore()`.
- **Failure handling:** a missing key, network error, `stop_reason` of `refusal`/`max_tokens`, null `parsed_output`, or a 20 s timeout all fall back to `parseWithRules()`, adding the warning "AI engine unavailable — used offline parser."
- **Cost:** roughly 1.5K input and 0.8K output tokens per store, about $0.02 at Opus 5.5 pricing.

### WhatsApp deep link
`https://wa.me/<digits>?text=<urlencoded message>`. This is the universal link: it opens the app on mobile and WhatsApp Web on desktop. No API key is needed.

### Google Maps embed
`https://www.google.com/maps?q=<urlencoded address>&output=embed` in a lazy-loaded `<iframe>`. Directions use `https://www.google.com/maps/dir/?api=1&destination=<address>`. No API key is needed.

### Web Speech API
`window.SpeechRecognition || window.webkitSpeechRecognition` with `continuous = true` and `interimResults = true`. The `lang` is selectable. It's supported in Chrome, Edge and Safari; feature detection hides the mic elsewhere.

## File Structure
```
vaani/
├── LICENSE                     # MIT
├── README.md                   # overview, setup, judging guide, disclosures
├── scope.md · prd.md · spec.md # planning docs (Devpost Learn skill pack)
├── package.json                # npm workspaces + root scripts (dev, build, start, test)
├── .env.example
├── devpost/                    # skill-pack workspace (copies of planning docs, learner profile)
├── server/
│   ├── package.json
│   ├── src/
│   │   ├── index.js            # boot: db, seed, listen
│   │   ├── app.js              # express app factory
│   │   ├── db.js               # node:sqlite repository
│   │   ├── seed.js             # demo store
│   │   ├── routes/generate.js
│   │   ├── routes/stores.js
│   │   └── ai/
│   │       ├── schema.js       # Zod StoreSchema + LlmStoreSchema
│   │       ├── catalog.js      # category themes, emoji map
│   │       ├── ruleParser.js   # offline parser
│   │       ├── claudeParser.js # Claude structured output
│   │       ├── normalize.js    # validation + defaults + warnings
│   │       └── pipeline.js     # engine selection + fallback
│   └── test/                   # node:test suites
└── client/
    ├── package.json · vite.config.js · index.html
    └── src/
        ├── main.jsx · App.jsx · index.css
        ├── pages/              # Builder, Storefront, Dashboard, NotFound
        ├── components/         # storefront/, builder/, dashboard/, ui/
        ├── hooks/              # useSpeechRecognition, useCart, useNow
        └── lib/                # api, hours, whatsapp, format, storage, productVisual (+ tests)
```

## External Services and Dependencies
| Service | Required? | Calls | Keys | Cost / limits |
|---|---|---|---|---|
| Anthropic Claude API | Optional | `POST /v1/messages` via SDK `messages.parse` | `ANTHROPIC_API_KEY` | ≈ $0.02 per generation; per-org rate limits |
| WhatsApp (`wa.me`) | No key | Deep link only | none | free |
| Google Maps embed | No key | iframe URL | none | free embed |
| Google Fonts | No key | CSS link | none | free |
| Web Speech API | Browser | in-browser | none | free; Chrome sends audio to Google's speech service |

## Important Failure Modes
- **The Claude API is unavailable, slow or has no key** → the offline rule parser produces the store instantly and an info badge says "Offline parser".
- **Speech recognition is unsupported or the mic is denied** → the mic is replaced by an explanatory note, and the textarea plus sample prompts keep the flow working.
- **The transcript is missing key facts** → defaults are applied (name "My Shop", hours 09:00–21:00 daily), amber warnings tell the owner exactly what to add, and the preview still renders.
- **The edit key is lost (new device)** → the dashboard shows a key gate. The owner can paste the key from the publish screen; it's also shown on the success card to save.

## What Was Simplified and Why
- **Per-store edit key** instead of user accounts. It removes signup friction; full accounts would need auth, email verification and recovery.
- **One adaptive storefront page** instead of generated HTML/CSS per store. It's consistent quality and an instant preview; per-store code generation would be slower and riskier.
- **SQLite file** instead of hosted Postgres. Zero setup for judges; the repository layer in `db.js` isolates it for a later swap.
- **Emoji product tiles** instead of image upload. No storage service needed; the `image` field already accepts URLs.
- **Client-side open/closed** status. It uses the visitor's local time, which is correct when the visitor is near the shop (the core case). Store timezones are a later addition.

## Decisions and Open Issues
- **Node + Express instead of FastAPI**, so one language spans the whole repo and the build is simpler.
- **Claude Opus 5.5 at `effort: "low"`.** Extraction is a simple task, and low effort keeps latency down; the schema constraint guarantees shape.
- **The rule parser is English-first.** Hindi/Hinglish transcripts degrade to defaults plus warnings; the Claude path handles them. This was flagged as a learner uncertainty: *how robust can regex parsing be?* It's settled by the parser test suite in `server/test/ruleParser.test.js`, which covers the three sample personas and edge cases (₹/Rs/rupees, 12h/24h times, overnight hours, missing data).
- **Open (from PRD):** support for Hindi number words in the offline parser can wait.

# Vaani — Speak your shop into existence 🎙️🛍️

**Vaani turns a shop owner's spoken description into a beautiful, mobile-first storefront website with a product catalog, live "Open now" status, map, contact form and WhatsApp ordering. No coding, templates or forms needed.**

> *"I run Maya's Bakery on MG Road, open 9 to 8, Monday to Saturday. We sell sourdough for ₹150 and croissants for ₹80. WhatsApp 98765 43210."*
> → about 3 seconds later → a live, branded store that customers can browse, search and order from on WhatsApp.

`vaani` (वाणी) means *voice* or *speech* in Hindi and Sanskrit.

---

## The problem

> **Why can't shop owners create websites without coding knowledge?**

Millions of neighbourhood retailers (bakeries, boutiques, kirana stores, florists) run their business on WhatsApp and word of mouth, and they have no website. Tools like WordPress, Wix and Shopify still assume the owner can *operate software*: pick from hundreds of templates, write "About Us" copy, structure a catalog and configure settings. That takes hours of work in an unfamiliar interface for someone who has never used a laptop for business.

Their customers keep asking the same questions: *Are you open? What's the price of the plum cake? Where are you exactly?*

## The solution

Vaani makes **the owner's own words the entire interface**:

1. **Speak (or type).** Tap the mic and describe the shop the way you'd tell a new customer. The browser transcribes it live (Web Speech API, with English (India), Hindi and English (US) options).
2. **AI parsing.** An LLM pipeline (Claude with structured JSON output) turns the messy transcript into a validated store configuration: name, category, brand colour, hours, contact, address and products with prices. A deterministic **offline parser** means it works even with no API key or internet.
3. **Live preview.** The storefront renders instantly in a phone or desktop frame. Every detail is editable, and the preview updates as you type.
4. **Publish and share.** One tap gives you a public link plus a private edit key. Share it on WhatsApp in one more tap.
5. **Customers order.** They see whether you're open right now, search and filter products, build a cart, and send a neatly formatted order straight to your WhatsApp.
6. **Keep it fresh by voice.** In the owner dashboard, say *"add plum cake for 450 and walnut brownie for 90"* and the products appear.

### Features at a glance

| For the shop owner | For customers |
|---|---|
| 🎙️ Voice-to-website with live transcript | 🟢 Live **Open now / Closing soon / Closed** status (handles overnight and 24×7 hours) |
| ✨ Claude AI parsing with an automatic offline fallback | 🔎 Instant product search and category filters |
| 👀 Live phone/desktop preview, everything editable | 🛒 Cart with quantity steppers that persists across reloads |
| 🚀 One-tap publish, shareable link, WhatsApp share | 💬 **Order on WhatsApp** with an itemised message and total |
| 🗣️ Add products by voice from the dashboard | ❓ "Ask on WhatsApp" for any single product |
| 🎨 Brand colour picker (auto-adjusted for readable contrast) | 🗺️ Embedded Google Map and one-tap directions |
| 📥 Inquiry inbox with WhatsApp/email reply shortcuts | ✉️ Contact form that lands in the owner's dashboard |
| 🔑 No account needed: a private edit key per store | 🌙 Light and dark mode, accessible and mobile-first |

---

## Quick start

**Requirements:** Node.js **22.13 or newer** (tested on Node 24) and npm. There's nothing else to install: the database is Node's built-in SQLite.

```bash
git clone <your-repo-url> vaani && cd vaani
npm install
npm run dev
```

- App: **http://localhost:5173**
- API: http://localhost:8787 (Vite proxies `/api` to it)

On first boot a demo store is seeded at **http://localhost:5173/s/mayas-bakery**. Its dashboard is at `/dashboard/mayas-bakery`, and the edit key is `demo`.

### Enable the Claude AI engine (optional)

Without an API key, Vaani uses its offline rule-based parser and every feature still works. To use Claude for richer parsing (Hinglish, numbers as words, nicer taglines and descriptions):

```bash
cp .env.example .env
# then set ANTHROPIC_API_KEY=sk-ant-...
```

Restart the server. The header badge changes from **Offline AI parser** to **Claude AI engine**. If Claude is ever unreachable, requests fall back to the offline parser automatically, and the owner sees a notice.

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(unset)* | Enables Claude parsing |
| `CLAUDE_MODEL` | `claude-opus-5-5` | Override the model |
| `AI_ENGINE` | `auto` | Set to `rules` to force the offline parser |
| `PORT` | `8787` | API / production server port |
| `DATA_DIR` | `./server/data` | Where `vaani.db` lives |

### Production build

```bash
npm run build   # builds the React app into client/dist
npm start       # one Node process serves the API and the app on http://localhost:8787
```

This deploys to any Node host (Render, Railway, Fly.io). Use `npm install && npm run build` as the build command and `npm start` as the start command, and mount a persistent disk at `DATA_DIR`.

---

## Testing & evaluation guide for judges

### Automated tests

```bash
npm test
```

This runs **25 tests** with Node's built-in test runner:

- **`server/test/ruleParser.test.js`**: the AI parsing engine. It covers the bakery, kirana and boutique personas, ₹/Rs/rupees/$ prices, `1,200` separators, per-kg units, 12h/24h/overnight/24×7 hours, "closed on Tuesday", spoken emails, missing-data warnings, LLM-output repair (bad colours, duplicates, string prices) and the **Claude → offline fallback**.
- **`server/test/api.test.js`**: the end-to-end API journey: generate → publish → public view (edit key never leaked) → unauthorised edit rejected → owner edit → customer inquiry → owner inbox → mark done.
- **`client/src/lib/hours.test.js`**: Open/Closed logic (closing soon, closed days, overnight, 24h), the WhatsApp order message format and currency formatting.

### Five-minute manual walkthrough

1. Open **http://localhost:5173** in **Chrome or Edge** (for voice input).
2. Tap the **mic** and say something like:
   *"My shop is called Rangoli Boutique on Linking Road Bandra. We're open 11 am to 9 pm, closed on Tuesday. Cotton kurtis for 899 rupees, silk saree for 4500. WhatsApp 91234 56789."*
   Or tap one of the **Try:** chips (Bakery, Boutique, Kirana store).
3. Tap **Build my store** and watch the four-step generation.
4. On the review screen, open **Shop details** and change the brand colour. The preview re-themes instantly. Switch between **Phone** and **Desktop**, and add something to the cart inside the preview.
5. Tap **Publish storefront**, then **Open storefront**.
6. On the storefront, check the **Open now** badge, search for "saree", filter by category, add two items and tap **Order on WhatsApp**. WhatsApp (or WhatsApp Web) opens with the itemised order.
7. Scroll to **Send us a message** and submit the form.
8. Go back and tap **Manage store** (or open `/dashboard/<slug>`). The message is in **Inquiries**. On **Products**, type or say *"add silk dupatta for 1200"*, then **Save**.
9. Resize the browser to phone width and toggle your OS dark mode. Everything adapts.

> **Voice note:** the Web Speech API works in Chrome, Edge and Safari. Firefox shows a friendly note, and typing works everywhere.

---

## Architecture

```
┌───────────────────────── Browser (React + Vite) ─────────────────────────┐
│  Builder  ──mic──▶ Web Speech API ──transcript──┐                        │
│     │                                           ▼                        │
│     │                               POST /api/generate                   │
│     ▼                                           │                        │
│  Live preview ◀── store JSON ◀──────────────────┘                        │
│  <Storefront store={draft} preview/>   (same component as public page)  │
│     │ Publish                                                            │
│     ▼                                                                    │
│  POST /api/stores ─▶ { slug, editToken }   /s/:slug  /dashboard/:slug    │
└──────────────────────────────────────────────────────────────────────────┘
                 │
┌──────────── Node + Express (server/) ────────────┐
│ routes ─▶ ai/pipeline.js                         │
│            ├─ claudeParser.js  (Claude, Zod      │      ┌──────────────┐
│            │   structured output) ───────────────┼────▶ │ Anthropic API│
│            ├─ ruleParser.js   (offline fallback) │      └──────────────┘
│            └─ normalize.js    (validate, repair, │
│                 contrast-safe colour, warnings)  │
│ db.js ─▶ node:sqlite  (stores, inquiries)        │
└──────────────────────────────────────────────────┘
```

- **One store schema, one gate.** Both AI engines and every owner edit pass through `normalizeStore()` and the Zod `StoreSchema`. The storefront never receives data it can't render.
- **The storefront is a renderer, not generated code.** A single adaptive React page renders any store config, which makes previews instant and quality consistent. It uses **CSS container queries**, so the same component lays out correctly in the builder's phone frame and full-screen.
- **Security:** 192-bit edit keys compared in constant time and never returned by public endpoints, Zod validation on every write, a 100 KB body limit, per-IP rate limits, and no secrets in the client.

The full design is in [`spec.md`](spec.md): an OpenAPI spec, the SQL schema, the component hierarchy, state management and failure modes.

### Project structure

```
├── scope.md · prd.md · spec.md   Planning docs (Devpost Learn skill pack)
├── LICENSE                       MIT
├── server/
│   ├── src/ai/                   schema, catalog, ruleParser, claudeParser, normalize, pipeline, hours
│   ├── src/routes/               generate.js, stores.js
│   ├── src/{app,db,index,seed}.js
│   └── test/
├── client/
│   └── src/
│       ├── pages/                Builder, Storefront, Dashboard, NotFound
│       ├── components/           builder/, storefront/, dashboard/, editors/, ui/
│       ├── hooks/                useSpeechRecognition, useCart, useNow
│       └── lib/                  api, hours, whatsapp, format, storage, constants (+ tests)
├── devpost/                      Skill-pack workspace (learner profile + doc copies)
└── .agents/skills/               Devpost Learn skill pack (installed via npx skills)
```

---

## Planning documents (Devpost Learn skill pack)

The project was planned with the [Devpost Learn "AI Basics" skill pack](https://github.com/challengepost/learn-ai-basics), installed with:

```bash
npx skills add challengepost/learn-ai-basics --all -y
```

Following the pack's templates (`2-scope`, `3-prd`, `4-spec`):

- [`scope.md`](scope.md) covers the unique kernel, persona, core loop, POC boundary and explicit cuts.
- [`prd.md`](prd.md) covers personas, the problem statement, the core journey, Gherkin user stories, functional and non-functional requirements, and success metrics.
- [`spec.md`](spec.md) covers system architecture, the OpenAPI spec, the database schema, the component hierarchy, state management and integration contracts.

The root copies are canonical. `devpost/` mirrors them so the pack's later skills (`5-build`, `6-ship`) can find them.

---

## Third-Party Disclosures & Frameworks

Vaani was built during the hackathon. It uses the following pre-existing open-source libraries, services and tools. No starter template or boilerplate repository was used; all application code was written for this project.

**Frontend**
- [React](https://react.dev) 18 and [React DOM](https://react.dev) (MIT): UI library
- [React Router](https://reactrouter.com) 6 (MIT): client-side routing
- [Vite](https://vite.dev) 8 and [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) (MIT): dev server and bundler
- [Tailwind CSS](https://tailwindcss.com) 4 and `@tailwindcss/vite` (MIT): styling
- [Framer Motion](https://motion.dev) (MIT): animations and micro-interactions
- [Lucide React](https://lucide.dev) (ISC): icons
- [Google Fonts](https://fonts.google.com): *Fraunces* and *Plus Jakarta Sans* (SIL Open Font License)

**Backend**
- [Node.js](https://nodejs.org): runtime, including the built-in `node:sqlite` (SQLite) and `node:test`
- [Express](https://expressjs.com) 5 (MIT): HTTP server
- [Zod](https://zod.dev) 4 (MIT): schema validation and the structured-output schema
- [Anthropic TypeScript/JavaScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) (MIT): calls Claude (`claude-opus-5-5`) with structured outputs

**Browser APIs and external services**
- [Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API) (`SpeechRecognition`): browser-native speech-to-text. In Chrome, audio is processed by Google's speech service.
- [Anthropic Claude API](https://platform.claude.com/docs): optional AI parsing engine
- [WhatsApp click-to-chat](https://faq.whatsapp.com/5913398998672934) (`wa.me` links): ordering and inquiries, no API key
- [Google Maps embed](https://www.google.com/maps) (keyless `output=embed` iframe) and directions links

**Dev tooling**
- [concurrently](https://github.com/open-cli-tools/concurrently) (MIT): runs the API and web dev servers together
- [Devpost Learn AI Basics skill pack](https://github.com/challengepost/learn-ai-basics): planning workflow and document templates
- AI coding assistant: [Claude Code](https://claude.com/claude-code) was used to help write code and documentation

Emoji are rendered with the visitor's system emoji font; no emoji images are bundled.

---

## License

[MIT](LICENSE) © 2026 Keya Chaudhary and Vaani contributors.

---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can describe a shop and see a store built from it**
  Becomes usable: Typing (or picking a sample) on the builder and pressing Build turns the description into a store preview with name, hours, contact and priced products, using the offline parser.
  Why now: This is the unique kernel (spoken words become a working store). Proving it first means every later slice builds on something real. Bootstrapping (npm workspaces, Express, Vite, Tailwind) lives inside it.
  PRD ref: `prd.md > The Core Journey` (steps 1 to 4), `prd.md > Features and Behavior` (AI store generation)
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > File Structure`
  Build: Scaffold server and client workspaces; write `server/src/ai/ruleParser.js`, `normalize.js`, `schema.js`, `catalog.js`, `hours.js`, `pipeline.js`; add `POST /api/generate`; build the builder page and the storefront renderer used as a live preview.
  Verify (mechanical): `npm test -w server` passes the bakery, kirana and boutique parser tests; posting a sample transcript to `/api/generate` returns a schema-valid store.
  Learner check: Open the builder, tap the Kirana sample, press Build my shop, and check the preview shows the right shop name, timings and prices.
  Commit: `Add transcript-to-store pipeline and live preview`

- [x] **2. Claude reads the description when a key is set, with an automatic fallback**
  Becomes usable: With `ANTHROPIC_API_KEY` in `.env`, descriptions are parsed by Claude with structured output; if Claude fails, the offline parser takes over and the owner sees a notice.
  Why now: The AI engine is the riskiest dependency, so its failure path is proven right after the kernel works.
  PRD ref: `prd.md > Features and Behavior` (AI store generation)
  Spec ref: `spec.md > Integration Contracts` (Claude structured output), `spec.md > Important Failure Modes`
  Build: `server/src/ai/claudeParser.js` with `messages.parse` and a Zod schema; engine selection and fallback in `pipeline.js`.
  Verify (mechanical): Test `pipeline falls back to rules when Claude fails` passes; `/api/health` reports the active engine.
  Learner check: Add your API key, restart, build a shop, and confirm the review screen says "Read by Claude AI".
  Commit: `Add Claude engine with offline fallback`

- [x] **3. A shop can be put online and opened by anyone**
  Becomes usable: Publishing saves the shop in SQLite and gives a public link and a private edit key; the shop survives a server restart.
  Why now: Persistence and the public URL turn a preview into something shareable, which the rest of the journey depends on.
  PRD ref: `prd.md > Features and Behavior` (Review, edit and publish), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Data Model` (SQLite tables), `spec.md > API Spec`
  Build: `server/src/db.js` on `node:sqlite`, `server/src/routes/stores.js` (publish, view, edit with key), demo seed in `server/src/seed.js`.
  Verify (mechanical): API journey test (`full journey: generate, publish, view, edit, inquiry`) passes; the edit key is never returned by public endpoints.
  Learner check: Publish a shop, open its link in a private window, restart the server, and open it again.
  Commit: `Persist shops and add public shop pages`

- [x] **4. Customers can browse, check if the shop is open and order on WhatsApp**
  Becomes usable: Live open or closed sign, product search and category filters, a cart, and a WhatsApp message with the itemised order and total.
  Why now: This is the customer half of the core journey and the main source of impact.
  PRD ref: `prd.md > Features and Behavior` (Storefront for customers)
  Spec ref: `spec.md > Components` (Storefront), `spec.md > Integration Contracts` (WhatsApp deep link)
  Build: `client/src/lib/hours.js` (`getOpenStatus`), `client/src/lib/whatsapp.js` (`buildOrderMessage`), `client/src/hooks/useCart.js`, storefront components.
  Verify (mechanical): `npm test -w client` passes open or closed, overnight, 24 hour and WhatsApp message tests.
  Learner check: Open the demo shop, add two items, press Send order and check the WhatsApp message.
  Commit: `Add open status, search, cart and WhatsApp ordering`

- [x] **5. Customers can send a message and the owner can manage the shop**
  Becomes usable: Contact form on every shop; an owner dashboard to edit details and products, add products by voice, and read and close messages.
  Why now: Completes the return loop from `scope.md > The Core Loop`: owners keep their shop fresh by voice.
  PRD ref: `prd.md > Features and Behavior` (Owner dashboard)
  Spec ref: `spec.md > API Spec` (inquiries, owner endpoints)
  Build: Inquiry routes, `DashboardPage.jsx`, `VoiceAdd.jsx`, `InquiriesList.jsx`, shared editors.
  Verify (mechanical): API journey test covers inquiry create, owner list and mark done; headless Chrome run of the dashboard shows no console errors.
  Learner check: Send a message from the demo shop, open its dashboard with key `demo`, and mark the message done.
  Commit: `Add contact form and owner dashboard`

- [x] **6. The app looks hand-made: Signboard for Vaani, Leaf themes for shops**
  Becomes usable: Vaani's own screens use the Signboard look; generated shops use the Leaf template with six owner-chosen colour themes, outline product icons, and a printable QR counter card. No emoji or em dashes anywhere.
  Why now: Learner feedback at the early checkpoint said the first UI "looked AI made". Design is the top judging criterion.
  PRD ref: `prd.md > Look and Feel`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Data Model` (`theme`, `image`)
  Build: New tokens in `client/src/index.css`, `client/src/lib/themes.js`, `client/src/lib/icons.jsx`, `ThemePicker.jsx`, `CounterCard.jsx`; server `theme` and icon fields with `upgradeStore()` for older shops.
  Verify (mechanical): Test `generated stores never contain emoji or em dashes` passes; legacy upgrade test passes; headless screenshots of every screen reviewed.
  Learner check: Build a shop, switch its colour theme on the review screen, publish, and print the counter card.
  Commit: `Redesign: Signboard screens, Leaf storefront themes, outline icons`

- [x] **7. Starting the app fails loudly instead of silently**
  Becomes usable: `npm run dev` stops with a clear message if an old server still holds a port; `npm run stop` frees the ports; the home page shows an error if it cannot reach the API.
  Why now: At the final checkpoint the learner could not see any shops because a leftover server blocked the API.
  PRD ref: `prd.md > Non-Functional Requirements` (Reliability)
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: `scripts/check-ports.mjs` as `predev`, `kill-port` as `npm run stop`, listen-error handling in `server/src/index.js`, error state in `RecentStores.jsx`.
  Verify (mechanical): Port check exits 1 with a busy port and 0 after `npm run stop`; a second server on a busy port exits with the port-in-use message.
  Learner check: Run `npm run stop`, then `npm run dev`, open http://localhost:5173 and confirm the demo shop and your shops appear.
  Commit: `Make dev start-up fail loudly on busy ports`

- [x] **8. Owners can upload product photos and a shop logo**
  Becomes usable: In the product picture picker and in Shop details, owners upload a photo from their phone or computer; it is shrunk in the browser, stored by the server, and shown on the shop (logo in the header, product photos on cards and in the hero).
  Why now: Requested by the learner after the redesign; real photos make shops look like the owner's own.
  PRD ref: `prd.md > Features and Behavior` (Owner dashboard), `prd.md > Deferred From the POC` (image upload, now built)
  Spec ref: `spec.md > API Spec` (`/api/uploads`), `spec.md > Data Model` (`logo`, `image`)
  Build: `server/src/routes/uploads.js` (byte-sniffed JPEG, PNG, WebP up to 2 MB, random names), static `/uploads`, `PHOTO` pattern in `schema.js`, `client/src/lib/image.js` (`resizeImage`), `ImageUpload.jsx`, logo in `DetailsEditor.jsx` and `Storefront.jsx`.
  Verify (mechanical): Test `image upload: stores real images, serves them, rejects fakes` passes; headless Chrome uploaded a logo and a product photo through the review screen, published, and the shop rendered both.
  Learner check: On the review screen upload a logo and one product photo, publish, and open the shop on your phone.
  Commit: `Add product photo and logo uploads`

## Hands-on Checkpoints

- [x] Early usable behavior explored: after slice 5 the learner tried the running app and said it looked AI made; this produced the design exploration and slice 6.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Shops and demo shop not visible: fixed in slice 7 (leftover server on port 8787, Vite not running). Verified by loading `/s/mayas-bakery` and the shop list from the running API.
- [ ] Learner retries the shop list and demo shop after `npm run stop` and `npm run dev`
- [ ] Final review complete: feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete: guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed: offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Not yet done. Suggested route: follow "Build my shop" through the three stops in `devpost/app-map.html`.
Route and stops: `client/src/pages/BuilderPage.jsx` (`generate`), `server/src/ai/pipeline.js` (`generateStore`), `client/src/components/storefront/Storefront.jsx` (`Storefront`). Reference route only until toured.
Edit outcome: Not yet offered.
Reflection: Not yet offered.
Activity mode: Pending.

## Revisions

- Slices were committed together rather than one commit per slice: the build ran before the checklist existed, so slices 1 to 5 are in "First commit" and slices 6 and 7 are uncommitted at the time of writing.
- The builder UI and storefront were redesigned (slice 6): learner feedback showed the first design read as AI generated, so `prd.md > Look and Feel` and `spec.md > Look and Feel` now describe the Signboard and Leaf systems.
- `primaryColor` was replaced by a `theme` field and emoji product images by outline icon keys: the learner asked for no emoji and for owners to choose colours, so the data model changed and older shops are upgraded on read.
- Image upload moved from deferred to built (slice 8): the learner asked for product photos and a logo. Uploads are open before publishing, so they are rate limited and type-checked; unused files are not cleaned up yet.
- Dark mode was dropped: both new visual systems are designed as light themes.
- A dev start-up check and `npm run stop` were added (slice 7): on Windows, Ctrl+C can leave the API running, which silently blocked the next start.

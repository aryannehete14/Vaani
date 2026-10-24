---
doc: prd
status: approved
---

# Vaani: Product Requirements

Vaani lets small retail shop owners (bakeries, boutiques, kirana stores) create a working, mobile-first storefront by describing their shop in their own words. No coding, no templates and no forms come first.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## Problem Statement
About 63 million micro, small and medium enterprises operate in India, and most neighbourhood retailers have no website. Existing builders (WordPress, Wix, Shopify) assume the owner can choose templates, write copy, structure a catalog and configure settings. That's hours of work in an unfamiliar interface. The owner's real workflow is already conversational: customers ask on WhatsApp, and the owner answers. Vaani meets them there. **If you can describe your shop, you can have a website.**

## User Personas

| Persona | Who | Goal | Frustration today |
|---|---|---|---|
| **Meera, the owner** (primary) | 46, runs a bakery; Android + WhatsApp fluent; never used a site builder | Customers can see products, prices and hours without calling | Wix asked for templates and copy; she gave up |
| **Rahul, the customer** | 29, lives nearby; orders from his phone | Know if the shop is open and what it sells, then order quickly | Has to call or message and wait for a price list photo |
| **Arjun, the helper** | Owner's nephew; tech-comfortable | Fix a typo or price for his aunt in a minute | Every tool needs a login and a tutorial |

## The Core Journey
1. **Arrive.** The owner opens Vaani. The hero says "Speak your shop into existence" and shows a large mic button and three example prompts.
2. **Describe.** They tap the mic and speak, and the words appear live as they talk. Alternatively they type, or tap a sample prompt.
3. **Generate.** They tap **Build my store**. A four-step progress animation runs (Listening → Understanding → Designing → Ready) while the AI parses the transcript.
4. **Review.** A split view appears. On the left, "What we understood" shows the name, category, hours, contact details and products, with the engine badge (Claude AI or Offline parser). On the right, a live storefront preview in a phone or desktop frame.
5. **Adjust.** They edit any field inline, or tap **Speak again** to start over.
6. **Publish.** They tap **Publish storefront**. They get a public link (`/s/maya-s-bakery`), a private dashboard link, and buttons to copy or share on WhatsApp.
7. **Customers use it.** A customer opens the link and sees an **Open now · closes 8:00 PM** badge. They search "sourdough", add items to the cart and tap **Order on WhatsApp**. WhatsApp opens with the itemised order and total, addressed to the shop.
8. **Return.** Later the owner opens the dashboard and says "add plum cake for ₹450 and walnut brownie for ₹90". The products appear, they save, and the storefront updates.

**Success** means a published storefront that a customer can browse and order from, created in under two minutes with zero typing required.

## Screens and Layout
- **Builder (`/`).** Hero with mic and textarea, sample chips, then a review state with an editable summary on the left and a device-framed live preview on the right. A "Recently published" gallery sits below. On mobile, review and preview stack vertically with a sticky publish bar.
- **Storefront (`/s/:slug`).** A sticky header (logo initial, name, search), a brand-gradient hero with tagline, status badge and CTAs, category chips, a product grid, and an info section with hours, contact, map and inquiry form. Footer at the bottom. A floating cart bar appears once anything is in the cart.
- **Owner dashboard (`/dashboard/:slug`).** Header with store name, **View live** and **Save**. Animated tabs: **Overview** (stats and quick links), **Products** (inline table/cards with add, edit, delete, plus voice add), **Details** (name, tagline, category, colour, hours, contact), and **Inquiries** (list with mark-done). An edit-key gate shows if the key is unknown.
- **Not found.** A friendly 404 with a link back to the builder.

## Look and Feel
- **Two looks, on purpose.** Vaani's own screens (builder, publish, dashboard) use a **Signboard** style inspired by hand-painted Indian shop signs: bottle green and mustard, tall condensed capitals (Archivo), thick ink borders and hard offset shadows. The stores it generates use a calm **Leaf** style: cream ground, soft colour panels, organic rounded shapes, a serif for headings (Lora) and a friendly sans for text (Nunito Sans).
- **Store colours:** six Leaf themes (Sage, Clay, Indigo, Marigold, Plum, Teal). The AI pre-selects one from the shop type (Clay for bakeries, Indigo for boutiques, Teal for chemists) and the owner can switch at any time. Every button colour passes WCAG AA with white text.
- **Product pictures:** outline icons on soft circular tiles (39 icons, picked automatically per product) so every product looks intentional without photos. Owners can swap in a photo URL.
- **Motion:** Framer Motion for ink rings around the mic while listening, a swinging "now online" signboard, staggered card entrance, layout-animated tab underline, a spring-animated cart bar and a toast on success. Respects `prefers-reduced-motion`.
- **Avoid:** emoji anywhere, em dashes in copy, generic AI-product tropes (purple gradients, glassmorphism, sparkle icons), stock-photo clutter and jargon.

## Features and Behavior

### Voice and text intake
- Web Speech API with continuous recognition and interim results. Language choice: English (India), English (US) or Hindi.
- While listening, the mic button shows animated rings and a live transcript. Tapping again stops listening.
- If speech recognition is unsupported (Firefox) or permission is denied, the mic is replaced with an inline note and focus moves to the textarea.
- Sample prompts for a bakery, a boutique and a kirana store fill the textarea instantly.

```gherkin
Feature: Voice intake
  Scenario: Owner describes shop by voice
    Given I am on the builder page in a browser that supports speech recognition
    When I tap the microphone and say "I run Maya's Bakery on MG Road"
    Then I see my words appear in the transcript box as I speak
    And the microphone shows a listening animation until I tap it again

  Scenario: Browser without speech support
    Given my browser does not support the Web Speech API
    When I open the builder page
    Then I see a note that voice is unavailable in this browser
    And I can type my description in the text box instead
```

### AI store generation
- `POST /api/generate` turns a transcript into a store config: name, tagline, category, colour theme, an optional About text, contact, address, hours, products (id, name, price, category, description, icon) and social links.
- Two engines sit behind one contract. **Claude** (structured JSON output, schema-validated) runs when `ANTHROPIC_API_KEY` is set. The **rule-based parser** handles regex and keyword extraction with no network. If Claude errors, the request falls back to the rule parser and returns a warning.
- Every result passes through one normaliser: a valid theme, positive numeric prices, unique IDs, 24h `HH:MM` hours, and a known outline icon per product.
- Missing information yields sensible defaults plus a `warnings[]` entry (for example "No phone number heard. Add one so customers can WhatsApp you.").

```gherkin
Feature: Transcript to storefront
  Scenario: Complete description
    Given the transcript "I run Maya's Bakery on MG Road Pune, open 9 AM to 8 PM Monday to Saturday.
      We sell sourdough for ₹150 and croissants for ₹80. Call 98765 43210."
    When I tap "Build my store"
    Then the store name is "Maya's Bakery"
    And the hours are 09:00 to 20:00, Mon–Sat
    And there are 2 products: "Sourdough" at 150 and "Croissants" at 80
    And the WhatsApp number is "919876543210"

  Scenario: Missing contact details
    Given a transcript with no phone number
    When the store is generated
    Then I see a warning asking me to add a phone number
    And the preview still renders
```

### Review, edit and publish
- Every detected field is editable inline, and the preview updates on each keystroke.
- **Publish** saves the store to the database and returns its slug and a secret edit key. The key is stored in the browser so the owner lands in their dashboard without logging in.
- Slugs are unique (`maya-s-bakery`, `maya-s-bakery-2`).

```gherkin
Feature: Publish
  Scenario: Publish a generated store
    Given I have reviewed my generated store
    When I tap "Publish storefront"
    Then I see my public link and a "Share on WhatsApp" button
    And opening the link shows my storefront to anyone
```

### Storefront for customers
- **Open/Closed indicator.** Computed in the browser from hours and days, it refreshes every minute and shows "Open now · closes 8:00 PM" or "Closed · opens 9:00 AM Mon". It handles overnight hours.
- **Search and filter.** Instant, case-insensitive search across product name, description and category. Category chips with counts. An empty state offers to clear filters.
- **Cart and WhatsApp order.** Quantity steppers on each product and a floating cart bar with count and total. **Order on WhatsApp** opens `wa.me/<number>?text=<order>` with the itemised list, total and a greeting.
- **Ask on WhatsApp** per product, for single-item inquiries.
- **Contact and location.** Tap-to-call, email and directions. An embedded Google Map (no API key) appears when an address exists.
- **Inquiry form.** Name, phone or email, and message. It saves to the database, and the owner sees it in the dashboard. Inline validation and a success toast.

```gherkin
Feature: Order via WhatsApp
  Scenario: Customer orders two items
    Given I am viewing "Maya's Bakery" storefront
    When I add 2 "Croissants" and 1 "Sourdough" to my cart
    Then the cart bar shows "3 items · ₹310"
    When I tap "Order on WhatsApp"
    Then WhatsApp opens addressed to the shop's number
    And the message lists "2 × Croissants: ₹160" and "1 × Sourdough: ₹150" and "Total: ₹310"

Feature: Business hours status
  Scenario: Shop is open
    Given the shop is open 09:00–20:00 Mon–Sat
    And it is Tuesday 14:00 in the visitor's browser
    Then I see "Open now" with a green pulse and "Closes 8:00 PM"

  Scenario: Shop is closed on Sunday
    Given it is Sunday 11:00
    Then I see "Closed" and "Opens Mon 9:00 AM"

Feature: Contact form
  Scenario: Customer sends an inquiry
    Given I fill name "Rahul", phone "9876500000" and message "Do you take cake orders?"
    When I submit the form
    Then I see a confirmation
    And the owner sees the inquiry in the dashboard Inquiries tab
```

### Owner dashboard
- Requires the store's edit key, which comes from the browser after publishing or can be pasted.
- **Photos and logo:** upload product photos and a shop logo from the phone or computer; images are shrunk in the browser before upload.
- **Products:** add, edit, delete and reorder-free inline editing; **Add by voice** parses a spoken sentence and appends new products, skipping duplicates by name.
- **Details:** name, tagline, About text, category, colour theme (six previews), hours, days, phone, WhatsApp, email, address and Instagram.
- **Inquiries:** newest first, with a **Mark as done** toggle and a reply-on-WhatsApp shortcut.
- **Save** writes the changes, and an unsaved-changes indicator shows when there is anything to save.

```gherkin
Feature: Voice product update
  Scenario: Owner adds products by speaking
    Given I am on my dashboard Products tab
    When I say "add plum cake for 450 rupees and walnut brownie for 90"
    Then "Plum Cake ₹450" and "Walnut Brownie ₹90" are added to my product list
    And existing products with the same name are not duplicated
```

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Capture speech with live interim transcript; text fallback always available |
| FR-2 | Generate a schema-valid store config from any transcript ≥ 10 characters |
| FR-3 | Fall back to the offline parser if the LLM is unavailable, errors or times out |
| FR-4 | Live preview reflects every edit immediately |
| FR-5 | Persist stores and inquiries in SQLite; data survives restarts |
| FR-6 | Public storefront by slug; edit operations require the store's edit key |
| FR-7 | Open/Closed status computed from hours, days and the visitor's local time |
| FR-8 | Product search and category filter, client-side, instant |
| FR-9 | WhatsApp deep link with itemised cart message |
| FR-10 | Inquiry form persisted and listed in the dashboard |
| FR-11 | Add products by voice from the dashboard |

## Non-Functional Requirements
- **Performance:** storefront first paint under 1.5 s on mid-range Android over 4G. Rule-based generation under 50 ms; Claude generation typically 3–10 s, with progress feedback throughout.
- **Reliability:** runs fully offline from AI services with no API key. A seeded demo store exists on first boot.
- **Accessibility:** WCAG 2.1 AA contrast, full keyboard navigation, labelled controls, `aria-live` for transcript and status, and reduced-motion support.
- **Responsive:** mobile-first from 360 px up to 1440 px.
- **Printable:** the counter card prints on its own as a "Scan to order" poster with a real QR code.
- **Security:** edit key (192-bit random) compared in constant time; input validated with Zod on every write; request body limit of 100 KB; transcripts capped at 5,000 characters; no secrets in the client.
- **Portability:** a single `npm install && npm run dev` on Node ≥ 22.13 (built-in SQLite), with no native build tools.

## States and Boundaries
- **First use:** an empty builder with sample prompts; the "Recently published" gallery shows the seeded demo store.
- **Listening:** animated mic plus live transcript; generating shows the stepped progress.
- **Generation warnings:** an amber callouts list sits above the review panel, and the preview still renders.
- **Generation error:** network or server down shows an inline error with **Try again**, and the transcript is preserved.
- **Empty catalog:** the storefront shows a "Products coming soon" card and contact CTAs stay prominent.
- **No address:** the map card is hidden, and the contact card remains.
- **No WhatsApp number:** WhatsApp buttons are hidden and the cart shows "Call to order" if a phone number exists.
- **Persistence:** stores and inquiries live in the server's SQLite file. The edit keys and cart live in the browser's localStorage.
- **Permissions:** anyone can view a storefront and send an inquiry. Only edit-key holders can edit a store or read its inquiries.

## Product Decisions
- **WhatsApp instead of payments.** It matches how these shops already take orders, has zero onboarding and needs no KYC.
- **An edit key instead of accounts.** Signup kills conversion for this persona; the key is invisible when publishing from the same device.
- **Outline icon tiles instead of stock photos.** Always relevant, zero bandwidth, never a broken image, and no emoji. Owners can pick another icon or paste a photo URL.
- **Two parsing engines, one contract.** Judges and owners always get a result, and Claude improves quality when available.
- *Assumption:* currency defaults to INR (₹) unless the transcript uses `$`, `€` or `£`.

## Success Metrics
| Metric | Target |
|---|---|
| Time from landing to published store | < 2 minutes (median) |
| Owner typing required | 0 characters in the happy path |
| Field-extraction accuracy on the sample prompt set (offline parser) | name, hours, phone and ≥ 90% of priced products |
| Storefront Lighthouse accessibility score | ≥ 95 |
| Customer path: open link → WhatsApp order | ≤ 4 taps |
| Demo reliability without API key | 100% (all features work) |

## What We're Building
Everything in **Features and Behavior** above: voice and text intake, the dual-engine AI generator with validation, live preview, publish with SQLite persistence, a public storefront (status, search, filter, cart, WhatsApp order, map, inquiry form), and an owner dashboard (details, products, voice add, inquiries), plus a seeded demo store and automated tests.

## Deferred From the POC
- **Accounts and multi-store management.** The edit key per store covers the POC; real accounts need auth, recovery and email.
- **Hosted deployment pipeline.** Optional for the hackathon. The app is deploy-ready (`npm run build && npm start` serves everything from one process).

## Possible Later Enhancements
- A regional-language rule parser.
- Store analytics (views and WhatsApp clicks).
- A festival-special banner generated by voice.
- Export the store as a static HTML bundle.

## Non-Goals
- **Online payments:** out of scope; WhatsApp is the order channel.
- **Inventory, delivery slots and logistics:** the owner already handles these.
- **A general-purpose website builder (blogs, multi-page):** focus beats breadth for this persona.
- **Pixel-level design control:** contradicts the kernel.

## Open Questions
- Should the rule-based parser support Hindi number words ("dedh sau")? *Can wait. Claude handles them today.*
- Should published stores be listed publicly in the builder gallery? *Decided for the POC: yes, the five most recent. A real deployment would make this opt-in.*

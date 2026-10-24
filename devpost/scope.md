---
doc: scope
status: draft
---

# Vaani — Voice-to-Storefront

A shop owner describes their shop out loud (or types it), and Vaani turns that description into a polished, mobile-first storefront with a product catalog, live open/closed hours, a map, and WhatsApp ordering.

## The Unique Kernel
**The shop owner's own words are the whole interface.** There are no templates to pick, no drag-and-drop editor and no forms to fill in before something exists. One spoken paragraph like *"I run Maya's Bakery on MG Road, open 9 to 8, sourdough for ₹150…"* becomes a working store in seconds. The AI pipeline turns unstructured speech into a validated store configuration, and the storefront renders from that configuration alone.

## Who It's For
**Meera, 46, owns a 12-year-old bakery in Pune.** She takes orders on WhatsApp and the phone. Her customers ask "are you open?" and "what's the price of the plum cake?" several times a day. She has an Android phone, uses WhatsApp fluently and has never opened a laptop for business. She tried Wix once, and it asked her to choose from 900 templates and write "About Us" copy, so she gave up.

The same pattern holds for boutiques, kirana (neighbourhood grocery) stores, florists and sweet shops: the business runs on WhatsApp and word of mouth, and the owner has no design skills, coding skills or spare time.

**Today they use:** a WhatsApp Business catalog (only inside WhatsApp, not shareable as a site, hard to keep updated), a Google Business Profile (no catalog or ordering), or nothing.

## The Core Loop
1. The owner opens Vaani, taps the mic and talks about their shop for 20–60 seconds.
2. Vaani shows what it understood (name, hours, products and prices) next to a live preview of the storefront.
3. The owner fixes anything that's wrong by tapping it, or by speaking again ("add chocolate truffle cake for ₹650").
4. They publish and share one link on WhatsApp status, Instagram or a printed QR on the counter.
5. Customers browse, search, check if the shop is open, and send a ready-made order to the owner's WhatsApp.
6. **Why they come back:** new stock, price changes and festival specials. Each update is one spoken sentence from the dashboard.

## Inspiration & Identity
- **Feel:** warm, confident and local, like a well-designed neighbourhood shop sign, not a SaaS dashboard.
- **References:** Apple's product pages for whitespace ([apple.com](https://www.apple.com)), Linear for crisp micro-interactions ([linear.app](https://linear.app)), Swiggy/Zepto for the mobile shopping pattern of a sticky cart bar and quantity steppers.
- **Mood words:** friendly, instant, trustworthy, "made for me".
- **Tone of copy:** plain language and short sentences. No jargon ("publish", not "deploy").

## Why This Matters to the Learner
The hackathon problem statement asks why shop owners can't create websites without coding knowledge. The honest answer is that every existing tool still assumes the owner can *operate software*. Vaani tests whether speaking is enough.

## What "Working" Looks Like
A judge opens the app, clicks the mic (or a sample prompt) and says a two-sentence description of a bakery. Within a few seconds a branded storefront appears in a phone frame, showing the right name, products, prices, hours and an **Open now** badge. They publish it, open the public link, add two croissants to the cart and tap **Order on WhatsApp**. WhatsApp opens with a neatly formatted order and total, addressed to the shop's number.

**The "oh, that's cool" beat** is spoken words turning into a real, shareable, orderable store.

## The POC Boundary
- Voice (Web Speech API) and text input.
- An AI parsing pipeline that turns a transcript into a validated JSON store config. It uses Claude when a key is present and a deterministic rule-based parser otherwise, so the demo never breaks.
- A live preview with mobile and desktop frames.
- Publishing to a public storefront URL (`/s/:slug`), persisted in SQLite.
- Storefront features: product search, category filters, cart, WhatsApp order message, Open/Closed status, hours, contact card, embedded map and an inquiry form.
- An owner dashboard to edit details and products, add products by voice, and read inquiries.
- A per-store edit key in place of user accounts.

## Later
- A printable QR code poster for the shop counter.
- Hindi, Marathi, Tamil and other regional-language transcripts (Claude can already parse them; the rule parser cannot yet).
- Product photo upload from the phone camera.
- Custom domains and SEO metadata per store.
- Analytics: views, WhatsApp clicks and top products.

## Explicitly Cut
- **Payments and checkout.** WhatsApp ordering matches how these shops already work and avoids payment-gateway KYC.
- **User accounts, auth and passwords.** An unguessable edit key per store is enough for a POC and removes a signup step that loses this persona.
- **Inventory and stock tracking.** Owners in this segment don't track SKUs digitally, and it isn't needed to prove the kernel.
- **Multi-page sites and blog/CMS.** One focused page converts better on mobile and keeps generation reliable.
- **A drag-and-drop theme editor.** This is the complexity Vaani exists to remove. Owners get a brand colour and an AI-chosen theme.

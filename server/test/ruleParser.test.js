import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWithRules } from '../src/ai/ruleParser.js';
import { generateStore } from '../src/ai/pipeline.js';
import { normalizeStore, ensureContrast, toWhatsApp } from '../src/ai/normalize.js';
import { normalizeDays, normalizeTime } from '../src/ai/hours.js';
import { StoreSchema } from '../src/ai/schema.js';

const BAKERY =
  "I run Maya's Bakery on MG Road Pune, open 9 AM to 8 PM Monday to Saturday. We sell artisanal sourdough for ₹150, " +
  'croissants for ₹80, chocolate truffle cake for Rs 650 and cinnamon rolls at 90 rupees each. Call or WhatsApp us on 98765 43210. Instagram is @mayasbakes';
const KIRANA =
  'my shop is called Sharma General Store, we are a kirana store in Sector 15 Noida. open from 7 to 10 every day. ' +
  'basmati rice 120 per kg, toor dal for 140 rupees per kg, aashirvaad atta 5 kg for 280, amul milk 30 rupees per litre. phone 9811122233';
const BOUTIQUE =
  'welcome to Rangoli Boutique located at 12 Linking Road, Bandra. We are open 11am to 9pm, closed on Tuesday. ' +
  'Handblock cotton kurtis ₹899, Banarasi silk saree for ₹4,500, oxidised jhumka earrings 350 rupees. WhatsApp 9123456789, email hello@rangoli.in';

test('bakery: name, address, hours, products, contact', async () => {
  const { store, engine, warnings } = await generateStore(BAKERY, { engine: 'rules' });
  assert.equal(engine, 'rules');
  assert.equal(store.storeName, "Maya's Bakery");
  assert.equal(store.category, 'Bakery');
  assert.match(store.contact.address, /MG Road/);
  assert.deepEqual(store.hours, { open: '09:00', close: '20:00', days: 'Mon-Sat' });
  assert.equal(store.contact.whatsapp, '919876543210');
  assert.equal(store.contact.phone, '+91 98765 43210');
  assert.equal(store.social.instagram, 'mayasbakes');
  assert.deepEqual(
    store.products.map((p) => [p.name, p.price]),
    [['Artisanal Sourdough', 150], ['Croissants', 80], ['Chocolate Truffle Cake', 650], ['Cinnamon Rolls', 90]],
  );
  assert.equal(warnings.length, 0);
  assert.ok(StoreSchema.safeParse(store).success);
});

test('kirana: units, unmarked prices, daily hours, 7 to 10 means 07:00-22:00', async () => {
  const { store } = await generateStore(KIRANA, { engine: 'rules' });
  assert.equal(store.storeName, 'Sharma General Store');
  assert.equal(store.category, 'Grocery');
  assert.deepEqual(store.hours, { open: '07:00', close: '22:00', days: 'Daily' });
  const byName = Object.fromEntries(store.products.map((p) => [p.name, p]));
  assert.equal(byName['Basmati Rice'].price, 120);
  assert.match(byName['Basmati Rice'].description, /per kg/);
  assert.equal(byName['Toor Dal'].price, 140);
  assert.equal(byName['Aashirvaad Atta 5 kg'].price, 280);
  assert.equal(byName['Amul Milk'].price, 30);
});

test('boutique: thousands separators, closed day, separate email', async () => {
  const { store } = await generateStore(BOUTIQUE, { engine: 'rules' });
  assert.equal(store.storeName, 'Rangoli Boutique');
  assert.equal(store.contact.address, '12 Linking Road, Bandra');
  assert.equal(store.contact.email, 'hello@rangoli.in');
  assert.deepEqual(store.hours, { open: '11:00', close: '21:00', days: 'Wed-Mon' });
  assert.equal(store.products.find((p) => p.name === 'Banarasi Silk Saree').price, 4500);
  assert.equal(store.products.length, 3);
});

test('sparse transcript still yields a valid store with helpful warnings', async () => {
  const { store, warnings } = await generateStore('i run a small cafe. we have cappuccino for 120 and masala chai for 40', { engine: 'rules' });
  assert.equal(store.storeName, 'My Shop');
  assert.equal(store.category, 'Cafe');
  assert.equal(store.products.length, 2);
  assert.ok(warnings.some((w) => /name/i.test(w)));
  assert.ok(warnings.some((w) => /phone|WhatsApp/i.test(w)));
  assert.ok(warnings.some((w) => /hours/i.test(w)));
  assert.ok(StoreSchema.safeParse(store).success);
});

test('hour numbers are not mistaken for prices', () => {
  const raw = parseWithRules('Ravi Florist is open from 10 to 7. Rose bouquet for 300.');
  assert.deepEqual(raw.products.map((p) => p.name), ['Rose Bouquet']);
  assert.equal(raw.hours.open, '10:00');
  assert.equal(raw.hours.close, '19:00');
});

test('spoken email and USD currency', () => {
  const raw = parseWithRules('Welcome to Corner Books. Notebooks for $5. Email us at hello at cornerbooks dot com');
  assert.equal(raw.currency, 'USD');
  assert.equal(raw.contact.email, 'hello@cornerbooks.com');
  assert.equal(raw.products[0].price, 5);
});

test('24x7 shops', () => {
  const raw = parseWithRules('City Chemist is open 24x7. Paracetamol strip for ₹30.');
  assert.deepEqual(raw.hours, { open: '00:00', close: '23:59', days: 'Daily' });
});

test('hours helpers', () => {
  assert.equal(normalizeTime('9'), '09:00');
  assert.equal(normalizeTime('9:30 PM'), '21:30');
  assert.equal(normalizeTime('12 am'), '00:00');
  assert.equal(normalizeTime('midnight'), '23:59');
  assert.equal(normalizeTime('nonsense'), null);
  assert.equal(normalizeDays('monday to friday'), 'Mon-Fri');
  assert.equal(normalizeDays('closed on sunday'), 'Mon-Sat');
  assert.equal(normalizeDays('every day except monday'), 'Tue-Sun');
  assert.equal(normalizeDays('Mon, Wed, Fri'), 'Mon, Wed, Fri');
  assert.equal(normalizeDays('weekends'), 'Sat-Sun');
  assert.equal(normalizeDays(''), 'Daily');
});

test('normaliser repairs LLM-style output', () => {
  const { store } = normalizeStore({
    storeName: 'green leaf grocers',
    category: 'grocery',
    primaryColor: '#FFFF00', // too light for white text
    contact: { phone: '098111 22233', whatsapp: '', email: 'not-an-email', address: '' },
    hours: { open: '7 am', close: '10 PM', days: 'all days' },
    products: [
      { name: 'Tomatoes', price: '₹40', category: '', description: '', image: 'tomato' },
      { name: 'tomatoes', price: 45 }, // duplicate
      { name: 'Paneer', price: 90, image: 'https://example.com/paneer.jpg' },
    ],
  });
  assert.equal(store.storeName, 'Green Leaf Grocers');
  assert.equal(store.category, 'Grocery');
  assert.notEqual(store.primaryColor, '#FFFF00');
  assert.equal(store.contact.whatsapp, '919811122233');
  assert.equal(store.contact.email, '');
  assert.deepEqual(store.hours, { open: '07:00', close: '22:00', days: 'Daily' });
  assert.equal(store.products.length, 2);
  assert.equal(store.products[0].price, 40);
  assert.equal(store.products[0].image, '🍅');
  assert.equal(store.products[1].image, 'https://example.com/paneer.jpg');
});

test('ensureContrast reaches 4.5:1 against white; toWhatsApp formats Indian numbers', () => {
  assert.equal(ensureContrast('#1C1917'), '#1C1917');
  assert.notEqual(ensureContrast('#FDE047'), '#FDE047');
  assert.equal(toWhatsApp('98765 43210'), '919876543210');
  assert.equal(toWhatsApp('+1 415 555 0100'), '14155550100');
  assert.equal(toWhatsApp('123'), '');
});

test('pipeline falls back to rules when Claude fails', async () => {
  const prev = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'test-key';
  try {
    const failing = async () => {
      throw new Error('network down');
    };
    const { engine, store, warnings } = await generateStore(BAKERY, { claude: failing });
    assert.equal(engine, 'rules');
    assert.equal(store.storeName, "Maya's Bakery");
    assert.match(warnings[0], /offline parser/);

    const ok = async () => ({ ...parseWithRules(BAKERY), tagline: 'From Claude' });
    const viaClaude = await generateStore(BAKERY, { claude: ok });
    assert.equal(viaClaude.engine, 'claude');
    assert.equal(viaClaude.store.tagline, 'From Claude');
  } finally {
    if (prev === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prev;
  }
});

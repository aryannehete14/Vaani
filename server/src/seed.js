import { normalizeStore } from './ai/normalize.js';

export const DEMO_SLUG = 'mayas-bakery';
export const DEMO_EDIT_KEY = 'demo';

export const DEMO_TRANSCRIPT =
  "I run Maya's Bakery on MG Road, Pune. We're open 8 AM to 9 PM, closed on Mondays. " +
  'We bake artisanal sourdough for ₹150, butter croissants for ₹80, chocolate truffle cake for ₹650, ' +
  'cinnamon rolls for ₹90, blueberry muffins for ₹70 and we serve cappuccino for ₹120. ' +
  'Call or WhatsApp us on 98765 43210, email hello@mayasbakery.in, Instagram @mayasbakery.';

const DEMO_STORE = {
  storeName: "Maya's Bakery",
  tagline: 'Slow-fermented breads and buttery bakes, fresh every morning',
  category: 'Bakery',
  primaryColor: '#B45309',
  currency: 'INR',
  contact: { phone: '+91 98765 43210', whatsapp: '919876543210', email: 'hello@mayasbakery.in', address: 'MG Road, Pune' },
  hours: { open: '08:00', close: '21:00', days: 'Tue-Sun' },
  products: [
    { name: 'Artisanal Sourdough', price: 150, category: 'Breads', description: '36-hour slow-fermented loaf with a crackly crust and open crumb.', image: '🍞' },
    { name: 'Butter Croissant', price: 80, category: 'Pastries', description: 'Flaky, golden and laminated with French-style butter.', image: '🥐' },
    { name: 'Chocolate Truffle Cake', price: 650, category: 'Cakes', description: 'Rich dark-chocolate ganache layers. Serves 6–8.', image: '🎂' },
    { name: 'Cinnamon Roll', price: 90, category: 'Pastries', description: 'Soft swirl with brown-sugar cinnamon and cream-cheese glaze.', image: '🥨' },
    { name: 'Blueberry Muffin', price: 70, category: 'Cakes', description: 'Bursting with blueberries and a crunchy crumble top.', image: '🧁' },
    { name: 'Cappuccino', price: 120, category: 'Beverages', description: 'Double-shot espresso with velvety steamed milk.', image: '☕' },
    { name: 'Garlic Focaccia', price: 180, category: 'Breads', description: 'Olive-oil rich and topped with roasted garlic and rosemary.', image: '🧄' },
    { name: 'Choco-Chip Cookies (6)', price: 160, category: 'Cakes', description: 'Chewy centres, crisp edges, loaded with chocolate chunks.', image: '🍪' },
  ],
  social: { instagram: 'mayasbakery', facebook: '' },
};

export function seedDemo(db) {
  if (db.getStore(DEMO_SLUG)) return false;
  const { store } = normalizeStore(DEMO_STORE);
  db.createStore({ slug: DEMO_SLUG, editToken: DEMO_EDIT_KEY, store, engine: 'manual', transcript: DEMO_TRANSCRIPT });
  return true;
}

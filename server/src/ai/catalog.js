// Category themes and emoji vocabulary shared by both parsing engines.

export const CATEGORIES = [
  {
    name: 'Bakery',
    keywords: ['bakery', 'bake', 'bread', 'cake', 'pastry', 'patisserie', 'sourdough', 'croissant', 'cookie'],
    color: '#D97706',
    taglines: ['Fresh from our oven, every morning', 'Baked with love, served warm'],
  },
  {
    name: 'Cafe',
    keywords: ['cafe', 'café', 'coffee', 'tea house', 'chai', 'espresso', 'brew'],
    color: '#92400E',
    taglines: ['Good coffee, better company', 'Your neighbourhood brew stop'],
  },
  {
    name: 'Sweet Shop',
    keywords: ['sweet shop', 'mithai', 'sweets', 'halwai', 'laddoo', 'ladoo', 'barfi', 'jalebi'],
    color: '#DB2777',
    taglines: ['Traditional sweets, made fresh daily', 'Every celebration starts here'],
  },
  {
    name: 'Restaurant',
    keywords: ['restaurant', 'dhaba', 'kitchen', 'eatery', 'biryani', 'thali', 'tiffin', 'food stall'],
    color: '#DC2626',
    taglines: ['Home-style food, made with care', 'Come hungry, leave happy'],
  },
  {
    name: 'Boutique',
    keywords: ['boutique', 'clothing', 'clothes', 'fashion', 'saree', 'sari', 'kurta', 'kurti', 'dress', 'apparel', 'lehenga', 'garment'],
    color: '#BE185D',
    taglines: ['Handpicked styles for every occasion', 'Wear your story'],
  },
  {
    name: 'Grocery',
    keywords: ['kirana', 'grocery', 'groceries', 'general store', 'provision', 'supermarket', 'atta', 'dal', 'rice', 'staples'],
    color: '#16A34A',
    taglines: ['Daily essentials, right around the corner', 'Fresh stock, fair prices, every day'],
  },
  {
    name: 'Fruits & Vegetables',
    keywords: ['fruit', 'vegetable', 'sabzi', 'produce', 'organic farm'],
    color: '#65A30D',
    taglines: ['Farm-fresh, picked for you', 'Fresh produce, every morning'],
  },
  {
    name: 'Florist',
    keywords: ['florist', 'flower', 'bouquet', 'garland', 'roses'],
    color: '#E11D48',
    taglines: ['Fresh flowers for every moment', 'Say it with flowers'],
  },
  {
    name: 'Pharmacy',
    keywords: ['pharmacy', 'chemist', 'medical store', 'medicine', 'medicines'],
    color: '#0891B2',
    taglines: ['Your trusted neighbourhood chemist', 'Health essentials, always in stock'],
  },
  {
    name: 'Electronics',
    keywords: ['electronics', 'mobile shop', 'phone shop', 'gadget', 'charger', 'headphone', 'repair'],
    color: '#2563EB',
    taglines: ['Gadgets, accessories and expert repairs', 'Tech you can trust'],
  },
  {
    name: 'Books & Stationery',
    keywords: ['book', 'bookstore', 'stationery', 'stationary', 'notebook', 'pens'],
    color: '#4F46E5',
    taglines: ['Stories and supplies for curious minds', 'Your neighbourhood bookshop'],
  },
  {
    name: 'Salon & Beauty',
    keywords: ['salon', 'parlour', 'parlor', 'beauty', 'spa', 'haircut', 'cosmetic'],
    color: '#C026D3',
    taglines: ['Look good, feel great', 'Beauty care you can trust'],
  },
  {
    name: 'Handicrafts',
    keywords: ['handicraft', 'handmade', 'pottery', 'craft', 'artisan', 'handloom'],
    color: '#B45309',
    taglines: ['Handmade by local artisans', 'Crafted with heart'],
  },
];

export const DEFAULT_CATEGORY = {
  name: 'Retail',
  color: '#7C3AED',
  taglines: ['Quality products from your neighbourhood store'],
};

// Ordered most-specific first: the first keyword found in a product name wins.
const EMOJI_RULES = [
  [['sourdough', 'bread', 'loaf', 'pav', 'bun'], '🍞'],
  [['croissant'], '🥐'],
  [['baguette'], '🥖'],
  [['cupcake', 'muffin'], '🧁'],
  [['cake', 'gateau'], '🎂'],
  [['cookie', 'biscuit'], '🍪'],
  [['donut', 'doughnut'], '🍩'],
  [['pie', 'tart'], '🥧'],
  [['brownie', 'chocolate'], '🍫'],
  [['pizza'], '🍕'],
  [['burger'], '🍔'],
  [['sandwich'], '🥪'],
  [['biryani', 'rice', 'pulao'], '🍚'],
  [['noodle', 'maggi'], '🍜'],
  [['samosa', 'puff'], '🥟'],
  [['dosa', 'paratha', 'roti', 'naan'], '🥞'],
  [['curry', 'thali', 'dal'], '🍛'],
  [['ladoo', 'laddoo', 'barfi', 'mithai', 'sweet', 'jalebi', 'peda'], '🍬'],
  [['ice cream', 'kulfi'], '🍨'],
  [['coffee', 'espresso', 'latte', 'cappuccino'], '☕'],
  [['chai', 'tea'], '🍵'],
  [['juice', 'smoothie', 'shake', 'lassi'], '🥤'],
  [['milk', 'curd', 'dahi', 'paneer'], '🥛'],
  [['egg'], '🥚'],
  [['cheese'], '🧀'],
  [['honey'], '🍯'],
  [['oil', 'ghee'], '🧈'],
  [['atta', 'flour', 'wheat'], '🌾'],
  [['sugar', 'salt', 'spice', 'masala'], '🧂'],
  [['apple'], '🍎'],
  [['banana'], '🍌'],
  [['mango'], '🥭'],
  [['tomato'], '🍅'],
  [['onion', 'garlic'], '🧅'],
  [['potato'], '🥔'],
  [['fruit'], '🍇'],
  [['vegetable', 'sabzi', 'greens'], '🥬'],
  [['saree', 'sari', 'lehenga', 'dupatta'], '🥻'],
  [['kurta', 'kurti', 'shirt', 'top', 't-shirt', 'tshirt'], '👚'],
  [['dress', 'gown', 'frock'], '👗'],
  [['jeans', 'trouser', 'pant'], '👖'],
  [['shoe', 'sandal', 'jutti', 'chappal'], '👟'],
  [['bag', 'purse', 'clutch'], '👜'],
  [['scarf', 'stole', 'shawl'], '🧣'],
  [['earring', 'necklace', 'bangle', 'jewel', 'ring'], '💍'],
  [['soap', 'shampoo'], '🧴'],
  [['lipstick', 'makeup', 'cosmetic'], '💄'],
  [['haircut', 'hair'], '💇'],
  [['rose', 'bouquet', 'flower', 'garland'], '💐'],
  [['plant', 'succulent'], '🌱'],
  [['book', 'novel'], '📚'],
  [['notebook', 'pen', 'pencil', 'stationery'], '✏️'],
  [['phone', 'mobile'], '📱'],
  [['charger', 'cable'], '🔌'],
  [['headphone', 'earphone', 'earbud'], '🎧'],
  [['medicine', 'tablet', 'syrup'], '💊'],
  [['pot', 'vase', 'pottery'], '🏺'],
  [['candle'], '🕯️'],
  [['toy'], '🧸'],
];

const CATEGORY_EMOJI = {
  Bakery: '🥐', Cafe: '☕', 'Sweet Shop': '🍬', Restaurant: '🍛', Boutique: '👗',
  Grocery: '🛒', 'Fruits & Vegetables': '🥬', Florist: '💐', Pharmacy: '💊',
  Electronics: '📱', 'Books & Stationery': '📚', 'Salon & Beauty': '💄', Handicrafts: '🏺',
};

// Product-level grouping used for storefront filter chips.
const PRODUCT_GROUPS = [
  [['bread', 'sourdough', 'loaf', 'baguette', 'bun', 'pav'], 'Breads'],
  [['croissant', 'pastry', 'puff', 'danish', 'tart', 'pie', 'roll'], 'Pastries'],
  [['cake', 'cupcake', 'muffin', 'brownie', 'cookie', 'donut'], 'Cakes & Treats'],
  [['coffee', 'espresso', 'latte', 'cappuccino', 'tea', 'chai', 'juice', 'shake', 'lassi', 'smoothie'], 'Beverages'],
  [['ladoo', 'laddoo', 'barfi', 'jalebi', 'peda', 'mithai', 'halwa'], 'Sweets'],
  [['saree', 'sari', 'lehenga', 'kurta', 'kurti', 'dress', 'gown', 'shirt', 'top', 'jeans', 'dupatta'], 'Clothing'],
  [['earring', 'necklace', 'bangle', 'bag', 'purse', 'scarf', 'stole', 'jewel'], 'Accessories'],
  [['atta', 'flour', 'rice', 'dal', 'sugar', 'salt', 'oil', 'ghee', 'masala', 'spice'], 'Staples'],
  [['milk', 'curd', 'dahi', 'paneer', 'butter', 'cheese', 'egg'], 'Dairy & Eggs'],
  [['apple', 'banana', 'mango', 'fruit', 'tomato', 'onion', 'potato', 'vegetable', 'sabzi'], 'Fresh Produce'],
  [['biscuit', 'chips', 'namkeen', 'maggi', 'noodle', 'snack'], 'Snacks'],
  [['soap', 'shampoo', 'detergent', 'toothpaste'], 'Household'],
];

const GROUP_DESCRIPTIONS = {
  Breads: 'Baked fresh every morning.',
  Pastries: 'Flaky, buttery and baked in-house.',
  'Cakes & Treats': 'A sweet treat for any occasion.',
  Beverages: 'Freshly made, just the way you like it.',
  Sweets: 'Made fresh with traditional recipes.',
  Clothing: 'Handpicked for comfort and style.',
  Accessories: 'The finishing touch for any outfit.',
  Staples: 'Everyday essential, quality assured.',
  'Dairy & Eggs': 'Fresh stock every day.',
  'Fresh Produce': 'Picked fresh and sorted with care.',
  Snacks: 'Perfect for tea-time cravings.',
  Household: 'Home essentials you can rely on.',
};

export function fallbackDescription(group) {
  return GROUP_DESCRIPTIONS[group] ?? 'A customer favourite.';
}

const includesWord = (text, word) => new RegExp(`\\b${word}`, 'i').test(text);

export function detectCategory(text) {
  let best = null;
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    const score = cat.keywords.reduce((n, k) => n + (includesWord(text, k) ? 1 : 0), 0);
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }
  return best ?? DEFAULT_CATEGORY;
}

export function themeFor(categoryName) {
  return CATEGORIES.find((c) => c.name.toLowerCase() === String(categoryName).toLowerCase()) ?? DEFAULT_CATEGORY;
}

export function emojiFor(productName, storeCategory) {
  for (const [words, emoji] of EMOJI_RULES) {
    if (words.some((w) => includesWord(productName, w))) return emoji;
  }
  return CATEGORY_EMOJI[storeCategory] ?? '🛍️';
}

export function productGroupFor(productName, storeCategory) {
  for (const [words, group] of PRODUCT_GROUPS) {
    if (words.some((w) => includesWord(productName, w))) return group;
  }
  return storeCategory && storeCategory !== DEFAULT_CATEGORY.name ? storeCategory : 'Featured';
}

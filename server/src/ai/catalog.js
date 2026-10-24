// Shop categories, storefront themes and the product icon vocabulary shared by both parsing engines.

// Leaf storefront colour themes. The owner can switch between them; the category picks the default.
export const THEME_IDS = ['sage', 'clay', 'indigo', 'marigold', 'plum', 'teal'];

// Outline icons the storefront knows how to draw (client/src/lib/icons.jsx). Never emoji.
export const ICON_KEYS = [
  'package', 'basket', 'bag', 'bread', 'pastry', 'cake', 'cookie', 'cup', 'bottle', 'milk', 'egg', 'sack', 'bowl',
  'wheat', 'jar', 'leaf', 'sprout', 'apple', 'sweet', 'icecream', 'gift', 'shirt', 'dress', 'shoe', 'gem', 'drop',
  'tube', 'mirror', 'scissors', 'pill', 'cross', 'therm', 'book', 'pen', 'phone', 'plug', 'headphones', 'flower', 'pot',
];

export const CATEGORIES = [
  {
    name: 'Bakery',
    keywords: ['bakery', 'bake', 'bread', 'cake', 'pastry', 'patisserie', 'sourdough', 'croissant', 'cookie'],
    theme: 'clay',
    icon: 'bread',
    taglines: ['Fresh from our oven, every morning', 'Baked with care, served warm'],
  },
  {
    name: 'Cafe',
    keywords: ['cafe', 'café', 'coffee', 'tea house', 'chai', 'espresso', 'brew'],
    theme: 'clay',
    icon: 'cup',
    taglines: ['Good coffee, better company', 'Your neighbourhood brew stop'],
  },
  {
    name: 'Sweet Shop',
    keywords: ['sweet shop', 'mithai', 'sweets', 'halwai', 'laddoo', 'ladoo', 'barfi', 'jalebi'],
    theme: 'marigold',
    icon: 'sweet',
    taglines: ['Traditional sweets, made fresh daily', 'Every celebration starts here'],
  },
  {
    name: 'Restaurant',
    keywords: ['restaurant', 'dhaba', 'kitchen', 'eatery', 'biryani', 'thali', 'tiffin', 'food stall'],
    theme: 'clay',
    icon: 'bowl',
    taglines: ['Home-style food, made with care', 'Come hungry, leave happy'],
  },
  {
    name: 'Boutique',
    keywords: ['boutique', 'clothing', 'clothes', 'fashion', 'saree', 'sari', 'kurta', 'kurti', 'dress', 'apparel', 'lehenga', 'garment'],
    theme: 'indigo',
    icon: 'dress',
    taglines: ['Handpicked styles for every occasion', 'Wear your story'],
  },
  {
    name: 'Grocery',
    keywords: ['kirana', 'grocery', 'groceries', 'general store', 'provision', 'supermarket', 'atta', 'dal', 'rice', 'staples'],
    theme: 'sage',
    icon: 'basket',
    taglines: ['Daily essentials, right around the corner', 'Fresh stock, fair prices, every day'],
  },
  {
    name: 'Fruits & Vegetables',
    keywords: ['fruit', 'vegetable', 'sabzi', 'produce', 'organic farm'],
    theme: 'sage',
    icon: 'apple',
    taglines: ['Farm-fresh, picked for you', 'Fresh produce, every morning'],
  },
  {
    name: 'Florist',
    keywords: ['florist', 'flower', 'bouquet', 'garland', 'roses'],
    theme: 'plum',
    icon: 'flower',
    taglines: ['Fresh flowers for every moment', 'Say it with flowers'],
  },
  {
    name: 'Pharmacy',
    keywords: ['pharmacy', 'chemist', 'medical store', 'medicine', 'medicines'],
    theme: 'teal',
    icon: 'pill',
    taglines: ['Your trusted neighbourhood chemist', 'Health essentials, always in stock'],
  },
  {
    name: 'Electronics',
    keywords: ['electronics', 'mobile shop', 'phone shop', 'gadget', 'charger', 'headphone', 'repair'],
    theme: 'indigo',
    icon: 'phone',
    taglines: ['Gadgets, accessories and expert repairs', 'Tech you can trust'],
  },
  {
    name: 'Books & Stationery',
    keywords: ['book', 'bookstore', 'stationery', 'stationary', 'notebook', 'pens'],
    theme: 'indigo',
    icon: 'book',
    taglines: ['Stories and supplies for curious minds', 'Your neighbourhood bookshop'],
  },
  {
    name: 'Salon & Beauty',
    keywords: ['salon', 'parlour', 'parlor', 'beauty', 'spa', 'haircut', 'cosmetic', 'skincare'],
    theme: 'plum',
    icon: 'drop',
    taglines: ['Look good, feel great', 'Beauty care you can trust'],
  },
  {
    name: 'Handicrafts',
    keywords: ['handicraft', 'handmade', 'pottery', 'craft', 'artisan', 'handloom'],
    theme: 'clay',
    icon: 'pot',
    taglines: ['Handmade by local artisans', 'Crafted with heart'],
  },
];

export const DEFAULT_CATEGORY = {
  name: 'Retail',
  theme: 'sage',
  icon: 'package',
  taglines: ['Quality products from your neighbourhood store'],
};

// Ordered most-specific first: the first keyword found in a product name wins.
const ICON_RULES = [
  [['face oil', 'serum', 'cream', 'lotion', 'shampoo', 'soap', 'perfume', 'moisturiser', 'moisturizer'], 'drop'],
  [['sourdough', 'bread', 'loaf', 'pav', 'bun', 'baguette', 'focaccia'], 'bread'],
  [['croissant', 'pastry', 'puff', 'danish', 'roll', 'pie', 'tart'], 'pastry'],
  [['cupcake', 'muffin', 'cake', 'gateau', 'brownie'], 'cake'],
  [['cookie', 'biscuit'], 'cookie'],
  [['ice cream', 'kulfi', 'gelato'], 'icecream'],
  [['ladoo', 'laddoo', 'barfi', 'mithai', 'sweet', 'jalebi', 'peda', 'katli', 'halwa', 'chocolate', 'candy'], 'sweet'],
  [['coffee', 'espresso', 'latte', 'cappuccino', 'chai', 'tea'], 'cup'],
  [['milk', 'curd', 'dahi', 'paneer', 'butter', 'cheese'], 'milk'],
  [['egg'], 'egg'],
  [['juice', 'smoothie', 'shake', 'lassi', 'soda', 'water', 'oil', 'ghee'], 'bottle'],
  [['rice', 'basmati', 'poha', 'oats', 'grain', 'sugar'], 'sack'],
  [['atta', 'flour', 'wheat', 'maida', 'besan'], 'wheat'],
  [['dal', 'lentil', 'curry', 'thali', 'biryani', 'soup', 'noodle', 'maggi'], 'bowl'],
  [['salt', 'jam', 'pickle', 'achar', 'honey', 'jar', 'dry fruit', 'nuts', 'almond', 'cashew'], 'jar'],
  [['spice', 'masala', 'turmeric', 'haldi', 'jeera', 'chilli', 'pepper', 'herb', 'mint', 'coriander', 'plant', 'sapling', 'succulent'], 'sprout'],
  [['apple', 'mango', 'banana', 'fruit', 'orange', 'grape', 'papaya'], 'apple'],
  [['vegetable', 'sabzi', 'greens', 'tomato', 'onion', 'potato', 'spinach', 'leaf'], 'leaf'],
  [['gift', 'hamper', 'box'], 'gift'],
  [['saree', 'sari', 'lehenga', 'dress', 'gown', 'frock', 'dupatta', 'scarf', 'stole', 'shawl'], 'dress'],
  [['shirt', 'top', 't-shirt', 'tshirt', 'kurta', 'kurti', 'jeans', 'trouser', 'pant', 'jacket'], 'shirt'],
  [['shoe', 'sandal', 'jutti', 'chappal', 'sneaker'], 'shoe'],
  [['bag', 'purse', 'clutch', 'tote', 'wallet'], 'bag'],
  [['earring', 'jhumka', 'necklace', 'bangle', 'jewel', 'ring', 'bracelet'], 'gem'],
  [['lipstick', 'lip', 'kajal', 'makeup', 'cosmetic'], 'tube'],
  [['mirror', 'comb'], 'mirror'],
  [['haircut', 'hair', 'trim', 'facial', 'scissor'], 'scissors'],
  [['first aid', 'bandage', 'plaster'], 'cross'],
  [['thermometer', 'bp monitor', 'oximeter'], 'therm'],
  [['medicine', 'tablet', 'capsule', 'vitamin', 'syrup', 'pill'], 'pill'],
  [['book', 'novel', 'notebook', 'diary'], 'book'],
  [['pen', 'pencil', 'stationery', 'marker'], 'pen'],
  [['charger', 'cable', 'adapter', 'plug'], 'plug'],
  [['headphone', 'earphone', 'earbud', 'speaker'], 'headphones'],
  [['phone', 'mobile'], 'phone'],
  [['rose', 'bouquet', 'flower', 'garland'], 'flower'],
  [['pot', 'vase', 'pottery', 'diya'], 'pot'],
];

// Product-level grouping used for storefront filter chips.
const PRODUCT_GROUPS = [
  [['bread', 'sourdough', 'loaf', 'baguette', 'bun', 'pav', 'focaccia'], 'Breads'],
  [['croissant', 'pastry', 'puff', 'danish', 'tart', 'pie', 'roll'], 'Pastries'],
  [['cake', 'cupcake', 'muffin', 'brownie', 'cookie', 'donut'], 'Cakes & Treats'],
  [['coffee', 'espresso', 'latte', 'cappuccino', 'tea', 'chai', 'juice', 'shake', 'lassi', 'smoothie'], 'Beverages'],
  [['ladoo', 'laddoo', 'barfi', 'jalebi', 'peda', 'mithai', 'halwa', 'katli'], 'Sweets'],
  [['saree', 'sari', 'lehenga', 'kurta', 'kurti', 'dress', 'gown', 'shirt', 'top', 'jeans', 'dupatta'], 'Clothing'],
  [['earring', 'jhumka', 'necklace', 'bangle', 'bag', 'purse', 'scarf', 'stole', 'jewel', 'tote'], 'Accessories'],
  [['atta', 'flour', 'rice', 'dal', 'sugar', 'salt', 'oil', 'ghee', 'masala', 'spice', 'turmeric', 'jeera'], 'Staples'],
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

export function iconFor(productName, storeCategory) {
  for (const [words, icon] of ICON_RULES) {
    if (words.some((w) => includesWord(productName, w))) return icon;
  }
  return themeFor(storeCategory).icon;
}

export function productGroupFor(productName, storeCategory) {
  for (const [words, group] of PRODUCT_GROUPS) {
    if (words.some((w) => includesWord(productName, w))) return group;
  }
  return storeCategory && storeCategory !== DEFAULT_CATEGORY.name ? storeCategory : 'Featured';
}

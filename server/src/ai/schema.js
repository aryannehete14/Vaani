import { z } from 'zod';
import { ICON_KEYS, THEME_IDS } from './catalog.js';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// A photo is an https link or a file uploaded through POST /api/uploads.
export const PHOTO = /^(https:\/\/\S+|\/uploads\/[a-f0-9]{24}\.(?:jpg|png|webp))$/;

export const ProductSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(80),
  price: z.number().nonnegative().max(10_000_000),
  category: z.string().trim().max(40).default('Featured'),
  description: z.string().trim().max(240).default(''),
  // An icon name from ICON_KEYS, or a photo (see PHOTO).
  image: z.string().trim().max(500).default('package'),
});

// The canonical, persisted store shape. Every write goes through this.
export const StoreSchema = z.object({
  storeName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(120).default(''),
  about: z.string().trim().max(600).default(''),
  logo: z.union([z.literal(''), z.string().max(500).regex(PHOTO)]).default(''),
  category: z.string().trim().max(40).default('Retail'),
  theme: z.enum(THEME_IDS),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  contact: z.object({
    phone: z.string().trim().max(30).default(''),
    whatsapp: z.string().regex(/^\d{0,15}$/).default(''),
    email: z.union([z.literal(''), z.email().max(120)]).default(''),
    address: z.string().trim().max(200).default(''),
  }),
  hours: z.object({
    open: z.string().regex(TIME),
    close: z.string().regex(TIME),
    days: z.string().trim().max(60).default('Daily'),
  }),
  products: z.array(ProductSchema).max(200),
  social: z
    .object({
      instagram: z.string().trim().max(60).default(''),
      facebook: z.string().trim().max(120).default(''),
    })
    .default({ instagram: '', facebook: '' }),
});

// Structured-output target for Claude. Every field is required and uses an empty
// string or 0 for "not mentioned", which keeps the JSON schema simple and strict.
export const LlmStoreSchema = z.object({
  storeName: z.string().describe('Shop name exactly as the owner says it; empty if not mentioned'),
  tagline: z.string().describe('A warm, specific 4-9 word tagline written for this shop'),
  about: z.string().describe('Two or three sentences about the shop using only facts the owner said; empty if they said nothing about themselves'),
  category: z
    .string()
    .describe('One of: Bakery, Cafe, Sweet Shop, Restaurant, Boutique, Grocery, Fruits & Vegetables, Florist, Pharmacy, Electronics, Books & Stationery, Salon & Beauty, Handicrafts, Retail'),
  theme: z
    .enum(THEME_IDS)
    .describe('Storefront colours: sage (grocery, produce, general), clay (bakery, cafe, food, crafts), indigo (clothing, electronics, books), marigold (sweets, festive), plum (beauty, flowers), teal (pharmacy, health)'),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  contact: z.object({
    phone: z.string().describe('Phone number as spoken, digits and + only; empty if not mentioned'),
    whatsapp: z.string().describe('WhatsApp number if different from phone; else same as phone; empty if none'),
    email: z.string(),
    address: z.string().describe('Street address / area / city as spoken'),
  }),
  hours: z.object({
    open: z.string().describe('Opening time, 24h HH:MM; empty if not mentioned'),
    close: z.string().describe('Closing time, 24h HH:MM; empty if not mentioned'),
    days: z.string().describe('Open days like "Daily", "Mon-Sat", "Tue-Sun", or "Mon, Wed, Fri"'),
  }),
  products: z.array(
    z.object({
      name: z.string().describe('Product name in Title Case'),
      price: z.number().describe('Price as a number in the stated currency; 0 if not stated'),
      category: z.string().describe('Short product group for filtering, e.g. Breads, Pastries, Sarees, Staples'),
      description: z.string().describe('One appetising or helpful sentence, max 14 words, no invented claims'),
      image: z.enum(ICON_KEYS).describe('The outline icon that best represents the product'),
    }),
  ),
  social: z.object({ instagram: z.string(), facebook: z.string() }),
});

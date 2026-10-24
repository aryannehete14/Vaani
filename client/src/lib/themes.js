// Leaf storefront colour themes. Keep ids in sync with THEME_IDS in server/src/ai/catalog.js.
// Every `action` and `brand` colour carries white text at WCAG AA (4.5:1) or better.

export const THEMES = {
  sage: { label: 'Sage', hint: 'Groceries and fresh produce', ground: '#F4F1EA', panel: '#DCE3D6', tile: '#E3E9DF', brand: '#5F7A64', deep: '#24392C', muted: '#4E5F53', action: '#B9521C' },
  clay: { label: 'Clay', hint: 'Bakeries, cafes and crafts', ground: '#F7F0E8', panel: '#EBD8C7', tile: '#F3E4D6', brand: '#9A5B3B', deep: '#3B2418', muted: '#6B4A38', action: '#A33A1F' },
  indigo: { label: 'Indigo', hint: 'Clothing, books and gadgets', ground: '#F3F2F8', panel: '#DADCF0', tile: '#E7E8F6', brand: '#3E4A8C', deep: '#1E2547', muted: '#4A5072', action: '#C2410C' },
  marigold: { label: 'Marigold', hint: 'Sweets and festive shops', ground: '#FCF6E7', panel: '#F4DE9F', tile: '#F8EBC6', brand: '#8A5A00', deep: '#3D2A05', muted: '#6A5420', action: '#8F2D56' },
  plum: { label: 'Plum', hint: 'Beauty and flowers', ground: '#F8F2F4', panel: '#EAD5DE', tile: '#F2E4EA', brand: '#7B3F61', deep: '#3A1C2D', muted: '#654557', action: '#6E2C52' },
  teal: { label: 'Teal', hint: 'Chemists and wellness', ground: '#EFF6F5', panel: '#CDE3E0', tile: '#DEEDEB', brand: '#2C6E6A', deep: '#123332', muted: '#3E5A58', action: '#B5432F' },
};

export const THEME_ORDER = ['sage', 'clay', 'indigo', 'marigold', 'plum', 'teal'];

export const themeOf = (store) => THEMES[store?.theme] ?? THEMES.sage;

/** Inline CSS variables that switch a Leaf storefront to the store's theme. */
export function themeStyle(id) {
  const t = THEMES[id] ?? THEMES.sage;
  return {
    '--l-ground': t.ground,
    '--l-panel': t.panel,
    '--l-tile': t.tile,
    '--l-brand': t.brand,
    '--l-deep': t.deep,
    '--l-muted': t.muted,
    '--l-action': t.action,
  };
}

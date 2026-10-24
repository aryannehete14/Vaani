// Outline product icons. Keys match ICON_KEYS in server/src/ai/catalog.js.
// Products store an icon key (or an https photo URL) in `image`; never emoji.

const ICONS = {
  package: <path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  basket: <path d="M3 9h18l-1.5 10.5a2 2 0 0 1-2 1.5h-11a2 2 0 0 1-2-1.5zM8 9V7a4 4 0 0 1 8 0v2M9 13v4M15 13v4M12 13v4" />,
  bag: <path d="M6 7h12l1 13H5zM9 7a3 3 0 0 1 6 0" />,
  bread: <path d="M4 11a4 4 0 0 1 4-4h8a4 4 0 0 1 1 7.9V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4.1A4 4 0 0 1 4 11z" />,
  pastry: <path d="M4 15c0-5 3.6-9 8-9s8 4 8 9c-1.5 1.3-4.5 2-8 2s-6.5-.7-8-2zM9 7.5 10 17M15 7.5 14 17" />,
  cake: <path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M5 15c2 1 3 1 5 0s3-1 5 0 3 1 4 0M12 8v4M12 4.5v.5" />,
  cookie: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9h.01M14 8h.01M15.5 13h.01M10 15h.01M12 11.5h.01" />
    </>
  ),
  cup: <path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1a3 3 0 0 1 0 6h-1M8 2v3M12 2v3" />,
  bottle: <path d="M8 3h8M9 3v4l-3 4v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8l-3-4V3M6 13h12" />,
  milk: <path d="M9 2h6v3l2 3v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-3zM7 12h10" />,
  egg: <path d="M12 3c-3.5 0-6 5-6 9a6 6 0 0 0 12 0c0-4-2.5-9-6-9z" />,
  sack: <path d="M7 3h10l-1 4c2 1.5 3 4 3 7a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6c0-3 1-5.5 3-7zM9 7h6" />,
  bowl: <path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1 1-2 2-2M13 7c0-1 1-2 2-2" />,
  wheat: (
    <path d="M12 22V8M12 8c-2-1-3-3-3-5 2 0 3 2 3 5zM12 8c2-1 3-3 3-5-2 0-3 2-3 5zM12 13c-2-1-4-2-4-4 2 0 4 1 4 4zM12 13c2-1 4-2 4-4-2 0-4 1-4 4zM12 18c-2-1-4-2-4-4 2 0 4 1 4 4zM12 18c2-1 4-2 4-4-2 0-4 1-4 4z" />
  ),
  jar: <path d="M7 4h10v3H7zM6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 12h6" />,
  leaf: <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16zM4 20c4-4 7-6 10-7" />,
  sprout: <path d="M12 22v-9M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 11c0-4 3-6 7-6 0 4-3 6-7 6z" />,
  apple: <path d="M12 7c-1-2-2.5-3-4-3M12 7c3-2 8-1 8 5 0 4-3 9-5 9-1.2 0-1.8-.6-3-.6S10.2 21 9 21c-2 0-5-5-5-9 0-6 5-7 8-5z" />,
  sweet: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M9 11h.01M14 10h.01M12 15h.01M15 14h.01M9.5 15.5h.01M12 3v3" />
    </>
  ),
  icecream: <path d="M8 11a4 4 0 1 1 8 0M7 11h10l-5 11z" />,
  gift: <path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8S9 3 7 5s5 3 5 3zM12 8s3-5 5-3-5 3-5 3z" />,
  shirt: <path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-1 1.5-2.3 2-4 2s-3-.5-4-2z" />,
  dress: <path d="M9 2h6M9 2l1 5-5 15h14L14 7l1-5M10 7h4" />,
  shoe: <path d="M3 16v-5l4-1 3 3 4 1 6 1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 18h18" />,
  gem: <path d="M6 3h12l3 6-9 12L3 9zM3 9h18M12 21 8 9l4-6 4 6z" />,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  tube: <path d="M9 21h6v-9H9zM10 12V7l4-3v8" />,
  mirror: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v6M9 21h6" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </>
  ),
  pill: <path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7zM7 7l10 10" />,
  cross: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />,
  therm: <path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
  pen: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  plug: <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4" />,
  headphones: <path d="M3 14v-2a9 9 0 0 1 18 0v2M3 14h3v6H4a1 1 0 0 1-1-1zM21 14h-3v6h2a1 1 0 0 0 1-1z" />,
  flower: (
    <>
      <circle cx="12" cy="9" r="3" />
      <path d="M12 6V3M12 12v10M9 9H6M18 9h-3M9.9 6.9 7.8 4.8M14.1 6.9l2.1-2.1M12 17c-2 0-4-1-5-3M12 19c2 0 4-1 5-3" />
    </>
  ),
  pot: <path d="M5 9h14l-2 11H7zM4 6h16v3H4zM12 3v3" />,
};

export const ICON_KEYS = Object.keys(ICONS);

// A photo is an https link or a file uploaded to this server (see PHOTO in server/src/ai/schema.js).
export const isImageUrl = (s) => /^(https:\/\/\S+|\/uploads\/[a-f0-9]{24}\.(?:jpg|png|webp))$/i.test(String(s ?? ''));

export function ProductIcon({ name, className = '', strokeWidth = 1.4 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name] ?? ICONS.package}
    </svg>
  );
}

/** A product's photo when the owner gave a URL, otherwise its outline icon on a soft tile. */
export function ProductVisual({ product, className = '', iconClass = 'size-[42%]' }) {
  if (isImageUrl(product.image)) {
    return <img src={product.image} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`grid place-items-center bg-leaf-tile text-leaf-brand ${className}`}>
      <ProductIcon name={product.image} className={iconClass} />
    </div>
  );
}

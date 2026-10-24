import { useEffect, useMemo, useState } from 'react';
import { loadCart, saveCart } from '../lib/storage.js';

/** Cart keyed by product id → quantity; persisted per store unless `persist` is false (previews). */
export function useCart(slug, products, { persist = true } = {}) {
  const [cart, setCart] = useState(() => (persist && slug ? loadCart(slug) : {}));

  useEffect(() => {
    if (persist && slug) saveCart(slug, cart);
  }, [cart, slug, persist]);

  const lines = useMemo(
    () =>
      products
        .filter((p) => cart[p.id] > 0)
        .map((product) => ({ product, qty: cart[product.id] })),
    [cart, products],
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  const setQty = (id, qty) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 99);
      return next;
    });

  return {
    lines,
    count,
    total,
    qty: (id) => cart[id] ?? 0,
    add: (id) => setQty(id, (cart[id] ?? 0) + 1),
    remove: (id) => setQty(id, (cart[id] ?? 0) - 1),
    clear: () => setCart({}),
  };
}

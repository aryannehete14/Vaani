import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/format.js';

export function RecentStores({ refreshKey }) {
  const [stores, setStores] = useState(null);

  useEffect(() => {
    api
      .listStores()
      .then((d) => setStores(d.stores))
      .catch(() => setStores([]));
  }, [refreshKey]);

  if (stores && stores.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 id="recent-title" className="font-display text-3xl font-semibold tracking-tight">Recently built with Vaani</h2>
          <p className="mt-1 text-muted">Real storefronts, each made from a few spoken sentences.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(stores ?? Array.from({ length: 3 }, () => null)).map((s, i) =>
          s ? (
            <motion.div key={s.slug} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/s/${s.slug}`}
                className="brand-scope group block overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                style={{ '--brand': s.primaryColor }}
              >
                <div className="relative flex h-28 items-center justify-center gap-3 overflow-hidden bg-[linear-gradient(135deg,color-mix(in_oklab,var(--brand)_22%,var(--surface)),color-mix(in_oklab,var(--brand)_6%,var(--surface)))]">
                  {s.preview.map((emoji, j) => (
                    <span key={j} className="text-4xl transition-transform duration-300 group-hover:scale-110" style={{ transitionDelay: `${j * 40}ms` }} aria-hidden>
                      {/^https/.test(emoji) ? '🛍️' : emoji}
                    </span>
                  ))}
                  <ArrowUpRight className="absolute right-4 top-4 size-5 text-ink/40 transition group-hover:text-ink" />
                </div>
                <div className="p-5">
                  <p className="font-display text-lg font-semibold tracking-tight">{s.storeName}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted">{s.tagline}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-brand/12 px-2 py-0.5 text-brand-fg">{s.category}</span>
                    <span className="text-muted">{s.productCount} items · {timeAgo(s.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div key={i} className="h-52 animate-pulse rounded-3xl bg-sunken" />
          ),
        )}
      </div>
    </section>
  );
}

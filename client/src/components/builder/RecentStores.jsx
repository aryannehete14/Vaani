import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/format.js';
import { ProductIcon, isImageUrl } from '../../lib/icons.jsx';
import { THEMES } from '../../lib/themes.js';

export function RecentStores({ refreshKey }) {
  const [stores, setStores] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    api
      .listStores()
      .then((d) => setStores(d.stores))
      .catch((err) => {
        setStores([]);
        setError(err.message);
      });
  }, [refreshKey]);

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8" role="alert">
        <div className="sign-card flex items-start gap-3 bg-[#F6D9D0] p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" strokeWidth={2.2} />
          <div>
            <p className="font-extrabold">The shop list could not load.</p>
            <p className="mt-1 text-sm">{error} If you started the app with npm run dev, check the terminal: run npm run stop, then npm run dev again.</p>
          </div>
        </div>
      </section>
    );
  }
  if (stores && stores.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
      <h2 id="recent-title" className="sign-type text-[48px] text-board">
        Shops on the street
      </h2>
      <p className="mt-2 text-[17px] text-muted">Real shops, each built from a few spoken sentences.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(stores ?? Array.from({ length: 3 }, () => null)).map((s, i) =>
          s ? (
            <motion.div key={s.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/s/${s.slug}`} className="group block overflow-hidden rounded-lg border-[3px] border-ink bg-card transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#1A1A17]">
                <div className="relative flex h-28 items-center justify-center gap-3 border-b-[3px] border-ink" style={{ background: (THEMES[s.theme] ?? THEMES.sage).panel, color: (THEMES[s.theme] ?? THEMES.sage).brand }}>
                  {s.preview.map((img, j) => (
                    <span key={j} className="grid size-14 place-items-center overflow-hidden rounded-full bg-white/70">
                      {isImageUrl(img) ? <img src={img} alt="" className="size-full rounded-full object-cover" /> : <ProductIcon name={img} className="size-7" strokeWidth={1.4} />}
                    </span>
                  ))}
                  <ArrowUpRight className="absolute right-3 top-3 size-5 text-ink/50 transition group-hover:text-ink" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    {s.logo && <img src={s.logo} alt="" className="size-10 shrink-0 rounded-full border-2 border-ink bg-white object-contain" />}
                    <p className="sign-type text-[26px]">{s.storeName}</p>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted">{s.tagline}</p>
                  <p className="mt-3 text-xs font-bold text-muted">
                    {s.category}, {s.productCount} items, {timeAgo(s.createdAt)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div key={i} className="h-52 animate-pulse rounded-lg border-[3px] border-ink/20 bg-card" />
          ),
        )}
      </div>
    </section>
  );
}

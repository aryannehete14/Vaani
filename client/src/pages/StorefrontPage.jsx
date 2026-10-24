import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { Storefront } from '../components/storefront/Storefront.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import { api } from '../lib/api.js';
import { getEditKey } from '../lib/storage.js';
import { themeOf } from '../lib/themes.js';

function Skeleton() {
  return (
    <div className="min-h-dvh bg-[#F4F1EA]" aria-busy="true" aria-label="Loading shop">
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-6 md:px-8">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-[#E3E9DF]" />
          <div className="h-4 w-44 rounded-full bg-[#E3E9DF]" />
        </div>
        <div className="mt-6 h-96 rounded-[40px] bg-white" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-[28px] bg-[#E3E9DF]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StorefrontPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    api
      .getStore(slug)
      .then((d) => alive && setState({ status: 'ready', store: d.store }))
      .catch((err) => alive && setState({ status: err.status === 404 ? 'missing' : 'error', error: err.message }));
    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!state.store) return;
    document.title = `${state.store.storeName}: ${state.store.tagline}`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeOf(state.store).ground);
    return () => document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F4EFE3');
  }, [state.store]);

  if (state.status === 'loading') return <Skeleton />;
  if (state.status === 'missing') return <NotFoundPage title="No shop here" message="We couldn't find that shop. The link may be mistyped." />;
  if (state.status === 'error') return <NotFoundPage title="Something went wrong" message={state.error} />;

  const isOwner = Boolean(getEditKey(slug));
  return (
    <>
      {isOwner && (
        <Link
          to={`/dashboard/${slug}`}
          className="fixed bottom-28 right-4 z-40 inline-flex h-11 items-center gap-2 rounded-md border-[3px] border-ink bg-sign px-4 font-sign text-sm font-extrabold text-ink shadow-[4px_4px_0_#1A1A17] transition hover:-translate-y-0.5 md:bottom-auto md:top-24"
        >
          <Settings2 className="size-4" /> Manage shop
        </Link>
      )}
      <Storefront store={state.store} slug={slug} />
    </>
  );
}

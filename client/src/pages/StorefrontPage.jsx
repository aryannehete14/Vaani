import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { Storefront } from '../components/storefront/Storefront.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import { api } from '../lib/api.js';
import { getEditKey } from '../lib/storage.js';

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-6 md:px-8" aria-busy="true" aria-label="Loading store">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-sunken" />
        <div className="h-4 w-40 rounded bg-sunken" />
      </div>
      <div className="mt-14 h-6 w-48 rounded-full bg-sunken" />
      <div className="mt-6 h-14 w-3/4 max-w-lg rounded-xl bg-sunken" />
      <div className="mt-4 h-5 w-2/3 max-w-md rounded bg-sunken" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 rounded-3xl bg-sunken" />
        ))}
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
    if (state.store) document.title = `${state.store.storeName} — ${state.store.tagline}`;
  }, [state.store]);

  if (state.status === 'loading') return <Skeleton />;
  if (state.status === 'missing') return <NotFoundPage message="We couldn't find that store. The link may be mistyped." />;
  if (state.status === 'error') {
    return <NotFoundPage title="Something went wrong" message={state.error} />;
  }

  const isOwner = Boolean(getEditKey(slug));
  return (
    <>
      {isOwner && (
        <Link
          to={`/dashboard/${slug}`}
          className="fixed bottom-24 right-4 z-40 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-canvas shadow-lift transition hover:scale-105 md:bottom-auto md:top-20"
        >
          <Settings2 className="size-4" /> Manage store
        </Link>
      )}
      <Storefront store={state.store} slug={slug} />
    </>
  );
}

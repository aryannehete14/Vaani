import { useEffect } from 'react';
import { Home } from 'lucide-react';
import { ButtonLink, Logo } from '../components/ui/primitives.jsx';

export function NotFoundPage({ title = 'Page not found', message = "This page doesn't exist." }) {
  useEffect(() => {
    document.title = `${title} — Vaani`;
  }, [title]);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <Logo className="justify-center" />
        <p className="mt-10 text-7xl" aria-hidden>
          🏪
        </p>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted">{message}</p>
        <ButtonLink to="/" variant="primary" size="lg" className="mt-8">
          <Home className="size-4.5" /> Build a store with Vaani
        </ButtonLink>
      </div>
    </main>
  );
}

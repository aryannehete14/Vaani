import { useEffect } from 'react';
import { Home } from 'lucide-react';
import { ButtonLink, Logo } from '../components/ui/primitives.jsx';

export function NotFoundPage({ title = 'Shutters are down', message = "This page doesn't exist." }) {
  useEffect(() => {
    document.title = `${title}: Vaani`;
  }, [title]);

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4">
      <div className="w-full max-w-lg text-center">
        <Logo className="justify-center" />
        <div className="mx-auto mt-10 rounded-[10px] bg-board p-2.5 shadow-[8px_8px_0_#1A1A17]">
          <div className="rounded-md border-2 border-sign px-6 py-10">
            <p className="sign-type text-[clamp(2.5rem,9vw,3.75rem)] text-sign">{title}</p>
            <p className="mt-4 text-[16px] text-[#E9E3D2]">{message}</p>
          </div>
        </div>
        <ButtonLink to="/" variant="sign" size="md" className="mt-10">
          <Home className="size-4.5" /> Build a shop with Vaani
        </ButtonLink>
      </div>
    </main>
  );
}

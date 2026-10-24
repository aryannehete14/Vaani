import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';
import { Button } from '../ui/primitives.jsx';

/** Printable "Scan to order" card with a real QR code for the shop counter. */
export function CounterCard({ url, storeName, className = '' }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let alive = true;
    QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1A1A17', light: '#FFFFFF' } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''));
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <section className={`print-area flex flex-col self-start items-center gap-4 rounded-lg border-[3px] border-ink bg-sign p-6 text-center ${className}`}>
      <p className="sign-label">For your counter</p>
      <div className="grid size-48 place-items-center rounded-md border-[3px] border-ink bg-white p-3">
        {/* Generated locally by the qrcode library from our own URL, never from user HTML. */}
        {svg ? <div className="size-full [&>svg]:size-full" role="img" aria-label={`QR code for ${url}`} dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="text-xs text-muted">QR code</span>}
      </div>
      <div>
        <p className="sign-type text-[30px]">Scan to order</p>
        <p className="mt-1 text-sm font-bold">{storeName} on WhatsApp</p>
      </div>
      <Button variant="paper" size="md" onClick={() => window.print()} className="print:hidden">
        <Printer className="size-4.5" /> Print poster
      </Button>
    </section>
  );
}

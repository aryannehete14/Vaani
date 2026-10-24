import { forwardRef, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Loader2 } from 'lucide-react';

const VARIANTS = {
  board: 'bg-board text-card border-ink hover:bg-[#145040]',
  sign: 'bg-sign text-ink border-ink hover:bg-[#F0C252]',
  paper: 'bg-card text-ink border-ink hover:bg-white',
  ink: 'bg-ink text-card border-ink hover:bg-[#2B2B26]',
  wa: 'bg-wa text-white border-ink hover:bg-[#1A6A3B]',
  ghost: 'bg-transparent text-ink border-transparent hover:bg-ink/5',
};
const SIZES = {
  sm: 'h-10 px-3.5 text-sm gap-1.5 border-2 rounded-md',
  md: 'h-12 px-5 text-[15px] gap-2 border-[3px] rounded-lg',
  lg: 'h-[60px] px-6 text-xl gap-2.5 border-[3px] rounded-lg font-black [font-stretch:80%] uppercase tracking-wide',
  icon: 'size-11 border-2 rounded-md',
};

export const buttonClass = (variant = 'paper', size = 'md', extra = '') =>
  `inline-flex shrink-0 items-center justify-center font-sign font-extrabold whitespace-nowrap transition duration-150 active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export const Button = forwardRef(function Button({ variant, size, className = '', loading, children, ...props }, ref) {
  return (
    <button ref={ref} type="button" className={buttonClass(variant, size, className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="size-4.5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ to, href, variant, size, className = '', children, ...props }) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} {...props}>
      {children}
    </Link>
  );
}

export function Field({ label, hint, children, className = '' }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SignCard({ className = '', children, ...props }) {
  return (
    <div className={`sign-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the text is still visible to copy by hand.
    }
  };
  return (
    <Button variant="sign" size="sm" onClick={copy} className={className} aria-label={`${label}: ${text}`}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

export function Logo({ className = '', small = false }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 no-underline ${className}`} aria-label="Vaani home">
      <span className={`sign-type text-board ${small ? 'text-[24px]' : 'text-[30px]'}`}>Vaani</span>
      {!small && (
        <span className="-rotate-3 rounded-[3px] border-2 border-ink bg-sign px-1.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-ink">
          EST. 2026
        </span>
      )}
    </Link>
  );
}

/** A small painted tag, slightly askew. */
export function Tag({ children, className = '', tilt = '-rotate-1' }) {
  return <span className={`inline-block rounded-[3px] border-2 border-ink bg-sign px-2.5 py-1 sign-label text-ink ${tilt} ${className}`}>{children}</span>;
}

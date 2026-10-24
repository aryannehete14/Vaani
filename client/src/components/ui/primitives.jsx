import { forwardRef, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-ink text-canvas hover:bg-ink/90 shadow-soft',
  brand: 'bg-brand text-white hover:brightness-110 shadow-soft',
  vaani: 'vaani-gradient text-white shadow-lift hover:brightness-110',
  whatsapp: 'bg-[#1FAF54] text-white hover:bg-[#1A9A49] shadow-soft',
  secondary: 'bg-surface text-ink border border-line hover:border-ink/25 hover:bg-sunken/60',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'text-red-600 hover:bg-red-500/10 dark:text-red-400',
};
const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  lg: 'h-13 px-6 text-base gap-2.5 rounded-2xl',
  icon: 'size-10 rounded-xl',
};

export const buttonClass = (variant = 'primary', size = 'md', extra = '') =>
  `inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export const Button = forwardRef(function Button({ variant, size, className = '', loading, children, ...props }, ref) {
  return (
    <button ref={ref} type="button" className={buttonClass(variant, size, className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
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
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink/80">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-3xl border border-line bg-surface shadow-soft ${className}`} {...props}>
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
      // Clipboard can be blocked; the text is still visible to copy manually.
    }
  };
  return (
    <Button variant="secondary" size="sm" onClick={copy} className={className} aria-label={`${label}: ${text}`}>
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight ${className}`} aria-label="Vaani home">
      <span className="vaani-gradient grid size-8 place-items-center rounded-[10px] shadow-soft">
        <svg viewBox="0 0 24 24" className="size-4.5 fill-white" aria-hidden>
          <rect x="5" y="7" width="2.6" height="10" rx="1.3" />
          <rect x="10.7" y="4" width="2.6" height="16" rx="1.3" />
          <rect x="16.4" y="9" width="2.6" height="6" rx="1.3" />
        </svg>
      </span>
      Vaani
    </Link>
  );
}

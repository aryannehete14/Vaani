import { Check } from 'lucide-react';
import { THEMES, THEME_ORDER } from '../../lib/themes.js';

/** Six Leaf colour themes, each drawn as a tiny storefront so owners can see what they pick. */
export function ThemePicker({ value, onChange, compact = false }) {
  return (
    <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`} role="radiogroup" aria-label="Storefront colours">
      {THEME_ORDER.map((id) => {
        const t = THEMES[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={`group relative overflow-hidden rounded-lg border-ink bg-card text-left transition ${
              active ? 'border-[3px] shadow-[4px_4px_0_#1A1A17]' : 'border-2 hover:-translate-y-0.5'
            }`}
          >
            <span className="relative block h-16 overflow-hidden" style={{ background: t.ground }} aria-hidden>
              <span className="absolute -right-3 -top-2 size-16 rounded-bl-[40px]" style={{ background: t.panel }} />
              <span className="absolute left-2.5 top-2.5 size-5 rounded-full" style={{ background: t.brand }} />
              <span className="absolute left-2.5 top-9 h-2 w-14 rounded-full" style={{ background: t.deep, opacity: 0.8 }} />
              <span className="absolute bottom-2 left-2.5 h-3.5 w-10 rounded-full" style={{ background: t.action }} />
              <span className="absolute bottom-3 right-4 size-6 rounded-full" style={{ background: t.tile, border: `1.5px solid ${t.brand}` }} />
            </span>
            <span className="block px-2.5 py-2">
              <span className="block text-sm font-extrabold">{t.label}</span>
              {!compact && <span className="block truncate text-[11px] text-muted">{t.hint}</span>}
            </span>
            {active && (
              <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full border-2 border-ink bg-sign">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

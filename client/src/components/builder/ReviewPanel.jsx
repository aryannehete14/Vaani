import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Sparkles, Zap, Store, Clock, Package, RotateCcw, Rocket } from 'lucide-react';
import { DetailsEditor } from '../editors/DetailsEditor.jsx';
import { ProductsEditor } from '../editors/ProductsEditor.jsx';
import { Button, Card } from '../ui/primitives.jsx';

function Section({ icon: Icon, title, summary, open, onToggle, children }) {
  return (
    <div className="border-t border-line first:border-t-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-sunken/50 sm:px-6" aria-expanded={open}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sunken text-ink/70">
          <Icon className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          <span className="block truncate text-sm text-muted">{summary}</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-5 pb-6 pt-1 sm:px-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ReviewPanel({ draft, setDraft, engine, warnings, onPublish, onReset, publishing, error }) {
  const [open, setOpen] = useState('products');
  const toggle = (key) => setOpen((o) => (o === key ? null : key));
  const priced = draft.products.filter((p) => p.price > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Here's what we understood</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
            engine === 'claude' ? 'vaani-gradient text-white' : 'bg-sunken text-ink/75 ring-1 ring-inset ring-line'
          }`}
          title={engine === 'claude' ? 'Parsed by Claude (Anthropic) with structured output' : 'Parsed by Vaani’s built-in offline parser'}
        >
          {engine === 'claude' ? <Sparkles className="size-3.5" /> : <Zap className="size-3.5" />}
          {engine === 'claude' ? 'Claude AI' : 'Offline parser'}
        </span>
      </div>
      <p className="text-muted">Everything is editable — your preview updates as you type.</p>

      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm" aria-label="Things to check">
            {warnings.map((w) => (
              <li key={w} className="flex gap-2.5 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                {w}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden">
        <Section icon={Store} title="Shop details" summary={`${draft.storeName} · ${draft.category}`} open={open === 'basics'} onToggle={() => toggle('basics')}>
          <DetailsEditor store={draft} onChange={setDraft} sections={['basics']} />
        </Section>
        <Section
          icon={Clock}
          title="Hours & contact"
          summary={[draft.hours.days, draft.contact.phone || 'no phone', draft.contact.address || 'no address'].join(' · ')}
          open={open === 'contact'}
          onToggle={() => toggle('contact')}
        >
          <DetailsEditor store={draft} onChange={setDraft} sections={['hours', 'contact']} />
        </Section>
        <Section icon={Package} title={`Products (${draft.products.length})`} summary={`${priced} with prices`} open={open === 'products'} onToggle={() => toggle('products')}>
          <ProductsEditor store={draft} onChange={setDraft} compact />
        </Section>
      </Card>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="sticky bottom-3 z-10 flex gap-2 rounded-3xl border border-line bg-surface/85 p-2 shadow-lift backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
        <Button variant="secondary" size="lg" onClick={onReset} className="px-4" aria-label="Start over">
          <RotateCcw className="size-4.5" />
          <span className="hidden sm:inline">Start over</span>
        </Button>
        <Button variant="vaani" size="lg" onClick={onPublish} loading={publishing} disabled={!draft.storeName.trim()} className="flex-1">
          {!publishing && <Rocket className="size-5" />} Publish storefront
        </Button>
      </div>
    </div>
  );
}

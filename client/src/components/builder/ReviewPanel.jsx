import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Zap, Sparkles } from 'lucide-react';
import { DetailsEditor } from '../editors/DetailsEditor.jsx';
import { ProductsEditor } from '../editors/ProductsEditor.jsx';
import { ThemePicker } from '../editors/ThemePicker.jsx';
import { Button } from '../ui/primitives.jsx';

function Section({ title, aside, children }) {
  return (
    <section className="sign-card p-5 sm:p-6">
      {title && (
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="sign-label">{title}</h2>
          {aside && <span className="text-[13px] font-bold text-muted">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function ReviewPanel({ draft, setDraft, engine, warnings, onPublish, onReset, publishing, error }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-bold"
          title={engine === 'claude' ? 'Read by Claude (Anthropic) with structured output' : 'Read by the built-in offline parser'}
        >
          {engine === 'claude' ? <Sparkles className="size-3.5" /> : <Zap className="size-3.5" />}
          {engine === 'claude' ? 'Read by Claude AI' : 'Read by the offline parser'}
        </span>
        <h1 className="sign-type mt-4 text-[clamp(2.75rem,6vw,4rem)] text-board">
          Here is what
          <br />
          we heard
        </h1>
        <p className="mt-3 text-[17px] text-muted">Fix anything below. The preview changes as you type.</p>
      </div>

      <AnimatePresence>
        {warnings.map((w, i) => (
          <motion.div
            key={w}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-start gap-3 rounded-lg border-2 border-ink bg-sign px-4 py-3 ${i % 2 ? 'rotate-[0.4deg]' : '-rotate-[0.5deg]'}`}
            role="note"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0" strokeWidth={2.2} />
            <p className="text-[15px] font-semibold leading-snug">{w}</p>
          </motion.div>
        ))}
      </AnimatePresence>

      <Section>
        <DetailsEditor store={draft} onChange={setDraft} sections={['basics']} />
      </Section>
      <Section title="Store colours" aside="You can change this any time">
        <ThemePicker value={draft.theme} onChange={(theme) => setDraft({ ...draft, theme })} />
      </Section>
      <Section>
        <DetailsEditor store={draft} onChange={setDraft} sections={['hours', 'contact']} />
      </Section>
      <Section title="Products and prices" aside={`${draft.products.length} ${draft.products.length === 1 ? 'item' : 'items'}`}>
        <ProductsEditor store={draft} onChange={setDraft} compact />
      </Section>

      {error && (
        <p className="rounded-lg border-2 border-ink bg-[#F6D9D0] px-4 py-3 text-sm font-bold" role="alert">
          {error}
        </p>
      )}

      <div className="sticky bottom-3 z-10 flex gap-3 rounded-xl bg-paper/95 p-1 backdrop-blur lg:static lg:bg-transparent lg:p-0">
        <Button variant="paper" size="md" onClick={onReset} className="h-[60px]">
          Start over
        </Button>
        <Button variant="board" size="lg" onClick={onPublish} loading={publishing} disabled={!draft.storeName.trim()} className="sign-shadow flex-1">
          Put my shop online
        </Button>
      </div>
    </div>
  );
}

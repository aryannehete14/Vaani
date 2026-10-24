import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Ear, Brain, Palette, Rocket } from 'lucide-react';

const STEPS = [
  { icon: Ear, label: 'Listening to your description' },
  { icon: Brain, label: 'Understanding products, prices & hours' },
  { icon: Palette, label: 'Designing your storefront' },
  { icon: Rocket, label: 'Getting it ready' },
];

export function GenerationProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mx-auto w-full max-w-md rounded-[2rem] border border-line bg-surface p-7 shadow-lift"
      role="status"
      aria-live="polite"
    >
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-sunken">
        <motion.div className="vaani-gradient h-full rounded-full" initial={{ width: '5%' }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ ease: 'easeOut' }} />
      </div>
      <ol className="space-y-4">
        {STEPS.map(({ icon: Icon, label }, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className={`flex items-center gap-3.5 transition-opacity ${i > step ? 'opacity-35' : ''}`}>
              <span className={`relative grid size-10 shrink-0 place-items-center rounded-2xl ${done ? 'bg-emerald-500 text-white' : active ? 'vaani-gradient text-white' : 'bg-sunken text-muted'}`}>
                {active && <motion.span className="absolute inset-0 rounded-2xl bg-[#db2777]/30" animate={{ scale: [1, 1.35], opacity: [0.6, 0] }} transition={{ duration: 1.1, repeat: Infinity }} />}
                {done ? <Check className="size-5" /> : <Icon className="size-5" />}
              </span>
              <span className={`text-[15px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

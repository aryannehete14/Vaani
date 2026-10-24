import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Ear, ListChecks, Paintbrush, Store } from 'lucide-react';

const STEPS = [
  { icon: Ear, label: 'Listening to your description' },
  { icon: ListChecks, label: 'Writing down products, prices and timings' },
  { icon: Paintbrush, label: 'Painting your sign' },
  { icon: Store, label: 'Opening the shutters' },
];

export function GenerationProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, rotate: -1 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} className="sign-card sign-shadow p-7" role="status" aria-live="polite">
      <p className="sign-type text-[34px] text-board">Hold on, painting...</p>
      <div className="mt-5 h-4 overflow-hidden rounded-[3px] border-2 border-ink bg-white">
        <motion.div className="h-full bg-sign" initial={{ width: '5%' }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ ease: 'easeOut' }} />
      </div>
      <ol className="mt-6 space-y-3.5">
        {STEPS.map(({ icon: Icon, label }, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className={`flex items-center gap-3.5 transition-opacity ${i > step ? 'opacity-35' : ''}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink ${done ? 'bg-board text-card' : active ? 'bg-sign' : 'bg-white'}`}>
                {done ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
              </span>
              <span className={`text-[16px] ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </motion.div>
  );
}

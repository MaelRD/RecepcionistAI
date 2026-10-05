import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { LiveStep } from '../../context/ConversationContext'
import { STEP_LABEL } from '../../lib/labels'
import { cn } from '../../lib/cn'

/** Estados de trabajo de la IA, visibles mientras procesa (sin razonamiento interno). */
export function ProcessingSteps({ steps }: { steps: LiveStep[] }) {
  const visible = steps.filter((s) => s.status !== 'pending')
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
      className="mt-3 ml-[38px] flex flex-col gap-1"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {visible.map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 text-[12.5px]"
          >
            <span className={cn('flex size-4 items-center justify-center rounded-full transition-colors', s.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-brand-100')}>
              {s.status === 'done' ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }}>
                  <Check className="size-2.5" strokeWidth={3} />
                </motion.span>
              ) : (
                <span className="size-1.5 animate-pulse rounded-full bg-brand-600" />
              )}
            </span>
            <span
              className={cn(
                s.status === 'done'
                  ? 'text-zinc-400'
                  : 'bg-[linear-gradient(90deg,#3f3f46_0%,#3f3f46_40%,#a1a1aa_50%,#3f3f46_60%,#3f3f46_100%)] bg-[length:200%_100%] bg-clip-text font-medium text-transparent [animation:shimmer_1.6s_linear_infinite]',
              )}
            >
              {STEP_LABEL[s.id]}
              {s.status === 'active' && '…'}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

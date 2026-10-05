import { AnimatePresence, motion } from 'framer-motion'
import type { HandoffStage } from '../../types'
import type { LiveStep } from '../../context/ConversationContext'
import { cn } from '../../lib/cn'

export const liveHandoff = (stage: HandoffStage, busy: boolean, steps: LiveStep[]): HandoffStage =>
  busy && steps.some((s) => s.id === 'handoff' && s.status === 'active') ? 'required' : stage

const COPY: Record<HandoffStage, { label: string; className: string }> = {
  ai: { label: 'AI handling', className: 'bg-brand-50 text-brand-700 ring-brand-500/15' },
  required: { label: 'Human required', className: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  transferred: { label: 'Transferred · Recepción', className: 'bg-amber-50 text-amber-800 ring-amber-600/20' },
}

export function HandoffPill({ stage, busy, steps, className }: { stage: HandoffStage; busy: boolean; steps: LiveStep[]; className?: string }) {
  const live = liveHandoff(stage, busy, steps)
  const c = COPY[live]
  return (
    <span className={cn('relative inline-flex h-7 items-center overflow-hidden rounded-full px-2.5 text-[12px] font-medium ring-1 ring-inset transition-colors duration-300', c.className, className)}>
      <span className={cn('mr-1.5 size-1.5 rounded-full', live === 'ai' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500')} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={live} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.18 }}>
          {c.label}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

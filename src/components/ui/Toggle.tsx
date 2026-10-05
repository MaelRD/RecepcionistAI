import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
        checked ? 'bg-brand-600' : 'bg-zinc-200',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className={cn('size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.2)]', checked && 'ml-auto')}
      />
    </button>
  )
}

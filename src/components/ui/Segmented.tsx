import { motion } from 'framer-motion'
import { useId } from 'react'
import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  disabled?: boolean
}

export function Segmented<T extends string>({ value, options, onChange, className }: { value: T; options: Option<T>[]; onChange: (v: T) => void; className?: string }) {
  const id = useId()
  return (
    <div className={cn('inline-flex rounded-xl bg-zinc-100 p-1 ring-1 ring-inset ring-zinc-950/5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40',
            value === o.value ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800',
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${id}`}
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)]"
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}

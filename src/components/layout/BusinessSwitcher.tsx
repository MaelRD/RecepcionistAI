import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BUSINESSES, BUSINESS_ORDER } from '../../data/businesses'
import { useAppStore } from '../../context/AppStore'
import { BusinessIcon } from '../ui/BusinessIcon'
import { cn } from '../../lib/cn'

export function BusinessSwitcher({ compact, align = 'left' }: { compact?: boolean; align?: 'left' | 'right' }) {
  const { business, setBusinessId } = useAppStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-xl text-left transition',
          compact ? 'h-9 px-2 ring-1 ring-zinc-950/10 hover:bg-zinc-50' : 'bg-white p-2 ring-1 ring-zinc-950/[0.07] shadow-[0_1px_2px_rgb(0_0_0/0.03)] hover:ring-zinc-950/15',
        )}
      >
        <span className={cn('flex shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors', compact ? 'size-6' : 'size-8')}>
          <BusinessIcon icon={business.icon} className={compact ? 'size-3.5' : 'size-4'} />
        </span>
        <span className="min-w-0 flex-1">
          {!compact && <span className="block text-[11px] text-zinc-400">Negocio</span>}
          <span className="block truncate text-[13px] font-medium">{compact ? business.label : business.name}</span>
        </span>
        <ChevronDown className={cn('size-3.5 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute z-30 mt-1.5 w-64 origin-top rounded-2xl bg-white p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-zinc-950/[0.07]',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <li className="px-2.5 pt-1.5 pb-2 text-[11px] text-zinc-400">Una misma IA, configurada para cada negocio</li>
            {BUSINESS_ORDER.map((id) => {
              const b = BUSINESSES[id]
              const active = id === business.id
              return (
                <li key={id}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setBusinessId(id)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-zinc-50"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg" style={{ background: b.accent[50], color: b.accent[600] }}>
                      <BusinessIcon icon={b.icon} className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{b.label}</span>
                      <span className="block truncate text-[11.5px] text-zinc-400">{b.name}</span>
                    </span>
                    {active && <Check className="size-4 text-brand-600" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

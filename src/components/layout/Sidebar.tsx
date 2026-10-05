import { motion } from 'framer-motion'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { NAV } from './nav'
import { useAppStore } from '../../context/AppStore'
import { useLead } from '../../context/LeadContext'
import { BusinessSwitcher } from './BusinessSwitcher'
import { AIOrb } from '../ui/Avatar'
import { cn } from '../../lib/cn'

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex size-8 items-center justify-center rounded-[10px] bg-zinc-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.15),0_2px_6px_-1px_rgb(0_0_0/0.3)]">
        <span className="size-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,var(--brand-500))]" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold tracking-[-0.01em]">Recepcionista IA</p>
          <p className="text-[11px] text-zinc-400">Demo interactiva</p>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ compact }: { compact?: boolean }) {
  const { view, navigate, settings, resetDemo } = useAppStore()
  const { openLead } = useLead()

  return (
    <aside className={cn('flex h-full shrink-0 flex-col border-r border-zinc-950/[0.06] bg-[#fbfbfb]', compact ? 'w-[72px] items-center px-2 py-4' : 'w-[248px] px-3 py-4')}>
      <div className={cn('mb-5', compact ? '' : 'px-1.5')}>
        <Brand compact={compact} />
      </div>

      {!compact && (
        <div className="mb-5">
          <BusinessSwitcher />
        </div>
      )}

      <nav className={cn('flex flex-col gap-0.5', compact && 'items-center')} aria-label="Módulos">
        {!compact && <p className="eyebrow mb-1.5 px-2.5">Workspace</p>}
        {NAV.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={compact ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2.5 rounded-xl text-[13.5px] font-medium transition-colors',
                compact ? 'size-11 justify-center' : 'h-9 px-2.5',
                active ? 'text-zinc-900' : 'text-zinc-500 hover:bg-zinc-950/[0.03] hover:text-zinc-800',
              )}
            >
              {active && (
                <motion.span
                  layoutId={compact ? 'nav-compact' : 'nav'}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05),0_0_0_1px_rgb(0_0_0/0.05)]"
                />
              )}
              <item.icon className={cn('relative size-[17px]', active && 'text-brand-600')} strokeWidth={active ? 2.1 : 1.8} />
              {!compact && <span className="relative">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto w-full space-y-3">
        {!compact ? (
          <>
            <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
              <AIOrb className="size-7" />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-medium">{settings.name}</p>
                <p className="flex items-center gap-1.5 text-[11.5px] text-zinc-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> En línea · 24/7
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-900 p-4 text-white shadow-[0_8px_24px_-12px_rgb(0_0_0/0.5)]">
              <p className="text-[13px] leading-snug font-medium">¿Una recepcionista así para tu negocio?</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-400">Se adapta a cómo ya trabajas.</p>
              <button onClick={openLead} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-white underline-offset-4 hover:underline">
                Quiero una <ArrowUpRight className="size-3.5" />
              </button>
            </div>
            <button onClick={resetDemo} className="flex w-full items-center gap-2 px-2.5 text-[12px] text-zinc-400 transition hover:text-zinc-700">
              <RotateCcw className="size-3" /> Restablecer demo
            </button>
          </>
        ) : (
          <div className="flex justify-center">
            <AIOrb className="size-7" />
          </div>
        )}
      </div>
    </aside>
  )
}

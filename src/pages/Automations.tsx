import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  Check,
  Clock,
  FileText,
  Hourglass,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Split,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Automation } from '../types'
import { useAppStore } from '../context/AppStore'
import { useLead } from '../context/LeadContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Toggle } from '../components/ui/Toggle'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { DemoNotice } from '../components/ui/DemoNotice'
import { cn } from '../lib/cn'

const ICONS: Record<string, LucideIcon> = {
  message: MessageCircle,
  sparkles: Sparkles,
  calendar: CalendarDays,
  check: Check,
  user: UserRound,
  send: Send,
  clock: Clock,
  bell: Bell,
  hourglass: Hourglass,
  split: Split,
  alert: TriangleAlert,
  file: FileText,
}

const EFFECT: Record<string, string> = {
  booking: 'Si se desactiva, la IA solo toma los datos y deja la cita como pendiente para revisión.',
  reminder: 'Las citas en la agenda muestran el recordatorio programado.',
  handoff: 'Si se desactiva, la IA no transfiere y ofrece alternativas.',
  reactivation: 'Disponible como flujo adicional según el negocio.',
}

export function AutomationsPage() {
  const { automations, toggleAutomation, recordAutomationRun } = useAppStore()
  const { openLead } = useLead()
  const [primary, ...rest] = automations

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow="Flujos"
        title="Automations"
        description="Procesos que la recepcionista ejecuta por sí sola. Actívalos o pruébalos: los cambios afectan el comportamiento del chat."
      />

      {primary && <FlowCard automation={primary} onToggle={() => toggleAutomation(primary.id)} onRun={() => recordAutomationRun(primary.id)} wide />}
      <div className="grid gap-4 md:grid-cols-2">
        {rest.map((a) => (
          <FlowCard key={a.id} automation={a} onToggle={() => toggleAutomation(a.id)} onRun={() => recordAutomationRun(a.id)} />
        ))}
        <button onClick={openLead} className="group flex min-h-[220px] flex-col items-start justify-end rounded-2xl border border-dashed border-zinc-300 p-6 text-left transition hover:border-brand-500/40 hover:bg-brand-50/40">
          <p className="text-[15px] font-semibold">¿Tu proceso es distinto?</p>
          <p className="mt-1 text-[13px] text-pretty text-zinc-500">Anticipos, listas de espera, encuestas post-cita, seguimiento de tratamientos… cada flujo se diseña según cómo trabajas.</p>
          <span className="mt-3 text-[13px] font-medium text-brand-600 group-hover:underline">Cuéntame cómo trabajas →</span>
        </button>
      </div>

      <DemoNotice />
    </div>
  )
}

function FlowCard({ automation: a, onToggle, onRun, wide }: { automation: Automation; onToggle: () => void; onRun: () => void; wide?: boolean }) {
  const [active, setActive] = useState(-1)
  const timers = useRef<number[]>([])
  const running = active >= 0

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const run = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    a.steps.forEach((_, i) => timers.current.push(window.setTimeout(() => setActive(i), i * 700)))
    timers.current.push(
      window.setTimeout(() => {
        setActive(a.steps.length)
        onRun()
      }, a.steps.length * 700),
    )
    timers.current.push(window.setTimeout(() => setActive(-1), a.steps.length * 700 + 1600))
  }

  return (
    <motion.section layout className={cn('card p-5 md:p-6', !a.enabled && 'bg-zinc-50/60')}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold">{a.name}</h2>
            {a.enabled ? <Badge tone="green" dot>Activa</Badge> : <Badge>Inactiva</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-pretty text-zinc-500">{a.description}</p>
        </div>
        <Toggle checked={a.enabled} onChange={onToggle} label={`Activar ${a.name}`} />
      </div>

      <div className={cn('mt-5', wide ? 'flex flex-col gap-0 md:flex-row md:items-stretch' : 'flex flex-col')}>
        {a.steps.map((s, i) => {
          const Icon = ICONS[s.icon] ?? Sparkles
          const done = running && active > i
          const current = running && active === i
          return (
            <div key={s.label} className={cn('flex', wide ? 'md:flex-1 md:flex-col' : 'flex-col', 'flex-col')}>
              {i > 0 && (
                <div className={cn('relative', wide ? 'ml-[17px] h-5 w-px md:mx-0 md:mt-[17px] md:mb-0 md:hidden' : 'ml-[17px] h-5 w-px')}>
                  <span className="absolute inset-0 bg-zinc-200" />
                  <motion.span className="absolute inset-0 origin-top bg-brand-500" initial={false} animate={{ scaleY: running && active >= i ? 1 : 0 }} transition={{ duration: 0.3 }} />
                </div>
              )}
              <div className={cn('flex items-center gap-3', wide && 'md:flex-col md:items-start md:gap-2.5')}>
                <div className={cn('flex items-center', wide && 'md:w-full')}>
                  <motion.span
                    animate={current ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'relative flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors duration-300',
                      done || (running && active === a.steps.length) ? 'bg-brand-600 text-white ring-brand-600' : current ? 'bg-brand-50 text-brand-700 ring-brand-500/40' : a.enabled ? 'bg-white text-zinc-600 ring-zinc-950/10' : 'bg-white text-zinc-300 ring-zinc-950/5',
                    )}
                  >
                    <Icon className="size-4" />
                    {current && <span className="absolute inset-0 animate-ping rounded-xl ring-2 ring-brand-500/40 [animation-duration:1.2s]" />}
                  </motion.span>
                  {wide && i < a.steps.length - 1 && (
                    <div className="relative mx-2 hidden h-px flex-1 md:block">
                      <span className="absolute inset-0 bg-zinc-200" />
                      <motion.span className="absolute inset-0 origin-left bg-brand-500" initial={false} animate={{ scaleX: running && active > i ? 1 : 0 }} transition={{ duration: 0.4 }} />
                    </div>
                  )}
                </div>
                <div className={cn('min-w-0', wide && 'md:pr-3')}>
                  <p className={cn('text-[13.5px] font-medium', !a.enabled && 'text-zinc-400')}>{s.label}</p>
                  <p className="text-[12px] text-zinc-400">{s.detail}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
        <Button size="sm" variant="secondary" onClick={run} disabled={!a.enabled || running}>
          <Play className="size-3.5" /> Probar flujo
        </Button>
        <AnimatePresence mode="wait">
          {running && active === a.steps.length ? (
            <motion.span key="ok" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-600">
              <Check className="size-3.5" /> Ejecutado correctamente
            </motion.span>
          ) : (
            <motion.span key="runs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12.5px] text-zinc-400">
              <span className="font-medium text-zinc-600 tabular-nums">{a.runs}</span> ejecuciones · Disparador: {a.trigger}
            </motion.span>
          )}
        </AnimatePresence>
        <p className="w-full text-[12px] text-zinc-400">{EFFECT[a.id]}</p>
      </div>
    </motion.section>
  )
}

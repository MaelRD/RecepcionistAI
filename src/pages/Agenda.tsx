import { AnimatePresence, motion } from 'framer-motion'
import { Bell, CalendarX, Check, MessagesSquare } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Appointment } from '../types'
import { useAppStore } from '../context/AppStore'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DAY_SHORT, addDays, fromISO, toISO, today } from '../lib/dates'
import { cn } from '../lib/cn'

const STATUS: Record<Appointment['status'], { label: string; tone: 'green' | 'amber' | 'rose' | 'neutral' }> = {
  confirmed: { label: 'Confirmada', tone: 'green' },
  pending: { label: 'Pendiente', tone: 'amber' },
  cancelled: { label: 'Cancelada', tone: 'rose' },
  completed: { label: 'Completada', tone: 'neutral' },
}

export function AgendaPage() {
  const { appointments, knowledge, setAppointmentStatus, isAutomationOn, navigate, business } = useAppStore()
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => toISO(addDays(today(), i))), [])
  const [selected, setSelected] = useState(days[0])
  const reminders = isAutomationOn('reminder')

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    days.forEach((d) => map.set(d, []))
    appointments.forEach((a) => map.get(a.date)?.push(a))
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))
    return map
  }, [appointments, days])

  const inWeek = appointments.filter((a) => days.includes(a.date))
  const active = inWeek.filter((a) => a.status !== 'cancelled')
  const byAI = active.filter((a) => a.source === 'ia').length

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow={business.name}
        title="Agenda"
        description="Las citas creadas o canceladas desde el chat aparecen aquí al instante."
        actions={
          <Button variant="secondary" onClick={() => navigate('conversations')}>
            <MessagesSquare className="size-4" /> Agendar desde el chat
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Citas esta semana', value: active.length },
          { label: 'Agendadas por IA', value: `${active.length ? Math.round((byAI / active.length) * 100) : 0}%` },
          { label: 'Canceladas', value: inWeek.length - active.length },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[12px] text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Selector de día en móvil */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden">
        {days.map((d) => {
          const date = fromISO(d)
          const count = byDay.get(d)?.filter((a) => a.status !== 'cancelled').length ?? 0
          return (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={cn('flex w-14 shrink-0 flex-col items-center rounded-2xl py-2.5 transition', selected === d ? 'bg-zinc-900 text-white' : 'bg-white ring-1 ring-zinc-950/[0.07]')}
            >
              <span className={cn('text-[11px]', selected === d ? 'text-zinc-400' : 'text-zinc-400')}>{DAY_SHORT[date.getDay()]}</span>
              <span className="text-lg font-semibold tabular-nums">{date.getDate()}</span>
              <span className={cn('mt-0.5 size-1 rounded-full', count ? 'bg-brand-500' : 'bg-transparent')} />
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((d, idx) => {
          const date = fromISO(d)
          const hours = knowledge.hours.find((h) => h.day === date.getDay())
          const list = byDay.get(d) ?? []
          return (
            <section key={d} className={cn('min-w-0 rounded-2xl bg-white/60 p-2 ring-1 ring-zinc-950/[0.05]', selected !== d && 'hidden lg:block')}>
              <header className="flex items-baseline justify-between px-1.5 pt-1 pb-2.5">
                <p className="text-[13px] font-semibold">
                  {idx === 0 ? 'Hoy' : DAY_SHORT[date.getDay()]} <span className="font-normal text-zinc-400 tabular-nums">{date.getDate()}</span>
                </p>
                <p className="text-[10.5px] text-zinc-400">{hours?.closed ? 'Cerrado' : `${hours?.open}–${hours?.close}`}</p>
              </header>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {list.map((a) => (
                    <AppointmentItem key={a.id} a={a} reminders={reminders} onCancel={() => setAppointmentStatus(a.id, 'cancelled')} onComplete={() => setAppointmentStatus(a.id, 'completed')} />
                  ))}
                </AnimatePresence>
                {list.length === 0 && <p className="px-1.5 py-6 text-center text-[12px] text-zinc-300">{hours?.closed ? 'Sin servicio' : 'Sin citas'}</p>}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function AppointmentItem({ a, reminders, onCancel, onComplete }: { a: Appointment; reminders: boolean; onCancel: () => void; onComplete: () => void }) {
  const fresh = Date.now() - a.createdAt < 10 * 60_000
  const s = STATUS[a.status]
  const actionable = a.status === 'confirmed' || a.status === 'pending'
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={cn('group relative rounded-xl bg-white p-3 ring-1 shadow-[0_1px_2px_rgb(0_0_0/0.03)]', fresh ? 'ring-brand-500/40' : 'ring-zinc-950/[0.06]', a.status === 'cancelled' && 'opacity-55')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[12.5px] font-medium tabular-nums">{a.time}</span>
        {fresh ? <Badge tone="brand" dot>Nueva</Badge> : <Badge tone={s.tone}>{s.label}</Badge>}
      </div>
      <p className={cn('mt-1.5 truncate text-[13px] font-medium', a.status === 'cancelled' && 'line-through')}>{a.customerName}</p>
      <p className="truncate text-[12px] text-zinc-500">{a.serviceName}</p>
      <p className="mt-0.5 truncate text-[11.5px] text-zinc-400">{a.staffName}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {a.source === 'ia' && <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-medium text-brand-700">IA</span>}
        {reminders && actionable && (
          <span title="Recordatorio 24 h programado" className="text-zinc-300">
            <Bell className="size-3" />
          </span>
        )}
        {actionable && (
          <div className="ml-auto flex gap-1 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100">
            <button onClick={onComplete} title="Marcar como completada" aria-label="Marcar como completada" className="rounded-md p-1 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600">
              <Check className="size-3.5" />
            </button>
            <button onClick={onCancel} title="Cancelar cita" aria-label="Cancelar cita" className="rounded-md p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600">
              <CalendarX className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.article>
  )
}

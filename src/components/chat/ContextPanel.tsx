import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Bot, CalendarCheck, Check, CircleDot, Headset, ShieldCheck, Undo2, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useConversation } from '../../context/ConversationContext'
import { useAppStore } from '../../context/AppStore'
import { INTENT_LABEL, STATUS_LABEL, STEP_LABEL, STEP_STATUS } from '../../lib/labels'
import { capitalize, formatLongDate, weekdayName } from '../../lib/dates'
import { formatPrice } from '../../lib/format'
import { liveHandoff } from './HandoffPill'
import { DemoNotice } from '../ui/DemoNotice'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'

/** Panel de operaciones: lo que la IA va entendiendo y haciendo en tiempo real. */
export function ContextPanel({ embedded }: { embedded?: boolean }) {
  const { knowledge, settings, business } = useAppStore()
  const { state, steps, busy, returnToAI } = useConversation()
  const { slots } = state
  const service = knowledge.services.find((s) => s.id === slots.serviceId)
  const active = steps.find((s) => s.status === 'active')
  const statusText = busy && active ? STEP_STATUS[active.id] : STATUS_LABEL[state.status]
  const handoff = liveHandoff(state.handoff, busy, steps)
  const confirmed = state.status === 'confirmed' && !busy

  const fields: { label: string; value?: string }[] = [
    { label: 'Intent', value: state.intent ? INTENT_LABEL[state.intent] : undefined },
    { label: 'Customer', value: slots.name },
    { label: 'Phone', value: slots.phone },
    { label: 'Service', value: service ? `${service.name}` : undefined },
    { label: 'Price', value: service ? formatPrice(service.price, business.currency) : undefined },
    { label: 'Date', value: slots.date ? capitalize(weekdayName(slots.date)) : undefined },
    { label: 'Time', value: slots.time },
    { label: 'Staff', value: slots.time ? slots.staffName : undefined },
  ]

  return (
    <div className={cn('flex flex-col gap-4', embedded ? 'px-5 pb-4' : 'p-5')}>
      {/* Estado principal */}
      <div className={cn('relative overflow-hidden rounded-2xl p-4 ring-1 transition-colors duration-500', confirmed ? 'bg-emerald-50 ring-emerald-600/15' : handoff !== 'ai' ? 'bg-amber-50 ring-amber-600/15' : 'bg-white ring-zinc-950/[0.06] shadow-[var(--shadow-soft)]')}>
        <p className="eyebrow">Status</p>
        <div className="mt-2 flex items-center gap-2.5">
          <StatusIcon confirmed={confirmed} busy={busy} handoff={handoff !== 'ai'} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
              transition={{ duration: 0.2 }}
              className={cn('text-[15px] font-semibold tracking-[-0.01em]', confirmed ? 'text-emerald-800' : handoff !== 'ai' ? 'text-amber-900' : 'text-zinc-900')}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {confirmed && slots.date && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-[12.5px] text-emerald-700">
              {service?.name} · {capitalize(formatLongDate(slots.date))} · {slots.time}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Datos detectados */}
      <Section title="Conversation context">
        <dl className="divide-y divide-zinc-100">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-3 py-2 text-[13px]">
              <dt className="text-zinc-400">{f.label}</dt>
              <dd className="min-w-0 truncate text-right font-medium">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={f.value ?? '—'}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.2 }}
                    className={cn('inline-block rounded-md px-1.5 py-0.5', f.value ? 'animate-[flash_1.2s_ease-out] text-zinc-900' : 'text-zinc-300')}
                  >
                    {f.value ?? '—'}
                  </motion.span>
                </AnimatePresence>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Actividad del turno */}
      <Section title="Activity">
        {steps.length === 0 ? (
          <p className="py-1 text-[12.5px] text-zinc-400">Esperando mensaje del cliente…</p>
        ) : (
          <ol className="space-y-2 py-1">
            {steps.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 text-[12.5px]">
                <span className={cn('flex size-4 items-center justify-center rounded-full transition-colors duration-300', s.status === 'done' ? 'bg-emerald-500 text-white' : s.status === 'active' ? 'bg-brand-100' : 'bg-zinc-100')}>
                  {s.status === 'done' ? <Check className="size-2.5" strokeWidth={3} /> : s.status === 'active' ? <span className="size-1.5 animate-pulse rounded-full bg-brand-600" /> : null}
                </span>
                <span className={cn(s.status === 'pending' ? 'text-zinc-300' : s.status === 'active' ? 'font-medium text-zinc-900' : 'text-zinc-500')}>{STEP_LABEL[s.id]}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Escalamiento humano */}
      <Section title="Handoff">
        <div className="py-1">
          {(['ai', 'required', 'transferred'] as const).map((stage, i) => {
            const order = { ai: 0, required: 1, transferred: 2 }
            const reached = order[handoff] >= order[stage]
            const current = handoff === stage
            const Icon = stage === 'ai' ? Bot : stage === 'required' ? CircleDot : Headset
            return (
              <div key={stage}>
                {i > 0 && <ArrowDown className={cn('my-1 ml-[7px] size-3', reached ? 'text-amber-500' : 'text-zinc-200')} />}
                <div className={cn('flex items-center gap-2.5 text-[12.5px] transition-colors', current ? 'font-medium text-zinc-900' : reached ? 'text-zinc-500' : 'text-zinc-300')}>
                  <Icon className={cn('size-4', current && stage !== 'ai' && 'text-amber-600', current && stage === 'ai' && 'text-brand-600')} />
                  {stage === 'ai' ? 'AI handling' : stage === 'required' ? 'Human required' : 'Conversation transferred'}
                </div>
              </div>
            )
          })}
          <AnimatePresence>
            {state.handoff === 'transferred' && !busy && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-[12.5px] ring-1 ring-amber-600/15">
                  <span className="flex items-center gap-2 text-amber-900">
                    <UserRound className="size-3.5" /> Assigned to: <b className="font-semibold">Recepción</b>
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={returnToAI}>
                  <Undo2 className="size-3.5" /> Devolver a {settings.name}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* Reglas activas */}
      <Section title="Active rules">
        <ul className="space-y-1.5 py-1">
          {settings.instructions
            .filter((i) => i.enabled)
            .map((i) => (
              <li key={i.id} className="flex gap-2 text-[12.5px] text-zinc-600">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-zinc-400" /> {i.text}
              </li>
            ))}
        </ul>
      </Section>

      <DemoNotice compact />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white px-4 pt-3 pb-2 ring-1 ring-zinc-950/[0.06]">
      <p className="eyebrow mb-1">{title}</p>
      {children}
    </div>
  )
}

function StatusIcon({ confirmed, busy, handoff }: { confirmed: boolean; busy: boolean; handoff: boolean }) {
  if (confirmed)
    return (
      <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_4px_12px_-2px_rgb(16_185_129/0.5)]">
        <CalendarCheck className="size-3.5" />
      </motion.span>
    )
  if (handoff)
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-white">
        <Headset className="size-3.5" />
      </span>
    )
  return (
    <span className="relative flex size-7 items-center justify-center">
      {busy && <span className="absolute inset-0 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600 [animation-duration:0.9s]" />}
      <span className={cn('size-2.5 rounded-full', busy ? 'bg-brand-600' : 'bg-emerald-500')} />
    </span>
  )
}

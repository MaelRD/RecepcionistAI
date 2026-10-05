import { motion } from 'framer-motion'
import { CalendarCheck, CalendarX, Clock, Headset, MapPin, UserRound } from 'lucide-react'
import type { MessageCard } from '../../types'
import { capitalize, formatLongDate } from '../../lib/dates'
import { formatDuration, formatPrice } from '../../lib/format'
import { cn } from '../../lib/cn'

export function CardView({ card }: { card: MessageCard }) {
  switch (card.kind) {
    case 'appointment':
      return <AppointmentCard {...card} />
    case 'prices':
      return (
        <div className="w-[min(320px,78vw)] overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-950/[0.07] shadow-[var(--shadow-soft)]">
          {card.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-2.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{item.name}</p>
                <p className="text-[11.5px] text-zinc-400">{formatDuration(item.duration)}</p>
              </div>
              <p className="font-mono text-[13px] font-medium tabular-nums">{formatPrice(item.price, card.currency)}</p>
            </motion.div>
          ))}
        </div>
      )
    case 'hours':
      return (
        <div className="w-[min(300px,78vw)] rounded-2xl bg-white p-4 ring-1 ring-zinc-950/[0.07] shadow-[var(--shadow-soft)]">
          <div className="space-y-1.5">
            {card.rows.map((r) => (
              <div key={r.label} className="flex justify-between text-[13px]">
                <span className="text-zinc-500">{r.label}</span>
                <span className={cn('font-mono tabular-nums', r.value === 'Cerrado' ? 'text-zinc-400' : 'font-medium')}>{r.value}</span>
              </div>
            ))}
          </div>
          {card.address && (
            <p className="mt-3 flex gap-1.5 border-t border-zinc-100 pt-3 text-[12.5px] text-zinc-500">
              <MapPin className="mt-0.5 size-3.5 shrink-0" /> {card.address}
            </p>
          )}
        </div>
      )
    case 'handoff':
      return (
        <div className="flex w-[min(300px,78vw)] items-center gap-3 rounded-2xl bg-amber-50 p-3.5 ring-1 ring-amber-600/15">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white text-amber-600 ring-1 ring-amber-600/15">
            <Headset className="size-4" />
          </span>
          <div className="text-[13px]">
            <p className="font-medium text-amber-900">Conversación transferida</p>
            <p className="text-amber-700/80">Asignada a: {card.team}</p>
          </div>
        </div>
      )
  }
}

function AppointmentCard({ appointment: a, variant }: Extract<MessageCard, { kind: 'appointment' }>) {
  const confirmed = variant === 'confirmed'
  const cancelled = variant === 'cancelled'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={cn('relative w-[min(310px,78vw)] overflow-hidden rounded-2xl bg-white ring-1 shadow-[var(--shadow-soft)]', cancelled ? 'ring-zinc-950/[0.07]' : 'ring-brand-500/20')}
    >
      <div className={cn('flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-medium', confirmed ? 'bg-emerald-50 text-emerald-700' : cancelled ? 'bg-zinc-50 text-zinc-500' : 'bg-brand-50 text-brand-700')}>
        {cancelled ? <CalendarX className="size-3.5" /> : <CalendarCheck className="size-3.5" />}
        {confirmed ? 'Cita confirmada' : cancelled ? 'Cita cancelada' : a.status === 'pending' ? 'Pendiente de confirmación' : 'Cita agendada'}
        <span className="ml-auto font-mono text-[10.5px] opacity-60">#{a.id.slice(-5).toUpperCase()}</span>
      </div>
      <div className={cn('space-y-2 p-4', cancelled && 'opacity-60')}>
        <p className={cn('text-[15px] font-semibold tracking-[-0.01em]', cancelled && 'line-through decoration-zinc-300')}>{a.serviceName}</p>
        <p className="flex items-center gap-2 text-[13px] text-zinc-600">
          <Clock className="size-3.5 text-zinc-400" />
          {capitalize(formatLongDate(a.date))} · <span className="font-mono tabular-nums">{a.time}</span>
        </p>
        <p className="flex items-center gap-2 text-[13px] text-zinc-600">
          <UserRound className="size-3.5 text-zinc-400" />
          {a.customerName} · con {a.staffName}
        </p>
      </div>
    </motion.div>
  )
}

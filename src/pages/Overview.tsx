import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, CalendarCheck, Headset, MessagesSquare, Timer, TrendingUp, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppStore, upcoming } from '../context/AppStore'
import { useLead } from '../context/LeadContext'
import { APPOINTMENTS_SERIES, CHANNELS, CONVERSATIONS_SERIES, HOURLY_LOAD, INTENT_BREAKDOWN, OVERVIEW_METRICS as M } from '../data/metrics'
import { AreaChart, BarList, Donut, HourBars } from '../components/overview/Charts'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { DemoNotice } from '../components/ui/DemoNotice'
import { addDays, capitalize, formatShortDate, toISO, today } from '../lib/dates'
import { cn } from '../lib/cn'

export function OverviewPage() {
  const { stats, business, settings, appointments, navigate } = useAppStore()
  const { openLead } = useLead()

  const labels = CONVERSATIONS_SERIES.map((_, i) => capitalize(formatShortDate(toISO(addDays(today(), i - CONVERSATIONS_SERIES.length + 1)))))
  const series = CONVERSATIONS_SERIES.map((v, i) => (i === CONVERSATIONS_SERIES.length - 1 ? v + stats.conversations : v))
  const aptSeries = APPOINTMENTS_SERIES.map((v, i) => (i === APPOINTMENTS_SERIES.length - 1 ? v + stats.appointments : v))
  const next = upcoming(appointments).slice(0, 4)

  const kpis: { label: string; value: string; delta?: string; icon: typeof MessagesSquare; live?: number }[] = [
    { label: 'Conversaciones', value: String(M.conversations + stats.conversations), delta: '+12% vs. mes anterior', icon: MessagesSquare, live: stats.conversations },
    { label: 'Citas generadas', value: String(M.appointments + stats.appointments), delta: '+8 esta semana', icon: CalendarCheck, live: stats.appointments },
    { label: 'Clientes nuevos', value: String(M.newCustomers + stats.newCustomers), delta: 'Registrados por IA', icon: UserRound, live: stats.newCustomers },
    { label: 'Tiempo de respuesta', value: `${M.avgResponse} s`, delta: 'vs. 47 min manual', icon: Timer },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow={`${business.name} · Últimos 30 días`}
        title="Así trabaja tu recepcionista"
        description={`${settings.name} atiende, resuelve y agenda sin pausas. Estas métricas son de ejemplo y se suman a lo que hagas en esta sesión.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('conversations')}>
              Probar conversación <ArrowRight className="size-4" />
            </Button>
            <Button variant="primary" onClick={openLead}>
              Quiero una para mi negocio <ArrowUpRight className="size-4" />
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4 md:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-zinc-500">{k.label}</p>
              <k.icon className="size-4 text-zinc-300" />
            </div>
            <p className="mt-2.5 text-[28px] leading-none font-semibold tracking-[-0.03em] tabular-nums md:text-[32px]">{k.value}</p>
            <p className="mt-2 flex items-center gap-1 text-[12px] text-zinc-400">
              {k.live ? (
                <span className="text-brand-600">+{k.live} en esta sesión</span>
              ) : (
                <>
                  <TrendingUp className="size-3 text-emerald-500" /> {k.delta}
                </>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Conversaciones y citas" meta={<Legend />}>
          <AreaChart data={series} secondary={aptSeries} labels={labels} />
          <div className="mt-2 flex justify-between font-mono text-[10.5px] text-zinc-400">
            <span>{labels[0]}</span>
            <span>Hoy</span>
          </div>
        </Panel>

        <Panel title="Resolución">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Donut value={M.resolvedByAI} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">{M.resolvedByAI}%</p>
                <p className="text-[11px] text-zinc-400">por IA</p>
              </div>
            </div>
            <div className="space-y-3 text-[13px]">
              <div>
                <p className="flex items-center gap-2 text-zinc-500">
                  <span className="size-2 rounded-full bg-brand-600" /> Resuelto por IA
                </p>
                <p className="ml-4 font-semibold tabular-nums">{M.resolvedByAI}%</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-zinc-500">
                  <span className="size-2 rounded-full bg-amber-300" /> Escalado
                </p>
                <p className="ml-4 font-semibold tabular-nums">{M.escalated}%</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4">
            <div>
              <p className="text-[12px] text-zinc-400">Conversión a cita</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums">{M.conversion}%</p>
            </div>
            <div>
              <p className="text-[12px] text-zinc-400">Escalamientos hoy</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-lg font-semibold tabular-nums">
                {2 + stats.escalations} <Headset className="size-3.5 text-zinc-300" />
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="¿Qué piden los clientes?">
          <BarList items={INTENT_BREAKDOWN} />
        </Panel>

        <Panel title="Actividad por hora" meta={<Badge tone="brand">Fuera de horario: 31%</Badge>}>
          <HourBars data={HOURLY_LOAD} />
          <p className="mt-3 text-[12.5px] text-pretty text-zinc-500">Casi un tercio de los mensajes llega cuando el negocio está cerrado. Antes se perdían; ahora se agendan.</p>
        </Panel>

        <Panel title="Próximas citas" meta={<button onClick={() => navigate('agenda')} className="text-[12.5px] font-medium text-brand-600 hover:underline">Ver agenda</button>}>
          <ul className="-my-1 divide-y divide-zinc-100">
            {next.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="w-12 shrink-0 text-center">
                  <p className="font-mono text-[13px] font-medium tabular-nums">{a.time}</p>
                  <p className="text-[10.5px] text-zinc-400">{formatShortDate(a.date).split(' ').slice(0, 2).join(' ')}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{a.customerName}</p>
                  <p className="truncate text-[12px] text-zinc-400">{a.serviceName}</p>
                </div>
                {a.source === 'ia' && <Badge tone="brand">IA</Badge>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
          <p className="text-[13px] font-medium">Canales</p>
          {CHANNELS.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-[13px]">
              <span className="text-zinc-500">{c.label}</span>
              <span className="font-mono font-medium tabular-nums">{c.value}%</span>
            </div>
          ))}
        </div>
        <DemoNotice className="md:max-w-sm" />
      </div>
    </div>
  )
}

function Panel({ title, meta, className, children }: { title: string; meta?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cn('card p-5', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {meta}
      </div>
      {children}
    </motion.section>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11.5px] text-zinc-500">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded bg-brand-600" /> Conversaciones
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0 w-3 border-t border-dashed border-zinc-400" /> Citas
      </span>
    </div>
  )
}

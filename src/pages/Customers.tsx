import { motion } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAppStore, upcoming } from '../context/AppStore'
import { PageHeader } from '../components/ui/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { formatShortDate } from '../lib/dates'
import { normalize } from '../lib/format'

export function CustomersPage() {
  const { customers, appointments, business } = useAppStore()
  const [q, setQ] = useState('')

  const nextByPhone = useMemo(() => {
    const map = new Map<string, string>()
    upcoming(appointments).forEach((a) => {
      const key = a.phone.replace(/\D/g, '').slice(-8)
      if (!map.has(key)) map.set(key, `${formatShortDate(a.date)} · ${a.time}`)
    })
    return map
  }, [appointments])

  const list = customers.filter((c) => !q || normalize(c.name).includes(normalize(q)) || c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§'))
  const byAI = customers.filter((c) => c.source === 'ia').length

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow={business.name}
        title="Customers"
        description="Cada cliente que agenda por chat queda registrado automáticamente, con su historial y próxima cita."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o teléfono" className="input pl-9" />
        </label>
        <p className="flex items-center gap-1.5 text-[13px] text-zinc-500">
          <Sparkles className="size-3.5 text-brand-500" />
          {byAI} de {customers.length} registrados por la IA
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-[13.5px]">
          <thead className="hidden border-b border-zinc-100 text-[12px] text-zinc-400 md:table-header-group">
            <tr>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-3 py-3 font-medium">Visitas</th>
              <th className="px-3 py-3 font-medium">Última visita</th>
              <th className="px-3 py-3 font-medium">Próxima cita</th>
              <th className="px-5 py-3 font-medium">Etiquetas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {list.map((c, i) => {
              const next = nextByPhone.get(c.phone.replace(/\D/g, '').slice(-8))
              return (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 md:table-row md:p-0">
                  <td className="flex min-w-0 flex-1 items-center gap-3 md:px-5 md:py-3">
                    <Avatar name={c.name} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="font-mono text-[12px] text-zinc-400">{c.phone}</p>
                    </div>
                  </td>
                  <td className="hidden px-3 tabular-nums md:table-cell">{c.visits}</td>
                  <td className="hidden px-3 text-zinc-500 md:table-cell">{c.lastVisit ? formatShortDate(c.lastVisit) : '—'}</td>
                  <td className="order-last w-full pl-11 text-[12.5px] text-zinc-500 md:order-none md:w-auto md:table-cell md:px-3 md:pl-3 md:text-[13.5px]">
                    {next ? <span className="text-zinc-800">{next}</span> : <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="md:px-5">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} tone={t === 'Nuevo' ? 'brand' : t === 'VIP' ? 'amber' : t === 'Registrado por IA' ? 'blue' : 'neutral'}>
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        {list.length === 0 && <p className="py-12 text-center text-sm text-zinc-400">Sin resultados para “{q}”.</p>}
      </div>
    </div>
  )
}

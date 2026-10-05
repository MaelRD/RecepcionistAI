import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, RotateCcw, Trash } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { KnowledgeBase } from '../types'
import { useAppStore } from '../context/AppStore'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Toggle } from '../components/ui/Toggle'
import { Badge } from '../components/ui/Badge'
import { DemoNotice } from '../components/ui/DemoNotice'
import { DAY_NAMES, capitalize } from '../lib/dates'
import { uid } from '../lib/id'
import { cn } from '../lib/cn'

type Tab = 'services' | 'prices' | 'hours' | 'faqs' | 'policies' | 'locations' | 'staff'

const TABS: { id: Tab; label: string }[] = [
  { id: 'services', label: 'Servicios' },
  { id: 'prices', label: 'Precios' },
  { id: 'hours', label: 'Horarios' },
  { id: 'faqs', label: 'Preguntas frecuentes' },
  { id: 'policies', label: 'Políticas' },
  { id: 'locations', label: 'Ubicaciones' },
  { id: 'staff', label: 'Personal' },
]

type ListKey = 'services' | 'faqs' | 'policies' | 'locations' | 'staff'

export function KnowledgePage() {
  const { knowledge, updateKnowledge, resetKnowledge, knowledgeEdited, business, settings, navigate } = useAppStore()
  const [tab, setTab] = useState<Tab>('services')
  const [draft, setDraft] = useState<KnowledgeBase>(knowledge)
  const [saved, setSaved] = useState(false)

  useEffect(() => setDraft(knowledge), [knowledge])
  const dirty = JSON.stringify(draft) !== JSON.stringify(knowledge)

  const patchItem = <K extends ListKey>(key: K, id: string, patch: Partial<KnowledgeBase[K][number]>) =>
    setDraft((d) => ({ ...d, [key]: (d[key] as { id: string }[]).map((it) => (it.id === id ? { ...it, ...patch } : it)) }))
  const removeItem = (key: ListKey, id: string) => setDraft((d) => ({ ...d, [key]: (d[key] as { id: string }[]).filter((it) => it.id !== id) }))
  const addItem = <K extends ListKey>(key: K, item: KnowledgeBase[K][number]) => setDraft((d) => ({ ...d, [key]: [...d[key], item] }))

  const save = () => {
    updateKnowledge(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2600)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow={business.name}
        title="Knowledge"
        description={`Todo lo que ${settings.name} sabe de tu negocio. Edítalo aquí y la recepcionista lo usa en la siguiente respuesta.`}
        actions={
          <>
            {knowledgeEdited && (
              <Button variant="ghost" onClick={resetKnowledge}>
                <RotateCcw className="size-3.5" /> Restaurar original
              </Button>
            )}
            <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(knowledge)}>
              Descartar
            </Button>
            <Button variant="primary" disabled={!dirty} onClick={save}>
              Guardar cambios
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <div className="flex w-max gap-1 border-b border-zinc-950/[0.07] md:w-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('relative px-3 pt-1 pb-2.5 text-[13.5px] font-medium whitespace-nowrap transition-colors', tab === t.id ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-700')}>
              {t.label}
              {tab === t.id && <motion.span layoutId="kb-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="space-y-3">
          {tab === 'services' && (
            <>
              {draft.services.map((s) => (
                <ItemCard key={s.id} onRemove={() => removeItem('services', s.id)}>
                  <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                    <Field label="Nombre">
                      <input className="input" value={s.name} onChange={(e) => patchItem('services', s.id, { name: e.target.value })} />
                    </Field>
                    <Field label="Duración (min)">
                      <input className="input tabular-nums" type="number" min={10} step={5} value={s.duration} onChange={(e) => patchItem('services', s.id, { duration: Number(e.target.value) })} />
                    </Field>
                  </div>
                  <Field label="Descripción">
                    <input className="input" value={s.description} onChange={(e) => patchItem('services', s.id, { description: e.target.value })} />
                  </Field>
                  <Field label="Cómo lo piden los clientes" hint="Palabras clave separadas por coma">
                    <input className="input" value={s.keywords.join(', ')} onChange={(e) => patchItem('services', s.id, { keywords: e.target.value.split(',').map((k) => k.trim()) })} />
                  </Field>
                </ItemCard>
              ))}
              <AddButton onClick={() => addItem('services', { id: uid('svc'), name: 'Nuevo servicio', duration: 30, price: 0, description: '', keywords: [] })}>Agregar servicio</AddButton>
            </>
          )}

          {tab === 'prices' && (
            <div className="card divide-y divide-zinc-100">
              {draft.services.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{s.name}</p>
                    <p className="text-[12px] text-zinc-400">{s.duration} min</p>
                  </div>
                  <div className="relative w-36">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400">$</span>
                    <input className="input pr-12 pl-6 text-right font-mono tabular-nums" type="number" min={0} step={50} value={s.price} onChange={(e) => patchItem('services', s.id, { price: Number(e.target.value) })} />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-zinc-400">{business.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'hours' && (
            <div className="card divide-y divide-zinc-100">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const h = draft.hours.find((x) => x.day === day)!
                const set = (patch: Partial<typeof h>) => setDraft((d) => ({ ...d, hours: d.hours.map((x) => (x.day === day ? { ...x, ...patch } : x)) }))
                return (
                  <div key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                    <p className="w-24 text-[14px] font-medium">{capitalize(DAY_NAMES[day])}</p>
                    <Toggle checked={!h.closed} onChange={(open) => set({ closed: !open })} label={`Abrir ${DAY_NAMES[day]}`} />
                    {h.closed ? (
                      <span className="text-[13px] text-zinc-400">Cerrado</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="time" className="input w-[120px] font-mono" value={h.open} onChange={(e) => set({ open: e.target.value })} />
                        <span className="text-zinc-300">–</span>
                        <input type="time" className="input w-[120px] font-mono" value={h.close} onChange={(e) => set({ close: e.target.value })} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'faqs' && (
            <>
              {draft.faqs.map((f) => (
                <ItemCard key={f.id} onRemove={() => removeItem('faqs', f.id)}>
                  <Field label="Pregunta">
                    <input className="input" value={f.question} onChange={(e) => patchItem('faqs', f.id, { question: e.target.value })} />
                  </Field>
                  <Field label="Respuesta">
                    <textarea rows={2} className="input resize-none" value={f.answer} onChange={(e) => patchItem('faqs', f.id, { answer: e.target.value })} />
                  </Field>
                  <Field label="Se activa con" hint="Palabras clave separadas por coma">
                    <input className="input" value={f.keywords.join(', ')} onChange={(e) => patchItem('faqs', f.id, { keywords: e.target.value.split(',').map((k) => k.trim()) })} />
                  </Field>
                </ItemCard>
              ))}
              <AddButton onClick={() => addItem('faqs', { id: uid('faq'), question: '', answer: '', keywords: [] })}>Agregar pregunta</AddButton>
            </>
          )}

          {tab === 'policies' && (
            <>
              {draft.policies.map((p) => (
                <ItemCard key={p.id} onRemove={() => removeItem('policies', p.id)}>
                  <Field label="Política">
                    <input className="input" value={p.title} onChange={(e) => patchItem('policies', p.id, { title: e.target.value })} />
                  </Field>
                  <Field label="Detalle">
                    <textarea rows={2} className="input resize-none" value={p.body} onChange={(e) => patchItem('policies', p.id, { body: e.target.value })} />
                  </Field>
                </ItemCard>
              ))}
              <AddButton onClick={() => addItem('policies', { id: uid('pol'), title: '', body: '' })}>Agregar política</AddButton>
            </>
          )}

          {tab === 'locations' && (
            <>
              {draft.locations.map((l) => (
                <ItemCard key={l.id} onRemove={() => removeItem('locations', l.id)}>
                  <Field label="Nombre">
                    <input className="input" value={l.name} onChange={(e) => patchItem('locations', l.id, { name: e.target.value })} />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Dirección">
                      <input className="input" value={l.address} onChange={(e) => patchItem('locations', l.id, { address: e.target.value })} />
                    </Field>
                    <Field label="Referencia">
                      <input className="input" value={l.reference} onChange={(e) => patchItem('locations', l.id, { reference: e.target.value })} />
                    </Field>
                  </div>
                </ItemCard>
              ))}
              <AddButton onClick={() => addItem('locations', { id: uid('loc'), name: 'Nueva sucursal', address: '', reference: '' })}>Agregar ubicación</AddButton>
            </>
          )}

          {tab === 'staff' && (
            <>
              {draft.staff.map((m) => (
                <ItemCard key={m.id} onRemove={() => removeItem('staff', m.id)}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nombre">
                      <input className="input" value={m.name} onChange={(e) => patchItem('staff', m.id, { name: e.target.value })} />
                    </Field>
                    <Field label="Especialidad">
                      <input className="input" value={m.role} onChange={(e) => patchItem('staff', m.id, { role: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Servicios que atiende">
                    <div className="flex flex-wrap gap-1.5">
                      {draft.services.map((s) => {
                        const on = m.serviceIds.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => patchItem('staff', m.id, { serviceIds: on ? m.serviceIds.filter((x) => x !== s.id) : [...m.serviceIds, s.id] })}
                            className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-medium ring-1 ring-inset transition', on ? 'bg-brand-50 text-brand-700 ring-brand-500/20' : 'bg-white text-zinc-500 ring-zinc-950/10 hover:text-zinc-800')}
                          >
                            {on && <Check className="size-3" />} {s.name}
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                </ItemCard>
              ))}
              <AddButton onClick={() => addItem('staff', { id: uid('stf'), name: '', role: '', serviceIds: [] })}>Agregar persona</AddButton>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <DemoNotice />

      {/* Barra flotante de guardado */}
      <AnimatePresence>
        {(dirty || saved) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-zinc-900 py-2 pr-2 pl-4 text-white shadow-[var(--shadow-lift)] md:bottom-6"
          >
            {saved && !dirty ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <p className="flex-1 text-[13px]">Guardado. {settings.name} ya usa esta información.</p>
                <Button size="sm" variant="secondary" onClick={() => navigate('conversations')}>
                  Probar en el chat
                </Button>
              </>
            ) : (
              <>
                <p className="flex-1 text-[13px]">Tienes cambios sin guardar</p>
                <Button size="sm" variant="ghost" className="text-zinc-300 hover:bg-white/10 hover:text-white" onClick={() => setDraft(knowledge)}>
                  Descartar
                </Button>
                <Button size="sm" variant="brand" onClick={save}>
                  Guardar
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {knowledgeEdited && !dirty && (
        <p className="text-center">
          <Badge tone="brand" dot>
            Knowledge personalizada guardada en este navegador
          </Badge>
        </p>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-[12.5px] font-medium text-zinc-600">
        {label}
        {hint && <span className="font-normal text-zinc-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function ItemCard({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card group relative space-y-3 p-5">
      <button onClick={onRemove} aria-label="Eliminar" className="absolute top-3 right-3 rounded-lg p-1.5 text-zinc-300 transition hover:bg-rose-50 hover:text-rose-600">
        <Trash className="size-3.5" />
      </button>
      <div className="space-y-3 pr-6">{children}</div>
    </motion.div>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 py-3.5 text-[13.5px] font-medium text-zinc-500 transition hover:border-brand-500/40 hover:bg-brand-50/40 hover:text-brand-700">
      <Plus className="size-4" /> {children}
    </button>
  )
}

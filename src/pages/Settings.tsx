import { AnimatePresence, motion } from 'framer-motion'
import { Check, Plus, RotateCcw, Trash } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import type { EmojiLevel, Tone } from '../types'
import { useAppStore } from '../context/AppStore'
import { useConversation } from '../context/ConversationContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Segmented } from '../components/ui/Segmented'
import { Toggle } from '../components/ui/Toggle'
import { Button } from '../components/ui/Button'
import { AIOrb } from '../components/ui/Avatar'
import { DemoNotice } from '../components/ui/DemoNotice'
import { openingMessage } from '../lib/engine'
import { createVoice } from '../lib/voice'
import { uid } from '../lib/id'

export function SettingsPage() {
  const { settings, updateSettings, resetSettings, business, navigate } = useAppStore()
  const { reset } = useConversation()
  const [newRule, setNewRule] = useState('')
  const [name, setName] = useState(settings.name)
  const v = createVoice(settings)

  const addRule = (e: FormEvent) => {
    e.preventDefault()
    if (!newRule.trim()) return
    updateSettings({ instructions: [...settings.instructions, { id: uid('ins'), text: newRule.trim(), enabled: true }] })
    setNewRule('')
  }

  const preview = [
    { role: 'ai', text: openingMessage(business, settings).text },
    { role: 'customer', text: business.quickPrompts.book },
    { role: 'ai', text: `${v.sure()} ¿Qué horario ${v.t('prefiere', 'prefieres')}? Tengo 10:00, 12:30 y 16:00.` },
    { role: 'ai', text: `Reserva creada correctamente.${v.e('✅')} ${v.t('Le', 'Te')} envié la confirmación por WhatsApp.` },
  ]

  const tryInChat = () => {
    reset()
    navigate('conversations')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        eyebrow="Personalidad"
        title="AI Settings"
        description="Define cómo habla y qué reglas sigue la recepcionista. Los cambios se guardan automáticamente."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                resetSettings()
                setName('Sofía')
              }}
            >
              <RotateCcw className="size-3.5" /> Valores por defecto
            </Button>
            <Button variant="primary" onClick={tryInChat}>
              Probar en el chat
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card title="Identidad">
            <Row label="Nombre de la IA" hint="Así se presenta con los clientes">
              <input className="input sm:w-64" value={name}
                maxLength={24}
                onChange={(e) => {
                  setName(e.target.value)
                  if (e.target.value.trim()) updateSettings({ name: e.target.value.trim() })
                }}
              />
            </Row>
            <Row label="Idioma">
              <select className="input sm:w-64" value={settings.language} onChange={(e) => updateSettings({ language: e.target.value as 'es' })}>
                <option value="es">Español</option>
                <option value="en" disabled>
                  English (próximamente)
                </option>
              </select>
            </Row>
          </Card>

          <Card title="Estilo">
            <Row label="Tono" hint={settings.tone === 'casual' && v.usted ? 'La regla “tratar de usted” tiene prioridad sobre el tono.' : undefined}>
              <Segmented<Tone>
                value={settings.tone}
                onChange={(tone) => updateSettings({ tone })}
                options={[
                  { value: 'profesional', label: 'Profesional' },
                  { value: 'cercano', label: 'Cercano' },
                  { value: 'casual', label: 'Casual' },
                ]}
              />
            </Row>
            <Row label="Uso de emojis">
              <Segmented<EmojiLevel>
                value={settings.emojis}
                onChange={(emojis) => updateSettings({ emojis })}
                options={[
                  { value: 'ninguno', label: 'Ninguno' },
                  { value: 'bajo', label: 'Bajo' },
                  { value: 'normal', label: 'Normal' },
                ]}
              />
            </Row>
          </Card>

          <Card title="Instrucciones" description="Reglas que la recepcionista siempre respeta. Desactiva “Confirmar servicio…” y verás que agenda sin pedir confirmación.">
            <ul className="divide-y divide-zinc-100">
              <AnimatePresence initial={false}>
                {settings.instructions.map((ins) => (
                  <motion.li key={ins.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 py-3">
                    <Toggle
                      checked={ins.enabled}
                      label={ins.text}
                      onChange={(enabled) => updateSettings({ instructions: settings.instructions.map((x) => (x.id === ins.id ? { ...x, enabled } : x)) })}
                    />
                    <p className={ins.enabled ? 'flex-1 text-[14px]' : 'flex-1 text-[14px] text-zinc-400 line-through decoration-zinc-300'}>{ins.text}</p>
                    <button
                      onClick={() => updateSettings({ instructions: settings.instructions.filter((x) => x.id !== ins.id) })}
                      aria-label="Eliminar instrucción"
                      className="rounded-lg p-1.5 text-zinc-300 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <form onSubmit={addRule} className="mt-3 flex gap-2">
              <input className="input" value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Ej. Ofrecer siempre el primer horario disponible" />
              <Button type="submit" variant="secondary" disabled={!newRule.trim()}>
                <Plus className="size-4" /> Agregar
              </Button>
            </form>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 px-4 py-3">
              <AIOrb className="size-7" />
              <div className="leading-tight">
                <p className="text-[13.5px] font-semibold">{settings.name}</p>
                <p className="text-[11.5px] text-zinc-400">Vista previa en vivo</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[11.5px] text-emerald-600">
                <Check className="size-3" /> Guardado
              </span>
            </div>
            <div className="chat-backdrop space-y-2 p-4">
              {preview.map((m, i) => (
                <AnimatePresence key={i} mode="wait" initial={false}>
                  <motion.div
                    key={m.text}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={m.role === 'customer' ? 'flex justify-end' : 'flex'}
                  >
                    <p
                      className={
                        m.role === 'customer'
                          ? 'max-w-[85%] rounded-[18px] rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13.5px] text-white'
                          : 'max-w-[85%] rounded-[18px] rounded-tl-md bg-white px-3.5 py-2 text-[13.5px] ring-1 ring-zinc-950/[0.06]'
                      }
                    >
                      {m.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          </div>
          <DemoNotice className="mt-4" />
        </div>
      </div>
    </div>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-pretty text-zinc-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[14px] font-medium">{label}</p>
        {hint && <p className="text-[12.5px] text-zinc-400">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

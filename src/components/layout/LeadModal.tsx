import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CircleCheck, MessageCircle, Workflow, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Segmented'
import { useAppStore } from '../../context/AppStore'
import { storage } from '../../lib/storage'

type Stage = 'pitch' | 'form' | 'sent'
type Volume = 'low' | 'mid' | 'high'

const STEPS = [
  { icon: MessageCircle, title: 'Entendemos tu operación', body: 'Cómo agendas hoy, qué preguntan tus clientes y dónde se pierde tiempo.' },
  { icon: Workflow, title: 'Diseñamos los flujos', body: 'Reservas, recordatorios, cobros o escalamiento: solo lo que tu negocio necesita.' },
  { icon: Sparkles, title: 'La conectamos a tus canales', body: 'WhatsApp, tu web, Instagram y tu calendario o sistema actual.' },
]

const encode = (data: Record<string, string>) =>
  Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

export function LeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { business } = useAppStore()
  const [stage, setStage] = useState<Stage>('pitch')
  const [volume, setVolume] = useState<Volume>('mid')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) setStage(storage.get('lead-sent', false) ? 'sent' : 'pitch')
  }, [open])

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data: Record<string, string> = { 'form-name': 'lead', volume }
    form.forEach((v, k) => (data[k] = String(v)))
    setSending(true)
    try {
      // Netlify Forms captura el envío en producción; en local simplemente se ignora.
      await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encode(data) })
    } catch {
      /* sin backend en desarrollo */
    }
    storage.set('lead-sent', true)
    setSending(false)
    setStage('sent')
  }

  return (
    <Modal open={open} onClose={onClose}>
      <AnimatePresence mode="wait" initial={false}>
        {stage === 'pitch' && (
          <motion.div key="pitch" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }} className="p-6 sm:p-8">
            <p className="eyebrow">Hecha a la medida</p>
            <h2 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.02em] text-balance">Entendemos tu operación y construimos la automatización alrededor de ella.</h2>
            <p className="mt-2 text-sm text-zinc-500">No es un chatbot genérico. Cada recepcionista se diseña con los procesos, el tono y las reglas de tu negocio.</p>
            <ol className="mt-6 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-500/10">
                    <s.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      <span className="mr-1.5 font-mono text-xs text-zinc-400">0{i + 1}</span>
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-zinc-500">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button variant="primary" size="lg" className="mt-7 w-full" onClick={() => setStage('form')}>
              Cuéntame cómo trabajas <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        )}

        {stage === 'form' && (
          <motion.form key="form" name="lead" onSubmit={submit} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.22 }} className="space-y-4 p-6 sm:p-8">
            <div>
              <p className="eyebrow">Cuéntame cómo trabajas</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">Quiero una recepcionista para mi negocio</h2>
            </div>
            <input type="hidden" name="bot-field" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">Nombre</span>
                <input required name="name" className="input" autoComplete="name" placeholder="Tu nombre" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">Email o WhatsApp</span>
                <input required name="email" className="input" placeholder="Para contactarte" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">Tipo de negocio</span>
              <input name="business" className="input" defaultValue={business.label} />
            </label>
            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">Mensajes al mes (aprox.)</span>
              <Segmented
                className="w-full"
                value={volume}
                onChange={setVolume}
                options={[
                  { value: 'low', label: 'Menos de 100' },
                  { value: 'mid', label: '100 – 500' },
                  { value: 'high', label: 'Más de 500' },
                ]}
              />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">¿Cómo agendas hoy?</span>
              <textarea
                name="process"
                rows={3}
                className="input resize-none"
                placeholder="Ej. Respondemos WhatsApp a mano y anotamos en Google Calendar; se nos olvida confirmar…"
              />
            </label>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setStage('pitch')}>
                Atrás
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar'}
              </Button>
            </div>
          </motion.form>
        )}

        {stage === 'sent' && (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="p-8 text-center">
            <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.05 }} className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CircleCheck className="size-6" />
            </motion.span>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em]">¡Gracias! Te escribo pronto.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">Revisaré cómo trabajas para proponerte una recepcionista diseñada para tu operación, no una plantilla.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="ghost" onClick={() => setStage('form')}>
                Enviar otra respuesta
              </Button>
              <Button variant="primary" onClick={onClose}>
                Seguir explorando
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}

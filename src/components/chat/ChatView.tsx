import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useConversation } from '../../context/ConversationContext'
import { useAppStore } from '../../context/AppStore'
import { useLead } from '../../context/LeadContext'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { ProcessingSteps } from './ProcessingSteps'
import { QuickActions } from './QuickActions'
import { Composer } from './Composer'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { DemoNotice } from '../ui/DemoNotice'
import { HandoffPill } from './HandoffPill'

export function ChatView() {
  const { settings, business } = useAppStore()
  const { messages, steps, busy, typing, state, send, startQuick, autoplay, startAutoplay, stopAutoplay, reset } = useConversation()
  const { openLead } = useLead()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, steps, typing])

  const last = messages[messages.length - 1]
  const chips = !busy && !autoplay && last?.role === 'ai' ? last.chips : undefined
  const customerName = state.slots.name ?? 'Cliente nuevo'
  const showSteps = busy && !typing && steps.some((s) => s.status !== 'pending')
  const fresh = !messages.some((m) => m.role === 'customer')

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
      {/* Encabezado de la conversación */}
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-950/[0.06] bg-white/60 px-4 py-2.5 md:px-6">
        <Avatar name={customerName} className="size-9" />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-semibold">{customerName}</p>
          <p className="truncate text-[12px] text-zinc-400">
            WhatsApp · {state.slots.phone ?? 'número oculto'} · {business.name}
          </p>
        </div>
        <HandoffPill stage={state.handoff} busy={busy} steps={steps} className="hidden sm:inline-flex" />
        <Button
          size="sm"
          variant={autoplay ? 'secondary' : 'brand'}
          onClick={autoplay ? stopAutoplay : startAutoplay}
          aria-label={autoplay ? 'Detener demo automática' : 'Reproducir demo automática'}
        >
          {autoplay ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          <span className="hidden lg:inline">{autoplay ? 'Detener' : 'Demo automática'}</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} aria-label="Nueva conversación" title="Nueva conversación">
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      {/* Hilo */}
      <div ref={scrollRef} className="chat-backdrop scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6 md:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full bg-white/80 px-3 py-1 text-[11.5px] text-zinc-400 ring-1 ring-zinc-950/5">Hoy · Conversación simulada</span>
          </div>

          {messages.map((m, i) => (
            <MessageBubble key={m.id} message={m} first={i === 0 || messages[i - 1].role !== m.role} aiName={settings.name} />
          ))}

          <AnimatePresence mode="popLayout">
            {showSteps && <ProcessingSteps key="steps" steps={steps} />}
            {typing && <TypingIndicator key="typing" />}
          </AnimatePresence>

          <AnimatePresence>
            {chips && chips.length > 0 && (
              <motion.div
                key={last.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
                className="mt-2.5 ml-[38px] flex flex-wrap gap-1.5"
              >
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-[13px] font-medium text-brand-700 ring-1 ring-inset ring-brand-500/20 transition hover:bg-brand-100 active:scale-[0.97]"
                  >
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {fresh && !busy && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ delay: 0.3 }} className="mt-8 ml-[38px] max-w-md">
                <p className="mb-2 text-[12.5px] text-zinc-500">
                  Escribe como si fueras un cliente, elige una acción rápida o pulsa <span className="font-medium text-zinc-700">Demo automática</span>.
                </p>
                <DemoNotice compact />
                <button onClick={openLead} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 underline-offset-4 hover:underline">
                  Quiero una recepcionista para mi negocio <ArrowUpRight className="size-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Acciones y compositor */}
      <div className="shrink-0 border-t border-zinc-950/[0.06] bg-white/70 px-4 pt-3 pb-3 backdrop-blur-xl md:px-6 md:pb-4">
        <div className="mx-auto max-w-2xl space-y-2.5">
          <QuickActions onPick={startQuick} disabled={autoplay} />
          <Composer />
        </div>
      </div>
    </section>
  )
}

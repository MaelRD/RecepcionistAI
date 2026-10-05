import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { ChatMessage, ConversationState, ProcessingStepId, QuickActionId } from '../types'
import { INITIAL_STATE, openingMessage, runEngine, type EngineEffect, type EngineReply } from '../lib/engine'
import { uid } from '../lib/id'
import { useAppStore } from './AppStore'

export interface LiveStep {
  id: ProcessingStepId
  status: 'pending' | 'active' | 'done'
}

interface ConversationApi {
  messages: ChatMessage[]
  state: ConversationState
  steps: LiveStep[]
  busy: boolean
  typing: boolean
  draft: string
  setDraft: (s: string) => void
  autoplay: boolean
  send: (text: string) => void
  startQuick: (id: QuickActionId) => void
  startAutoplay: () => void
  stopAutoplay: () => void
  reset: () => void
  returnToAI: () => void
}

const Ctx = createContext<ConversationApi | null>(null)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = (base: number) => base + Math.round(Math.random() * base * 0.4)

const toMessage = (r: EngineReply): ChatMessage => ({ ...r, id: uid('msg'), at: Date.now() })

export function ConversationProvider({ children }: { children: ReactNode }) {
  const store = useAppStore()
  const storeRef = useRef(store)
  storeRef.current = store

  const [messages, setMessages] = useState<ChatMessage[]>(() => [toMessage(openingMessage(store.business, store.settings))])
  const [state, setState] = useState<ConversationState>(INITIAL_STATE)
  const [steps, setSteps] = useState<LiveStep[]>([])
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [autoplay, setAutoplay] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state
  const runRef = useRef(0)
  const countedRef = useRef(false)

  const reset = useCallback(() => {
    runRef.current++
    const { business, settings } = storeRef.current
    setMessages([toMessage(openingMessage(business, settings))])
    setState(INITIAL_STATE)
    setSteps([])
    setBusy(false)
    setTyping(false)
    setDraft('')
    countedRef.current = false
  }, [])

  // Al cambiar de negocio la conversación empieza de cero con su propio saludo.
  const businessId = store.businessId
  useEffect(() => {
    setAutoplay(false)
    reset()
  }, [businessId, reset])

  const applyEffects = (effects: EngineEffect[]) => {
    const s = storeRef.current
    for (const effect of effects) {
      if (effect.type === 'create_appointment') {
        s.addAppointment(effect.appointment)
        s.bumpStat('appointments')
        s.recordAutomationRun('booking')
      } else if (effect.type === 'cancel_appointment') {
        s.setAppointmentStatus(effect.id, 'cancelled')
      } else if (effect.type === 'register_customer') {
        if (s.registerCustomer(effect.name, effect.phone)) s.bumpStat('newCustomers')
      } else if (effect.type === 'escalate') {
        s.bumpStat('escalations')
        s.recordAutomationRun('handoff')
      }
    }
  }

  const send = useCallback(async (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const run = ++runRef.current
    const alive = () => run === runRef.current
    const s = storeRef.current

    setDraft('')
    setMessages((m) => [...m, { id: uid('msg'), role: 'customer', text, at: Date.now() }])
    if (!countedRef.current) {
      countedRef.current = true
      s.bumpStat('conversations')
    }

    // Conversación en manos del equipo: la IA ya no contesta.
    if (stateRef.current.handoff === 'transferred') {
      await wait(1400)
      if (!alive()) return
      setMessages((m) => [
        ...m,
        { id: uid('msg'), role: 'human', author: 'Carla · Recepción', text: 'Recibido, en un momento le confirmo.', at: Date.now() },
      ])
      return
    }

    const result = runEngine({
      text,
      state: stateRef.current,
      business: s.business,
      knowledge: s.knowledge,
      settings: s.settings,
      appointments: s.appointments,
      automations: { booking: s.isAutomationOn('booking'), handoff: s.isAutomationOn('handoff') },
    })

    setBusy(true)
    setSteps(result.steps.map((id) => ({ id, status: 'pending' })))
    await wait(250)

    let effectsApplied = false
    for (let i = 0; i < result.steps.length; i++) {
      if (!alive()) return
      setSteps((prev) => prev.map((st, idx) => (idx === i ? { ...st, status: 'active' } : st)))
      await wait(jitter(result.steps[i] === 'understanding' ? 450 : result.steps[i] === 'handoff' ? 1200 : 620))
      if (!alive()) return
      if ((result.steps[i] === 'booking' || result.steps[i] === 'cancelling' || result.steps[i] === 'handoff') && !effectsApplied) {
        applyEffects(result.effects)
        effectsApplied = true
      }
      setSteps((prev) => prev.map((st, idx) => (idx === i ? { ...st, status: 'done' } : st)))
    }
    if (!effectsApplied) applyEffects(result.effects)
    setState(result.state)

    for (let i = 0; i < result.replies.length; i++) {
      if (!alive()) return
      const reply = result.replies[i]
      setTyping(true)
      await wait(reply.card ? 350 : jitter(Math.min(450 + reply.text.length * 9, 1300)))
      if (!alive()) return
      setTyping(false)
      setMessages((m) => [...m, toMessage(reply)])
      await wait(120)
    }
    setBusy(false)

    // Simula que una persona del equipo toma la conversación.
    if (result.effects.some((e) => e.type === 'escalate')) {
      await wait(2600)
      if (!alive()) return
      setMessages((m) => [
        ...m,
        { id: uid('msg'), role: 'system', text: 'Carla de Recepción se unió a la conversación', at: Date.now() },
        {
          id: uid('msg'),
          role: 'human',
          author: 'Carla · Recepción',
          text: 'Hola, soy Carla. Ya leí su conversación con la asistente, ¿en qué le puedo ayudar?',
          at: Date.now(),
        },
      ])
    }
  }, [])

  const startQuick = useCallback(
    (id: QuickActionId) => {
      setAutoplay(false)
      reset()
      const prompt = storeRef.current.business.quickPrompts[id]
      setTimeout(() => send(prompt), 350)
    },
    [reset, send],
  )

  const returnToAI = useCallback(() => {
    setState((s) => ({ ...INITIAL_STATE, slots: { name: s.slots.name, phone: s.slots.phone } }))
    setMessages((m) => [
      ...m,
      { id: uid('msg'), role: 'system', text: `La conversación volvió a ${storeRef.current.settings.name}`, at: Date.now() },
    ])
  }, [])

  /* ---------------------------------------------- Demo automática */

  const startAutoplay = useCallback(() => {
    reset()
    setAutoplay(true)
  }, [reset])
  const stopAutoplay = useCallback(() => setAutoplay(false), [])

  useEffect(() => {
    if (!autoplay || busy || typing) return
    const { business } = storeRef.current
    const customerTurns = messages.filter((m) => m.role === 'customer').length
    let next: string | null = null

    if (customerTurns === 0) next = business.quickPrompts.book
    else if (state.flow === 'booking') {
      const lastChips = [...messages].reverse().find((m) => m.chips?.length)?.chips ?? []
      if (state.step === 'time') next = state.slots.offeredTimes?.[1] ?? state.slots.offeredTimes?.[0] ?? null
      else if (state.step === 'service' || state.step === 'day') next = lastChips[0] ?? null
      else if (state.step === 'contact') next = `${business.demoCustomer.name}, ${business.demoCustomer.phone}`
      else if (state.step === 'confirm') next = 'Sí, confirmar'
      else if (state.step === 'done') next = 'Gracias'
    }

    if (!next || customerTurns > 7) {
      setAutoplay(false)
      return
    }

    // Escribe el mensaje letra por letra en el compositor y lo envía.
    const message = next
    let cancelled = false
    const timers: number[] = []
    const startDelay = customerTurns === 0 ? 700 : 1300
    const perChar = Math.max(18, Math.min(45, 1100 / message.length))
    for (let i = 1; i <= message.length; i++) {
      timers.push(window.setTimeout(() => !cancelled && setDraft(message.slice(0, i)), startDelay + i * perChar))
    }
    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        send(message)
        if (message === 'Gracias') setAutoplay(false)
      }, startDelay + message.length * perChar + 380),
    )
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [autoplay, busy, typing, messages, state, send])

  const value: ConversationApi = {
    messages,
    state,
    steps,
    busy,
    typing,
    draft,
    setDraft,
    autoplay,
    send: (t) => {
      setAutoplay(false)
      send(t)
    },
    startQuick,
    startAutoplay,
    stopAutoplay,
    reset: () => {
      setAutoplay(false)
      reset()
    },
    returnToAI,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useConversation() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useConversation debe usarse dentro de ConversationProvider')
  return ctx
}

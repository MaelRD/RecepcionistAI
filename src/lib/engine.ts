import type {
  AISettings,
  Appointment,
  BusinessProfile,
  ChatMessage,
  ConversationState,
  Intent,
  KnowledgeBase,
  ProcessingStepId,
  Service,
} from '../types'
import {
  DAY_NAMES,
  addDays,
  capitalize,
  formatLongDate,
  formatShortDate,
  fromISO,
  fromMinutes,
  nextWeekday,
  toISO,
  toMinutes,
  today,
} from './dates'
import { formatDuration, formatPrice, normalize } from './format'
import { createVoice, hasInstruction, type Voice } from './voice'
import { uid } from './id'

/* ------------------------------------------------------------------ Tipos */

export type EngineReply = Omit<ChatMessage, 'id' | 'at'>

export type EngineEffect =
  | { type: 'create_appointment'; appointment: Appointment }
  | { type: 'cancel_appointment'; id: string }
  | { type: 'register_customer'; name: string; phone: string }
  | { type: 'escalate' }

export interface EngineInput {
  text: string
  state: ConversationState
  business: BusinessProfile
  knowledge: KnowledgeBase
  settings: AISettings
  appointments: Appointment[]
  automations: { booking: boolean; handoff: boolean }
}

export interface EngineResult {
  steps: ProcessingStepId[]
  replies: EngineReply[]
  state: ConversationState
  effects: EngineEffect[]
}

export const INITIAL_STATE: ConversationState = {
  flow: 'idle',
  step: null,
  intent: null,
  slots: {},
  status: 'listening',
  handoff: 'ai',
}

/* ------------------------------------------------------------------ Detección */

const has = (text: string, words: string[]) => words.some((w) => text.includes(w))

const HUMAN = ['persona', 'humano', 'alguien', 'encargado', 'asesor', 'agente', 'operador', 'directamente', 'queja', 'no me entiendes', 'no me estas entendiendo']
const CANCEL = ['cancelar', 'cancela', 'anular', 'ya no podre', 'ya no puedo ir', 'no voy a poder']
const RESCHEDULE = ['reagendar', 'reprogramar', 'cambiar mi cita', 'cambiar la cita', 'mover mi cita', 'mover la cita', 'cambiar mi sesion']
const PRICES = ['cuanto', 'precio', 'costo', 'cuesta', 'tarifa', 'cobran', 'cuanto sale']
const HOURS = ['horario', 'abren', 'cierran', 'abierto', 'donde estan', 'donde se encuentran', 'ubicacion', 'direccion', 'que dias trabajan', 'que dias abren']
const BOOK = ['agendar', 'agenda', 'cita', 'reservar', 'reserva', 'apartar', 'turno', 'disponibilidad', 'quiero un', 'quiero una', 'me gustaria', 'quisiera']
const DIAGNOSIS = ['me duele', 'tengo dolor', 'es normal que', 'que tengo', 'diagnostic', 'sangra', 'inflamad', 'sintoma']
const GREETING = /^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches|hey|que tal)\b[\s!.,]*$/
const THANKS = /\b(gracias|muchas gracias|te agradezco|le agradezco|excelente|genial)\b/
const YES = /\b(si|claro|correcto|confirmo|confirmar|confirmalo|ok|okay|va|dale|perfecto|exacto|de acuerdo|adelante|esta bien)\b/
const NO = /\b(no|nel|mejor no)\b/

export const detectIntent = (raw: string, knowledge: KnowledgeBase): Intent => {
  const text = normalize(raw)
  if (has(text, HUMAN)) return 'human_handoff'
  if (has(text, RESCHEDULE)) return 'reschedule_appointment'
  if (has(text, CANCEL)) return 'cancel_appointment'
  if (has(text, DIAGNOSIS)) return 'faq'
  if (has(text, PRICES)) return 'check_prices'
  if (has(text, HOURS)) return 'check_hours'
  if (findFaq(text, knowledge)) return 'faq'
  if (has(text, BOOK) || findService(text, knowledge.services)) return 'book_appointment'
  if (GREETING.test(text)) return 'greeting'
  return 'unknown'
}

/** Busca el servicio cuya palabra clave coincida de forma más específica. */
export const findService = (text: string, services: Service[]): Service | undefined => {
  const t = normalize(text)
  let best: { service: Service; score: number } | undefined
  for (const service of services) {
    const candidates = [service.name, ...service.keywords].map(normalize)
    for (const kw of candidates) {
      if (kw && t.includes(kw) && (!best || kw.length > best.score)) best = { service, score: kw.length }
    }
  }
  return best?.service
}

const findFaq = (text: string, knowledge: KnowledgeBase) =>
  knowledge.faqs.find((f) => f.keywords.some((k) => k && text.includes(normalize(k))))

const parseDate = (raw: string): string | undefined => {
  const text = normalize(raw)
  if (text.includes('pasado manana')) return toISO(addDays(today(), 2))
  if (/\bhoy\b/.test(text)) return toISO(today())
  if (/\bmanana\b/.test(text) && !/(en|por) la manana/.test(text)) return toISO(addDays(today(), 1))
  // "Mar 6 oct" (formato de los chips) o "6 de octubre"
  const exact = text.match(/\b(\d{1,2})\s+(?:de\s+)?(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\b/)
  if (exact) {
    const month = MONTH_KEYS.indexOf(exact[2])
    const d = new Date(today().getFullYear(), month, Number(exact[1]))
    if (d < today()) d.setFullYear(d.getFullYear() + 1)
    return toISO(d)
  }
  const plain = DAY_NAMES.map(normalize)
  const idx = plain.findIndex((d) => new RegExp(`\\b${d}\\b`).test(text))
  if (idx >= 0) return toISO(nextWeekday(idx))
  const short = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'].findIndex((d) => new RegExp(`^${d}\\b`).test(text))
  if (short >= 0) return toISO(nextWeekday(short))
  return undefined
}

const MONTH_KEYS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const parseTime = (raw: string, strict: boolean): string | undefined => {
  const text = normalize(raw)
  const exact = text.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm|hrs|h)?\b/)
  const loose = text.match(/\ba las (\d{1,2})\s*(am|pm|hrs|h)?\b/) ?? (strict ? text.match(/^\s*(\d{1,2})\s*(am|pm|hrs|h)?\s*$/) : null)
  const m = exact ?? loose
  if (!m) return undefined
  let h = Number(m[1])
  const min = exact ? Number(m[2]) : 0
  const suffix = exact ? m[3] : m[2]
  if (suffix === 'pm' && h < 12) h += 12
  else if (!suffix && h >= 1 && h <= 7) h += 12 // "a las 4" → 16:00
  if (h > 23 || min > 59) return undefined
  return fromMinutes(h * 60 + min)
}

const parsePhone = (raw: string) => {
  const m = raw.match(/\+?\d[\d\s-]{6,}\d/)
  if (!m) return undefined
  const digits = m[0].replace(/\D/g, '')
  return digits.length >= 8 ? m[0].trim() : undefined
}

const NAME_STOPWORDS = new Set(
  'mi me nombre es soy llamo telefono tel cel celular numero y con el la de hola claro si ok bueno pues a mis datos son whatsapp por favor gracias'.split(' '),
)

const parseName = (raw: string) => {
  const phone = parsePhone(raw)
  const cleaned = (phone ? raw.replace(phone, ' ') : raw).replace(/[,.;:!¡?¿()]/g, ' ')
  const words = cleaned
    .split(/\s+/)
    .filter((w) => /^[a-záéíóúñü]+$/i.test(w) && !NAME_STOPWORDS.has(normalize(w)))
    .slice(0, 3)
  if (!words.length) return undefined
  return words.map((w) => capitalize(w.toLowerCase())).join(' ')
}

const digitsTail = (s: string) => s.replace(/\D/g, '').slice(-8)

/* ------------------------------------------------------------------ Disponibilidad */

const isActive = (a: Appointment) => a.status === 'confirmed' || a.status === 'pending'

export const availableTimes = (
  dateISO: string,
  service: Service,
  knowledge: KnowledgeBase,
  appointments: Appointment[],
): string[] => {
  const day = fromISO(dateISO).getDay()
  const hours = knowledge.hours.find((h) => h.day === day)
  if (!hours || hours.closed) return []
  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)
  const isToday = dateISO === toISO(today())
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes() + 60
  const staff = knowledge.staff.filter((s) => s.serviceIds.includes(service.id))
  const slots: string[] = []

  for (let t = open; t + service.duration <= close; t += 30) {
    if (isToday && t < nowMins) continue
    const time = fromMinutes(t)
    const busy = appointments.filter((a) => isActive(a) && a.date === dateISO && a.time === time).map((a) => a.staffName)
    const free = staff.length === 0 ? busy.length === 0 : staff.some((s) => !busy.includes(s.name))
    if (free) slots.push(time)
  }
  return slots
}

/** Elige tres horarios representativos: temprano, media jornada y tarde. */
const pickThree = (slots: string[]) => {
  if (slots.length <= 3) return slots
  const first = toMinutes(slots[0])
  const last = toMinutes(slots[slots.length - 1])
  const target = first + (last - first) * 0.42
  const middle = slots.reduce((acc, s) => (Math.abs(toMinutes(s) - target) < Math.abs(toMinutes(acc) - target) ? s : acc))
  return Array.from(new Set([slots[0], middle, slots[slots.length - 1]]))
}

const openDays = (knowledge: KnowledgeBase, count = 3) => {
  const out: string[] = []
  for (let i = 1; out.length < count && i < 14; i++) {
    const d = addDays(today(), i)
    const h = knowledge.hours.find((x) => x.day === d.getDay())
    if (h && !h.closed) out.push(toISO(d))
  }
  return out
}

const assignStaff = (service: Service, date: string, time: string, knowledge: KnowledgeBase, appointments: Appointment[]) => {
  const busy = appointments.filter((a) => isActive(a) && a.date === date && a.time === time).map((a) => a.staffName)
  const capable = knowledge.staff.filter((s) => s.serviceIds.includes(service.id))
  return (capable.find((s) => !busy.includes(s.name)) ?? capable[0] ?? knowledge.staff[0])?.name ?? 'Equipo'
}

const plural = (day: string) => (day.endsWith('s') ? day : `${day}s`)

const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`

/* ------------------------------------------------------------------ Motor */

export const runEngine = (input: EngineInput): EngineResult => {
  const { text, state, knowledge } = input
  const v = createVoice(input.settings)
  const ntext = normalize(text)
  const intent = detectIntent(text, knowledge)
  const inBooking = state.flow === 'booking' && state.step !== 'done'
  const inCancel = state.flow === 'cancel'

  // Conversación ya transferida: la IA no responde, atiende el equipo.
  if (state.handoff === 'transferred') {
    return { steps: [], replies: [], state, effects: [] }
  }

  if (intent === 'human_handoff' || /no me (estas |esta )?entend/.test(ntext)) return handoff(input, v)

  // Dentro de un flujo, primero intentamos llenar el dato pendiente.
  if (inBooking) {
    if (intent === 'cancel_appointment' && state.step !== 'confirm') return startCancel(input, v)
    if (['check_prices', 'check_hours', 'faq'].includes(intent) && !/cambi/.test(ntext) && !looksLikeSlotAnswer(input)) {
      return withResume(answerInfo(intent, input, v, true), input, v)
    }
    return booking(input, v)
  }
  if (inCancel) {
    if (state.step === 'lookup' && intent === 'book_appointment' && !parsePhone(text)) return booking({ ...input, state: { ...INITIAL_STATE, flow: 'booking' } }, v)
    return cancelFlow(input, v)
  }

  switch (intent) {
    case 'book_appointment':
      return booking({ ...input, state: { ...state, flow: 'booking', step: 'service', slots: keepContact(state) } }, v)
    case 'cancel_appointment':
      return startCancel(input, v)
    case 'reschedule_appointment':
      // Recién cancelada: reagendamos con el mismo servicio y cliente.
      if (state.status === 'cancelled' && state.slots.serviceId) {
        const { serviceId, name, phone } = state.slots
        return booking({ ...input, text: '', state: { ...state, flow: 'booking', step: 'day', slots: { serviceId, name, phone } } }, v)
      }
      return startCancel(input, v, true)
    case 'check_prices':
    case 'check_hours':
    case 'faq':
      return answerInfo(intent, input, v)
    case 'greeting':
      return {
        steps: ['understanding'],
        replies: [greetingReply(input, v)],
        state: { ...state, intent: 'greeting', status: 'listening' },
        effects: [],
      }
    default:
      if (THANKS.test(ntext)) {
        return { steps: [], replies: [{ role: 'ai', text: v.thanks() + v.e('😊', 2) }], state: { ...state, status: state.status }, effects: [] }
      }
      return {
        steps: ['understanding'],
        replies: [
          {
            role: 'ai',
            text: `Puedo ${v.t('ayudarle', 'ayudarte')} a agendar, consultar precios y horarios, o cancelar una cita. ¿Qué ${v.t('necesita', 'necesitas')}?`,
            chips: ['Agendar cita', 'Ver precios', 'Horarios', 'Hablar con una persona'],
          },
        ],
        state: { ...state, intent: 'unknown', status: 'listening' },
        effects: [],
      }
  }
}

const keepContact = (s: ConversationState) => ({ name: s.slots.name, phone: s.slots.phone })

const greetingReply = (input: EngineInput, v: Voice): EngineReply => ({
  role: 'ai',
  text: `Hola, soy ${input.settings.name}, la recepcionista virtual de ${input.business.name}.${v.e('👋')} ¿En qué ${v.t('le', 'te')} puedo ayudar?`,
  chips: ['Agendar cita', 'Ver precios', 'Horarios'],
})

/** ¿El texto responde al paso pendiente (horario, día, datos)? */
const looksLikeSlotAnswer = ({ text, state, knowledge }: EngineInput) => {
  if (state.step === 'time') return !!parseTime(text, true)
  if (state.step === 'day') return !!parseDate(text)
  if (state.step === 'service') return !!findService(text, knowledge.services)
  if (state.step === 'contact') return !!parsePhone(text)
  return false
}

/** Responde una pregunta en medio de una reserva y retoma donde se quedó. */
const withResume = (answer: EngineResult, input: EngineInput, v: Voice): EngineResult => ({
  ...answer,
  replies: [
    ...answer.replies,
    { role: 'ai', text: `¿Seguimos con ${v.t('su', 'tu')} reserva?`, chips: ['Sí, continuar'] },
  ],
  state: { ...input.state, status: 'collecting' },
})

/* ------------------------------------------------------------------ Información */

const answerInfo = (intent: Intent, input: EngineInput, v: Voice, inFlow = false): EngineResult => {
  const { text, knowledge, business, state } = input
  const ntext = normalize(text)
  const base = { ...state, intent, status: 'answered' as const }

  if (has(ntext, DIAGNOSIS)) {
    const strict = hasInstruction(input.settings, /diagn/i)
    const service =
      knowledge.services.find((s) => /valoraci|primera|cotiza/i.test(s.name)) ?? knowledge.services[0]
    return {
      steps: ['understanding', 'knowledge'],
      replies: [
        {
          role: 'ai',
          text: strict
            ? `Entiendo su preocupación. No puedo dar diagnósticos, pero un especialista puede valorar${v.t('le', 'te')} en persona. ¿${v.t('Le', 'Te')} agendo una ${service.name.toLowerCase()}?`
            : `Lo mejor es que un especialista lo revise. ¿${v.t('Le', 'Te')} agendo una ${service.name.toLowerCase()}?`,
          chips: [`Agendar ${service.name.toLowerCase()}`, 'No, gracias'],
        },
      ],
      state: base,
      effects: [],
    }
  }

  if (intent === 'check_prices') {
    const mentioned = knowledge.services.filter((s) => [s.name, ...s.keywords].some((k) => k && ntext.includes(normalize(k))))
    const current = inFlow && mentioned.length === 0 ? knowledge.services.find((s) => s.id === state.slots.serviceId) : undefined
    const service = mentioned.length === 1 ? mentioned[0] : current
    if (service) {
      return {
        steps: ['understanding', 'services'],
        replies: [
          {
            role: 'ai',
            text: `${service.name}: ${formatPrice(service.price, business.currency)}. Dura aproximadamente ${formatDuration(service.duration)}. ${service.description}${inFlow ? '' : ` ¿${v.t('Le', 'Te')} gustaría agendar?`}`,
            chips: inFlow ? undefined : [`Agendar ${service.name.toLowerCase()}`, 'Ver todos los precios'],
          },
        ],
        state: { ...base, slots: { ...state.slots, serviceId: service.id } },
        effects: [],
      }
    }
    return {
      steps: ['understanding', 'services'],
      replies: [
        { role: 'ai', text: mentioned.length > 1 ? 'Estos son los precios:' : 'Estos son nuestros servicios y precios:' },
        {
          role: 'ai',
          text: '',
          card: {
            kind: 'prices',
            currency: business.currency,
            items: (mentioned.length > 1 ? mentioned : knowledge.services).map((s) => ({ name: s.name, price: s.price, duration: s.duration })),
          },
        },
        ...(inFlow ? [] : [{ role: 'ai' as const, text: `¿${v.t('Le', 'Te')} gustaría agendar alguno?`, chips: ['Agendar cita'] }]),
      ],
      state: base,
      effects: [],
    }
  }

  if (intent === 'check_hours') {
    const rows = summarizeHours(knowledge)
    const asked = DAY_NAMES.findIndex((d) => ntext.includes(normalize(d)))
    const loc = knowledge.locations[0]
    let lead = 'Estos son nuestros horarios:'
    if (asked >= 0) {
      const h = knowledge.hours.find((x) => x.day === asked)
      lead =
        !h || h.closed
          ? `Los ${plural(DAY_NAMES[asked])} no abrimos. Estos son nuestros horarios:`
          : `Sí, los ${plural(DAY_NAMES[asked])} abrimos de ${h.open} a ${h.close}.`
    }
    return {
      steps: ['understanding', 'knowledge'],
      replies: [
        { role: 'ai', text: lead },
        { role: 'ai', text: '', card: { kind: 'hours', rows, address: loc ? `${loc.address} · ${loc.reference}` : '' } },
        ...(inFlow ? [] : [{ role: 'ai' as const, text: `¿${v.t('Desea', 'Quieres')} que ${v.t('le', 'te')} aparte un horario?`, chips: ['Agendar cita'] }]),
      ],
      state: base,
      effects: [],
    }
  }

  const faq = findFaq(ntext, knowledge)
  return {
    steps: ['understanding', 'knowledge'],
    replies: [
      {
        role: 'ai',
        text: faq ? faq.answer : `No tengo esa información, pero puedo ${v.t('comunicarle', 'comunicarte')} con el equipo.`,
        chips: inFlow ? undefined : faq ? ['Agendar cita', 'Otra pregunta'] : ['Hablar con una persona'],
      },
    ],
    state: base,
    effects: [],
  }
}

export const summarizeHours = (knowledge: KnowledgeBase) => {
  const order = [1, 2, 3, 4, 5, 6, 0]
  const groups: { days: number[]; value: string }[] = []
  for (const day of order) {
    const h = knowledge.hours.find((x) => x.day === day)
    const value = !h || h.closed ? 'Cerrado' : `${h.open} – ${h.close}`
    const last = groups[groups.length - 1]
    if (last && last.value === value) last.days.push(day)
    else groups.push({ days: [day], value })
  }
  const short = (d: number) => capitalize(DAY_NAMES[d]).slice(0, 3)
  return groups.map((g) => ({
    label: g.days.length > 1 ? `${short(g.days[0])} – ${short(g.days[g.days.length - 1])}` : capitalize(DAY_NAMES[g.days[0]]),
    value: g.value,
  }))
}

/* ------------------------------------------------------------------ Reserva */

const booking = (input: EngineInput, v: Voice): EngineResult => {
  const { text, knowledge, business, appointments, settings } = input
  const state = input.state
  const ntext = normalize(text)
  const slots = { ...state.slots }
  const steps: ProcessingStepId[] = ['understanding']
  const base = { ...state, flow: 'booking' as const, intent: (slots.rescheduleOf ? 'reschedule_appointment' : 'book_appointment') as Intent }

  // --- Paso de confirmación
  if (state.step === 'confirm') {
    if (/horario|hora/.test(ntext) && /cambi|otro|otra/.test(ntext)) {
      slots.time = undefined
      return booking({ ...input, text: '', state: { ...base, step: 'time', slots } }, v)
    }
    if (/dia|fecha/.test(ntext) && /cambi|otro|otra/.test(ntext)) {
      slots.date = undefined
      slots.time = undefined
      return booking({ ...input, text: '', state: { ...base, step: 'day', slots } }, v)
    }
    if (NO.test(ntext) && !YES.test(ntext.replace(/\bno\b/, ''))) {
      return {
        steps: ['understanding'],
        replies: [{ role: 'ai', text: `Sin problema. ¿Qué ${v.t('desea', 'quieres')} cambiar?`, chips: ['Cambiar horario', 'Cambiar día'] }],
        state: { ...base, step: 'confirm', status: 'awaiting_confirmation' },
        effects: [],
      }
    }
    if (YES.test(ntext)) return createBooking(input, v, slots)
    return {
      steps: [],
      replies: [{ role: 'ai', text: `¿${v.t('Confirmo', 'Confirmo')} la reserva con estos datos?`, chips: ['Sí, confirmar', 'Cambiar horario'] }],
      state: { ...base, status: 'awaiting_confirmation' },
      effects: [],
    }
  }

  // --- Extracción de datos del mensaje
  const service = findService(text, knowledge.services)
  if (service) slots.serviceId = service.id
  const date = parseDate(text)
  if (date && date !== slots.date) {
    slots.date = date
    slots.time = undefined
  }
  const time = parseTime(text, state.step === 'time')
  if (time) slots.time = time
  const phone = parsePhone(text)
  if (phone) slots.phone = phone
  if (state.step === 'contact' || /me llamo|mi nombre es|\bsoy\b/.test(ntext)) {
    const name = parseName(text)
    if (name) slots.name = name
  }

  const currentService = knowledge.services.find((s) => s.id === slots.serviceId)

  // 1. Servicio
  if (!currentService) {
    steps.push('services')
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: `${v.sure()} ¿Qué servicio ${v.t('le', 'te')} gustaría agendar?`,
          chips: knowledge.services.slice(0, 5).map((s) => s.name),
        },
      ],
      state: { ...base, step: 'service', slots, status: 'collecting' },
      effects: [],
    }
  }
  if (service) steps.push('services')

  // 2. Día
  if (!slots.date) {
    const days = openDays(knowledge)
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: `${service ? `${v.sure()} ${currentService.name}, ${formatDuration(currentService.duration)}. ` : ''}¿Qué día ${v.t('le', 'te')} queda mejor?`,
          chips: days.map((d) => capitalize(formatShortDate(d))),
        },
      ],
      state: { ...base, step: 'day', slots, status: 'collecting' },
      effects: [],
    }
  }

  // 3. Horario
  steps.push('availability')
  const free = availableTimes(slots.date, currentService, knowledge, appointments)
  const dayLabel = DAY_NAMES[fromISO(slots.date).getDay()]

  if (free.length === 0) {
    const days = openDays(knowledge).filter((d) => d !== slots.date)
    const closed = knowledge.hours.find((h) => h.day === fromISO(slots.date!).getDay())?.closed
    slots.date = undefined
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: closed
            ? `Los ${plural(dayLabel)} no abrimos. ¿${v.t('Le', 'Te')} funciona alguno de estos días?`
            : `El ${dayLabel} ya no tengo espacios para ${currentService.name.toLowerCase()}. ¿${v.t('Le', 'Te')} funciona otro día?`,
          chips: days.map((d) => capitalize(formatShortDate(d))),
        },
      ],
      state: { ...base, step: 'day', slots, status: 'collecting' },
      effects: [],
    }
  }

  if (!slots.time || !free.includes(slots.time)) {
    const requested = slots.time
    const offered = requested
      ? pickThree(free.filter((t) => Math.abs(toMinutes(t) - toMinutes(requested)) <= 180)).slice(0, 3)
      : pickThree(free)
    const finalOffer = offered.length ? offered : pickThree(free)
    slots.time = undefined
    slots.offeredTimes = finalOffer
    const lead = requested
      ? `A las ${requested} ya no tengo espacio el ${dayLabel}.`
      : `Tengo disponibilidad el ${dayLabel} a las ${listJoin(finalOffer)}.`
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: requested
            ? `${lead} Puedo ofrecer${v.t('le', 'te')} ${listJoin(finalOffer)}. ¿Cuál prefiere?`.replace('prefiere', v.t('prefiere', 'prefieres'))
            : `${v.sure()} ${lead}\n\n¿Qué horario ${v.t('prefiere', 'prefieres')}?`,
          chips: finalOffer,
        },
      ],
      state: { ...base, step: 'time', slots, status: 'checking' },
      effects: [],
    }
  }

  slots.staffName = assignStaff(currentService, slots.date, slots.time, knowledge, appointments)

  // 4. Datos de contacto
  if (!slots.name || !slots.phone) {
    const ask =
      !slots.name && !slots.phone
        ? `¿Me ${v.t('comparte su', 'compartes tu')} nombre y teléfono para registrar la cita?`
        : !slots.name
          ? `¿A nombre de quién registro la cita?`
          : `¿Me ${v.t('comparte un', 'compartes un')} teléfono de contacto?`
    const justPicked = state.step === 'time' || state.step === 'day' || !!time
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: `${justPicked && state.step !== 'contact' ? `${v.ok()} ` : ''}${ask}`,
          chips:
            !slots.name && !slots.phone
              ? [`${business.demoCustomer.name}, ${business.demoCustomer.phone}`]
              : undefined,
        },
      ],
      state: { ...base, step: 'contact', slots, status: 'collecting' },
      effects: [],
    }
  }

  // 5. Confirmación (si la instrucción está activa)
  const mustConfirm = hasInstruction(settings, /confirmar/i)
  if (mustConfirm) {
    steps.push('customer')
    return {
      steps,
      replies: [
        {
          role: 'ai',
          text: `Gracias, ${slots.name.split(' ')[0]}. Confirmo los datos de la cita:\n\n${currentService.name}\n${capitalize(formatLongDate(slots.date))} · ${slots.time}\nCon ${slots.staffName}\n\n¿Es correcto?`,
          chips: ['Sí, confirmar', 'Cambiar horario'],
        },
      ],
      state: { ...base, step: 'confirm', slots, status: 'awaiting_confirmation' },
      effects: [],
    }
  }

  return createBooking(input, v, slots)
}

const createBooking = (input: EngineInput, v: Voice, slots: ConversationState['slots']): EngineResult => {
  const { knowledge, business, automations } = input
  const service = knowledge.services.find((s) => s.id === slots.serviceId)!
  const appointment: Appointment = {
    id: uid('apt'),
    businessId: business.id,
    customerName: slots.name!,
    phone: slots.phone!,
    serviceId: service.id,
    serviceName: service.name,
    staffName: slots.staffName ?? assignStaff(service, slots.date!, slots.time!, knowledge, input.appointments),
    date: slots.date!,
    time: slots.time!,
    status: automations.booking ? 'confirmed' : 'pending',
    source: 'ia',
    createdAt: Date.now(),
  }
  const effects: EngineEffect[] = [
    { type: 'register_customer', name: appointment.customerName, phone: appointment.phone },
    { type: 'create_appointment', appointment },
  ]
  if (slots.rescheduleOf) effects.unshift({ type: 'cancel_appointment', id: slots.rescheduleOf })

  const loc = knowledge.locations[0]
  const replies: EngineReply[] = automations.booking
    ? [
        { role: 'ai', text: `${slots.rescheduleOf ? 'Cita reagendada correctamente.' : 'Reserva creada correctamente.'}${v.e('✅')}` },
        { role: 'ai', text: '', card: { kind: 'appointment', appointment, variant: 'confirmed' } },
        {
          role: 'ai',
          text: `${v.t('Le', 'Te')} envié la confirmación por WhatsApp${loc ? ` con la ubicación (${loc.name})` : ''}. ${v.t('Recibirá', 'Recibirás')} un recordatorio 24 horas antes.`,
          chips: ['Gracias', 'Ver ubicación'],
        },
      ]
    : [
        { role: 'ai', text: `Registré su solicitud. El equipo la revisará y ${v.t('le', 'te')} confirmará en breve.` },
        { role: 'ai', text: '', card: { kind: 'appointment', appointment, variant: 'found' } },
      ]

  return {
    steps: automations.booking ? ['booking', 'customer', 'confirmation'] : ['booking', 'customer'],
    replies,
    state: {
      ...input.state,
      flow: 'booking',
      step: 'done',
      slots: { ...slots, appointmentId: appointment.id },
      status: automations.booking ? 'confirmed' : 'collecting',
    },
    effects,
  }
}

/* ------------------------------------------------------------------ Cancelar / reagendar */

const startCancel = (input: EngineInput, v: Voice, reschedule = false): EngineResult => {
  const { state } = input
  const next: ConversationState = {
    ...state,
    flow: 'cancel',
    step: 'lookup',
    intent: reschedule ? 'reschedule_appointment' : 'cancel_appointment',
    slots: keepContact(state),
    status: 'collecting',
  }
  // Si ya conocemos al cliente en esta conversación, buscamos directo.
  if (state.slots.phone || state.slots.name) {
    return cancelFlow({ ...input, text: state.slots.phone ?? state.slots.name ?? '', state: next }, v)
  }
  return {
    steps: ['understanding'],
    replies: [
      {
        role: 'ai',
        text: `${v.sure()} ¿Me ${v.t('comparte el', 'compartes el')} nombre o teléfono con el que ${v.t('agendó', 'agendaste')}?`,
        chips: [`${input.business.demoCustomer.name}, ${input.business.demoCustomer.phone}`],
      },
    ],
    state: next,
    effects: [],
  }
}

const cancelFlow = (input: EngineInput, v: Voice): EngineResult => {
  const { text, state, appointments, knowledge } = input
  const ntext = normalize(text)

  if (state.step === 'lookup') {
    const phone = parsePhone(text) ?? state.slots.phone
    const name = parseName(text) ?? state.slots.name
    const todayISO = toISO(today())
    const match = appointments
      .filter((a) => isActive(a) && a.date >= todayISO)
      .filter(
        (a) =>
          (phone && digitsTail(a.phone) === digitsTail(phone)) ||
          (name && normalize(a.customerName).split(' ')[0] === normalize(name).split(' ')[0]),
      )
      .sort((a, b) => b.createdAt - a.createdAt)[0]

    if (!match) {
      return {
        steps: ['understanding', 'lookup'],
        replies: [
          {
            role: 'ai',
            text: `No encontré citas activas con esos datos. ¿${v.t('Desea', 'Quieres')} intentar con otro teléfono o agendar una nueva cita?`,
            chips: ['Agendar cita', 'Hablar con una persona'],
          },
        ],
        state: { ...state, slots: { ...state.slots, phone, name }, status: 'collecting' },
        effects: [],
      }
    }

    const reschedule = state.intent === 'reschedule_appointment'
    return {
      steps: ['understanding', 'lookup'],
      replies: [
        { role: 'ai', text: `Encontré ${v.t('su', 'tu')} cita:` },
        { role: 'ai', text: '', card: { kind: 'appointment', appointment: match, variant: 'found' } },
        {
          role: 'ai',
          text: reschedule
            ? `¿Qué día ${v.t('le', 'te')} gustaría moverla?`
            : `¿${v.t('Desea', 'Quieres')} cancelarla o ${v.t('prefiere', 'prefieres')} reagendar?`,
          chips: reschedule ? openDays(knowledge).map((d) => capitalize(formatShortDate(d))) : ['Cancelar cita', 'Reagendar', 'Mantener cita'],
        },
      ],
      state: reschedule
        ? {
            ...state,
            flow: 'booking',
            step: 'day',
            slots: { serviceId: match.serviceId, name: match.customerName, phone: match.phone, rescheduleOf: match.id },
            status: 'collecting',
          }
        : {
            ...state,
            step: 'cancel_confirm',
            slots: { ...state.slots, appointmentId: match.id, name: match.customerName, phone: match.phone, serviceId: match.serviceId, date: match.date, time: match.time, staffName: match.staffName },
            status: 'awaiting_confirmation',
          },
      effects: [],
    }
  }

  // cancel_confirm
  const apt = appointments.find((a) => a.id === state.slots.appointmentId)
  if (!apt) return { steps: [], replies: [], state: { ...INITIAL_STATE }, effects: [] }

  if (/reagend|cambi|mover|otro dia|otra fecha/.test(ntext)) {
    const days = openDays(knowledge)
    return {
      steps: ['understanding'],
      replies: [{ role: 'ai', text: `${v.ok()} ¿Qué día ${v.t('le', 'te')} queda mejor?`, chips: days.map((d) => capitalize(formatShortDate(d))) }],
      state: {
        ...state,
        flow: 'booking',
        step: 'day',
        intent: 'reschedule_appointment',
        slots: { serviceId: apt.serviceId, name: apt.customerName, phone: apt.phone, rescheduleOf: apt.id },
        status: 'collecting',
      },
      effects: [],
    }
  }

  if (/mantener|dejar|conservar/.test(ntext) || (NO.test(ntext) && !/cancel/.test(ntext))) {
    return {
      steps: [],
      replies: [{ role: 'ai', text: `${v.ok()} ${v.t('Su', 'Tu')} cita se mantiene sin cambios. ¡${v.t('Le', 'Te')} esperamos!` }],
      state: { ...state, flow: 'idle', step: null, status: 'answered' },
      effects: [],
    }
  }

  if (/cancel/.test(ntext) || YES.test(ntext)) {
    const policy = knowledge.policies.find((p) => /cancel/i.test(p.title))
    return {
      steps: ['understanding', 'cancelling', 'confirmation'],
      replies: [
        { role: 'ai', text: `Listo, ${v.t('su', 'tu')} cita fue cancelada.` },
        { role: 'ai', text: '', card: { kind: 'appointment', appointment: { ...apt, status: 'cancelled' }, variant: 'cancelled' } },
        {
          role: 'ai',
          text: `${policy ? `${policy.body} ` : ''}¿${v.t('Le', 'Te')} gustaría agendar en otra fecha?`,
          chips: ['Reagendar', 'No, gracias'],
        },
      ],
      state: { ...state, flow: 'idle', step: null, status: 'cancelled', slots: { ...state.slots } },
      effects: [{ type: 'cancel_appointment', id: apt.id }],
    }
  }

  return {
    steps: [],
    replies: [{ role: 'ai', text: `¿${v.t('Desea', 'Quieres')} cancelar la cita o reagendarla?`, chips: ['Cancelar cita', 'Reagendar', 'Mantener cita'] }],
    state,
    effects: [],
  }
}

/* ------------------------------------------------------------------ Escalamiento */

const handoff = (input: EngineInput, v: Voice): EngineResult => {
  const { state, automations, knowledge } = input
  if (!automations.handoff) {
    const loc = knowledge.locations[0]
    return {
      steps: ['understanding'],
      replies: [
        {
          role: 'ai',
          text: `En este momento el equipo no está disponible por chat. Puedo ${v.t('ayudarle', 'ayudarte')} con citas, precios u horarios${loc ? `, o puede visitarnos en ${loc.name}` : ''}.`,
          chips: ['Agendar cita', 'Ver precios'],
        },
      ],
      state: { ...state, intent: 'human_handoff', status: 'answered' },
      effects: [],
    }
  }
  return {
    steps: ['understanding', 'handoff'],
    replies: [
      { role: 'ai', text: `Claro. Voy a transferir ${v.t('su', 'tu')} conversación con una persona del equipo.` },
      { role: 'ai', text: '', card: { kind: 'handoff', team: 'Recepción' } },
    ],
    state: { ...state, flow: 'handoff', step: null, intent: 'human_handoff', status: 'escalated', handoff: 'transferred' },
    effects: [{ type: 'escalate' }],
  }
}

/** Saludo inicial que abre cada conversación. */
export const openingMessage = (business: BusinessProfile, settings: AISettings): EngineReply => {
  const v = createVoice(settings)
  return {
    role: 'ai',
    text: `${business.greeting} Soy ${settings.name}, ${v.t('su', 'tu')} recepcionista virtual.${v.e('👋')} ¿En qué ${v.t('le', 'te')} puedo ayudar?`,
  }
}

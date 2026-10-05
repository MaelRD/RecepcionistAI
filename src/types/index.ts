export type BusinessId = 'dental' | 'nails' | 'barber' | 'psychology' | 'tattoo'

export type ViewId =
  | 'overview'
  | 'conversations'
  | 'agenda'
  | 'customers'
  | 'knowledge'
  | 'automations'
  | 'settings'

/* ---------------------------------------------------------------- Knowledge */

export interface Service {
  id: string
  name: string
  duration: number // minutos
  price: number
  description: string
  keywords: string[]
}

export interface DayHours {
  day: number // 0 = domingo … 6 = sábado
  open: string // "09:00"
  close: string // "19:00"
  closed: boolean
}

export interface Faq {
  id: string
  question: string
  answer: string
  keywords: string[]
}

export interface Policy {
  id: string
  title: string
  body: string
}

export interface Location {
  id: string
  name: string
  address: string
  reference: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  serviceIds: string[]
}

export interface KnowledgeBase {
  services: Service[]
  hours: DayHours[]
  faqs: Faq[]
  policies: Policy[]
  locations: Location[]
  staff: StaffMember[]
}

export interface BusinessProfile {
  id: BusinessId
  label: string // "Clínica dental"
  name: string // "Clínica Dental Sonrisa"
  icon: 'tooth' | 'nails' | 'barber' | 'psychology' | 'tattoo'
  accent: { 50: string; 100: string; 500: string; 600: string; 700: string }
  currency: string
  greeting: string
  slotStep: number // minutos entre horarios
  quickPrompts: Record<QuickActionId, string>
  demoCustomer: { name: string; phone: string }
  knowledge: KnowledgeBase
}

/* ---------------------------------------------------------------- AI settings */

export type Tone = 'profesional' | 'cercano' | 'casual'
export type EmojiLevel = 'ninguno' | 'bajo' | 'normal'
export type Language = 'es' | 'en'

export interface Instruction {
  id: string
  text: string
  enabled: boolean
}

export interface AISettings {
  name: string
  tone: Tone
  language: Language
  emojis: EmojiLevel
  instructions: Instruction[]
}

/* ---------------------------------------------------------------- Operación */

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

export interface Appointment {
  id: string
  businessId: BusinessId
  customerName: string
  phone: string
  serviceId: string
  serviceName: string
  staffName: string
  date: string // ISO yyyy-mm-dd
  time: string // "12:30"
  status: AppointmentStatus
  source: 'ia' | 'manual'
  createdAt: number
}

export interface Customer {
  id: string
  businessId: BusinessId
  name: string
  phone: string
  visits: number
  lastVisit: string | null
  tags: string[]
  source: 'ia' | 'manual'
  createdAt: number
}

export interface Automation {
  id: string
  name: string
  description: string
  trigger: string
  steps: { label: string; detail: string; icon: string }[]
  enabled: boolean
  runs: number
}

/* ---------------------------------------------------------------- Chat */

export type QuickActionId = 'book' | 'prices' | 'hours' | 'cancel' | 'human'

export type Intent =
  | 'book_appointment'
  | 'check_prices'
  | 'check_hours'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'faq'
  | 'human_handoff'
  | 'greeting'
  | 'unknown'

export type ProcessingStepId =
  | 'understanding'
  | 'services'
  | 'availability'
  | 'customer'
  | 'booking'
  | 'confirmation'
  | 'knowledge'
  | 'handoff'
  | 'cancelling'
  | 'lookup'

export type HandoffStage = 'ai' | 'required' | 'transferred'

export interface ChatMessage {
  id: string
  role: 'customer' | 'ai' | 'human' | 'system'
  author?: string
  text: string
  at: number
  chips?: string[]
  card?: MessageCard
}

export type MessageCard =
  | { kind: 'appointment'; appointment: Appointment; variant: 'confirmed' | 'cancelled' | 'found' }
  | { kind: 'prices'; items: { name: string; price: number; duration: number }[]; currency: string }
  | { kind: 'hours'; rows: { label: string; value: string }[]; address: string }
  | { kind: 'handoff'; team: string }

export type Flow = 'idle' | 'booking' | 'cancel' | 'handoff'

export type BookingStep =
  | 'service'
  | 'day'
  | 'time'
  | 'contact'
  | 'confirm'
  | 'done'

export interface ConversationSlots {
  serviceId?: string
  date?: string
  time?: string
  offeredTimes?: string[]
  name?: string
  phone?: string
  staffName?: string
  appointmentId?: string
  rescheduleOf?: string
}

export type ContextStatus =
  | 'listening'
  | 'collecting'
  | 'checking'
  | 'awaiting_confirmation'
  | 'creating'
  | 'confirmed'
  | 'cancelled'
  | 'answered'
  | 'escalated'

export interface ConversationState {
  flow: Flow
  step: BookingStep | 'lookup' | 'cancel_confirm' | null
  intent: Intent | null
  slots: ConversationSlots
  status: ContextStatus
  handoff: HandoffStage
}

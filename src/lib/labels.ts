import type { ContextStatus, Intent, ProcessingStepId } from '../types'

/** Estados visibles para el cliente en el chat (nunca razonamiento interno). */
export const STEP_LABEL: Record<ProcessingStepId, string> = {
  understanding: 'Entendiendo solicitud',
  services: 'Consultando servicios',
  availability: 'Revisando disponibilidad',
  customer: 'Registrando cliente',
  booking: 'Creando reserva',
  confirmation: 'Enviando confirmación',
  knowledge: 'Consultando información',
  handoff: 'Transfiriendo a una persona',
  cancelling: 'Cancelando cita',
  lookup: 'Buscando cita',
}

/** Etiquetas del panel de operaciones. */
export const STEP_STATUS: Record<ProcessingStepId, string> = {
  understanding: 'Understanding request',
  services: 'Checking services',
  availability: 'Checking availability',
  customer: 'Registering customer',
  booking: 'Creating appointment',
  confirmation: 'Sending confirmation',
  knowledge: 'Searching knowledge base',
  handoff: 'Human required',
  cancelling: 'Cancelling appointment',
  lookup: 'Looking up appointment',
}

export const INTENT_LABEL: Record<Intent, string> = {
  book_appointment: 'Book appointment',
  check_prices: 'Check prices',
  check_hours: 'Hours & location',
  cancel_appointment: 'Cancel appointment',
  reschedule_appointment: 'Reschedule appointment',
  faq: 'FAQ',
  human_handoff: 'Human handoff',
  greeting: 'Greeting',
  unknown: 'Unclear',
}

export const STATUS_LABEL: Record<ContextStatus, string> = {
  listening: 'Listening',
  collecting: 'Collecting details',
  checking: 'Awaiting time selection',
  awaiting_confirmation: 'Awaiting confirmation',
  creating: 'Creating appointment',
  confirmed: 'Appointment confirmed',
  cancelled: 'Appointment cancelled',
  answered: 'Answered',
  escalated: 'Transferred to human',
}

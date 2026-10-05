export const OVERVIEW_METRICS = {
  conversations: 148,
  appointments: 32,
  newCustomers: 18,
  resolvedByAI: 87,
  escalated: 13,
  avgResponse: 1.2,
  conversion: 21.6,
}

/** Conversaciones por día (últimos 14 días). */
export const CONVERSATIONS_SERIES = [6, 8, 7, 11, 9, 13, 10, 12, 9, 14, 11, 15, 10, 13]
export const APPOINTMENTS_SERIES = [1, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 2]

export const INTENT_BREAKDOWN = [
  { label: 'Agendar cita', value: 46 },
  { label: 'Precios', value: 22 },
  { label: 'Horarios y ubicación', value: 15 },
  { label: 'Cancelar / reagendar', value: 10 },
  { label: 'Otros', value: 7 },
]

export const HOURLY_LOAD = [2, 1, 0, 0, 0, 1, 3, 6, 9, 12, 11, 10, 8, 9, 11, 12, 10, 9, 8, 7, 6, 5, 4, 3]

export const CHANNELS = [
  { label: 'WhatsApp', value: 68 },
  { label: 'Web chat', value: 21 },
  { label: 'Instagram', value: 11 },
]

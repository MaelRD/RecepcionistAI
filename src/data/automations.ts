import type { Automation } from '../types'

export const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: 'booking',
    name: 'Reserva automática',
    description: 'Atiende la solicitud, agenda la cita y registra al cliente sin intervención humana.',
    trigger: 'Cliente solicita cita',
    enabled: true,
    runs: 32,
    steps: [
      { label: 'Cliente solicita cita', detail: 'WhatsApp, web o Instagram', icon: 'message' },
      { label: 'IA identifica servicio', detail: 'Con base en la Knowledge base', icon: 'sparkles' },
      { label: 'Consulta disponibilidad', detail: 'Agenda y horarios del personal', icon: 'calendar' },
      { label: 'Crea reserva', detail: 'Bloquea el horario en la agenda', icon: 'check' },
      { label: 'Registra cliente', detail: 'Alta o actualización en CRM', icon: 'user' },
      { label: 'Envía confirmación', detail: 'Mensaje con fecha, hora y ubicación', icon: 'send' },
    ],
  },
  {
    id: 'reminder',
    name: 'Recordatorio 24 h',
    description: 'Reduce inasistencias confirmando la cita un día antes.',
    trigger: '24 horas antes de la cita',
    enabled: true,
    runs: 57,
    steps: [
      { label: '24 horas antes', detail: 'Disparador programado', icon: 'clock' },
      { label: 'Enviar recordatorio', detail: 'Mensaje con botón de respuesta', icon: 'bell' },
      { label: 'Esperar respuesta', detail: 'Hasta 6 horas', icon: 'hourglass' },
      { label: 'Confirmar / Reagendar', detail: 'La IA actualiza la agenda', icon: 'split' },
    ],
  },
  {
    id: 'handoff',
    name: 'Escalamiento a humano',
    description: 'Transfiere la conversación cuando el cliente lo pide o la IA detecta un caso sensible.',
    trigger: 'Cliente pide una persona',
    enabled: true,
    runs: 19,
    steps: [
      { label: 'Detecta solicitud', detail: 'Palabras clave y sentimiento', icon: 'alert' },
      { label: 'Resume conversación', detail: 'Contexto listo para el equipo', icon: 'file' },
      { label: 'Asigna a Recepción', detail: 'Notificación al equipo', icon: 'user' },
    ],
  },
  {
    id: 'reactivation',
    name: 'Reactivación de clientes',
    description: 'Invita a volver a clientes sin visita en los últimos 90 días.',
    trigger: '90 días sin visita',
    enabled: false,
    runs: 0,
    steps: [
      { label: '90 días sin visita', detail: 'Revisión diaria del CRM', icon: 'clock' },
      { label: 'Mensaje personalizado', detail: 'Según su último servicio', icon: 'send' },
      { label: 'Ofrece horarios', detail: 'Reserva directa desde el chat', icon: 'calendar' },
    ],
  },
]

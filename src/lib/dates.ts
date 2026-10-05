export const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const toISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fromISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const addDays = (d: Date, n: number) => {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

/** Próxima fecha (a partir de mañana) que cae en el día de la semana indicado. */
export const nextWeekday = (weekday: number, from = today()) => {
  for (let i = 1; i <= 7; i++) {
    const d = addDays(from, i)
    if (d.getDay() === weekday) return d
  }
  return addDays(from, 7)
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const weekdayName = (iso: string) => DAY_NAMES[fromISO(iso).getDay()]

/** "sábado 10 de oct" */
export const formatLongDate = (iso: string) => {
  const d = fromISO(iso)
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export const formatShortDate = (iso: string) => {
  const d = fromISO(iso)
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export const fromMinutes = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

export const formatTime = (date: number) =>
  new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

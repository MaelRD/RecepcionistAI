export const formatPrice = (amount: number, currency = 'MXN') =>
  amount === 0
    ? 'Sin costo'
    : new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export const initials = (name: string) =>
  name
    .replace(/^(Dra?\.|Psic\.)\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

/** Quita acentos y pasa a minúsculas para comparar texto libre. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

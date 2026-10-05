import type { Appointment, BusinessId, Customer } from '../types'
import { BUSINESSES } from './businesses'
import { addDays, nextWeekday, toISO, today } from '../lib/dates'

const SEED_NAMES = ['Carmen Ruiz', 'Jorge Salinas', 'Daniela Ortiz', 'Ricardo Peña', 'Fernanda Gil', 'Emilio Castro']
const SEED_PHONES = ['55 8812 3344', '55 1029 3847', '55 6677 1122', '55 4433 9900', '55 7788 2211', '55 3322 5566']

/** Citas iniciales relativas a hoy para que la agenda nunca se vea vacía. */
export const seedAppointments = (businessId: BusinessId): Appointment[] => {
  const biz = BUSINESSES[businessId]
  const { services, staff, hours } = biz.knowledge
  const base = today()
  const list: Appointment[] = []
  let n = 0

  for (let offset = 0; offset < 7; offset++) {
    const d = addDays(base, offset)
    const h = hours.find((x) => x.day === d.getDay())
    if (!h || h.closed) continue
    const perDay = offset % 2 === 0 ? 2 : 1
    for (let k = 0; k < perDay; k++) {
      const service = services[(n + k) % services.length]
      const member = staff.find((s) => s.serviceIds.includes(service.id)) ?? staff[0]
      const [oh] = h.open.split(':').map(Number)
      const time = `${String(oh + 1 + k * 3).padStart(2, '0')}:00`
      list.push({
        id: `seed_${businessId}_${n}`,
        businessId,
        customerName: SEED_NAMES[n % SEED_NAMES.length],
        phone: SEED_PHONES[n % SEED_PHONES.length],
        serviceId: service.id,
        serviceName: service.name,
        staffName: member.name,
        date: toISO(d),
        time,
        status: offset === 0 && k === 0 ? 'completed' : 'confirmed',
        source: n % 3 === 0 ? 'manual' : 'ia',
        createdAt: Date.now() - (7 - offset) * 86_400_000,
      })
      n++
    }
  }

  // Cita existente del cliente demo, para poder probar "Cancelar cita".
  const demoService = services[0]
  const demoDay = nextWeekday(4)
  list.push({
    id: `seed_${businessId}_demo`,
    businessId,
    customerName: biz.demoCustomer.name,
    phone: biz.demoCustomer.phone,
    serviceId: demoService.id,
    serviceName: demoService.name,
    staffName: staff.find((s) => s.serviceIds.includes(demoService.id))?.name ?? staff[0].name,
    date: toISO(demoDay),
    time: hours.find((x) => x.day === 4)?.open ?? '10:00',
    status: 'confirmed',
    source: 'ia',
    createdAt: Date.now() - 3 * 86_400_000,
  })

  return list
}

export const seedCustomers = (businessId: BusinessId): Customer[] => {
  const biz = BUSINESSES[businessId]
  const tags = [['Frecuente'], ['Nuevo'], [], ['VIP'], ['Frecuente'], []]
  const customers: Customer[] = SEED_NAMES.map((name, i) => ({
    id: `cus_${businessId}_${i}`,
    businessId,
    name,
    phone: SEED_PHONES[i],
    visits: [7, 1, 3, 12, 5, 2][i],
    lastVisit: toISO(addDays(today(), -[12, 3, 40, 8, 21, 95][i])),
    tags: tags[i],
    source: i % 3 === 0 ? 'manual' : 'ia',
    createdAt: Date.now() - (i + 2) * 7 * 86_400_000,
  }))
  customers.unshift({
    id: `cus_${businessId}_demo`,
    businessId,
    name: biz.demoCustomer.name,
    phone: biz.demoCustomer.phone,
    visits: 2,
    lastVisit: toISO(addDays(today(), -60)),
    tags: ['Cita próxima'],
    source: 'ia',
    createdAt: Date.now() - 70 * 86_400_000,
  })
  return customers
}

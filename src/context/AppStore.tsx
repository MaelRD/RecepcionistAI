import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import type {
  AISettings,
  Appointment,
  Automation,
  BusinessId,
  BusinessProfile,
  Customer,
  KnowledgeBase,
  ViewId,
} from '../types'
import { BUSINESSES } from '../data/businesses'
import { DEFAULT_AI_SETTINGS } from '../data/aiSettings'
import { DEFAULT_AUTOMATIONS } from '../data/automations'
import { seedAppointments, seedCustomers } from '../data/seed'
import { usePersistentState } from '../hooks/usePersistentState'
import { useHashView } from '../hooks/useHashView'
import { storage } from '../lib/storage'
import { uid } from '../lib/id'
import { toISO, today } from '../lib/dates'

export interface SessionStats {
  conversations: number
  appointments: number
  escalations: number
  newCustomers: number
}

type PerBusiness<T> = Partial<Record<BusinessId, T>>

interface AppStore {
  view: ViewId
  navigate: (v: ViewId) => void

  businessId: BusinessId
  business: BusinessProfile
  setBusinessId: (id: BusinessId) => void

  knowledge: KnowledgeBase
  knowledgeEdited: boolean
  updateKnowledge: (kb: KnowledgeBase) => void
  resetKnowledge: () => void

  settings: AISettings
  updateSettings: (patch: Partial<AISettings>) => void
  resetSettings: () => void

  appointments: Appointment[]
  addAppointment: (a: Appointment) => void
  setAppointmentStatus: (id: string, status: Appointment['status']) => void

  customers: Customer[]
  registerCustomer: (name: string, phone: string) => boolean

  automations: Automation[]
  toggleAutomation: (id: string) => void
  recordAutomationRun: (id: string) => void
  isAutomationOn: (id: string) => boolean

  stats: SessionStats
  bumpStat: (key: keyof SessionStats) => void

  resetDemo: () => void
}

const Ctx = createContext<AppStore | null>(null)

const EMPTY_STATS: SessionStats = { conversations: 0, appointments: 0, escalations: 0, newCustomers: 0 }

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [view, navigate] = useHashView()
  const [businessId, setBusinessId] = usePersistentState<BusinessId>('business', 'dental')
  const [knowledgeOverrides, setKnowledgeOverrides] = usePersistentState<PerBusiness<KnowledgeBase>>('knowledge', {})
  const [settings, setSettings] = usePersistentState<AISettings>('settings', DEFAULT_AI_SETTINGS)
  const [allAppointments, setAllAppointments] = usePersistentState<PerBusiness<Appointment[]>>('appointments', {})
  const [allCustomers, setAllCustomers] = usePersistentState<PerBusiness<Customer[]>>('customers', {})
  const [automations, setAutomations] = usePersistentState<Automation[]>('automations', DEFAULT_AUTOMATIONS)
  const [stats, setStats] = usePersistentState<SessionStats>('stats', EMPTY_STATS)

  const business = BUSINESSES[businessId]
  const knowledge = knowledgeOverrides[businessId] ?? business.knowledge
  const appointments = useMemo(() => allAppointments[businessId] ?? seedAppointments(businessId), [allAppointments, businessId])
  const customers = useMemo(() => allCustomers[businessId] ?? seedCustomers(businessId), [allCustomers, businessId])

  const updateAppointments = useCallback(
    (fn: (list: Appointment[]) => Appointment[]) =>
      setAllAppointments((prev) => ({ ...prev, [businessId]: fn(prev[businessId] ?? seedAppointments(businessId)) })),
    [businessId, setAllAppointments],
  )

  const registerCustomer = useCallback(
    (name: string, phone: string) => {
      const tail = phone.replace(/\D/g, '').slice(-8)
      const isNew = !customers.some((c) => c.phone.replace(/\D/g, '').slice(-8) === tail)
      setAllCustomers((prev) => {
        const list = prev[businessId] ?? seedCustomers(businessId)
        const existing = list.find((c) => c.phone.replace(/\D/g, '').slice(-8) === tail)
        if (existing) {
          return {
            ...prev,
            [businessId]: list.map((c) =>
              c.id === existing.id ? { ...c, tags: Array.from(new Set([...c.tags.filter((t) => t !== 'Nuevo'), 'Cita próxima'])) } : c,
            ),
          }
        }
        const customer: Customer = {
          id: uid('cus'),
          businessId,
          name,
          phone,
          visits: 0,
          lastVisit: null,
          tags: ['Nuevo', 'Registrado por IA'],
          source: 'ia',
          createdAt: Date.now(),
        }
        return { ...prev, [businessId]: [customer, ...list] }
      })
      return isNew
    },
    [businessId, customers, setAllCustomers],
  )

  const value: AppStore = {
    view,
    navigate,
    businessId,
    business,
    setBusinessId,
    knowledge,
    knowledgeEdited: !!knowledgeOverrides[businessId],
    updateKnowledge: (kb) => setKnowledgeOverrides((prev) => ({ ...prev, [businessId]: kb })),
    resetKnowledge: () =>
      setKnowledgeOverrides((prev) => {
        const next = { ...prev }
        delete next[businessId]
        return next
      }),
    settings,
    updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),
    resetSettings: () => setSettings(DEFAULT_AI_SETTINGS),
    appointments,
    addAppointment: (a) => updateAppointments((list) => [...list, a]),
    setAppointmentStatus: (id, status) => updateAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a))),
    customers,
    registerCustomer,
    automations,
    toggleAutomation: (id) => setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))),
    recordAutomationRun: (id) => setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, runs: a.runs + 1 } : a))),
    isAutomationOn: (id) => automations.find((a) => a.id === id)?.enabled ?? false,
    stats,
    bumpStat: (key) => setStats((prev) => ({ ...prev, [key]: prev[key] + 1 })),
    resetDemo: () => {
      storage.clearAll()
      window.location.hash = '/conversations'
      window.location.reload()
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppStore debe usarse dentro de AppStoreProvider')
  return ctx
}

/** Citas activas a partir de hoy, ordenadas cronológicamente. */
export const upcoming = (list: Appointment[]) => {
  const t = toISO(today())
  return list
    .filter((a) => a.date >= t && (a.status === 'confirmed' || a.status === 'pending'))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
}

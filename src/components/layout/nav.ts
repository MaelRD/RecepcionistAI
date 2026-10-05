import { BookOpen, CalendarDays, LayoutDashboard, MessagesSquare, SlidersHorizontal, Users, Workflow, type LucideIcon } from 'lucide-react'
import type { ViewId } from '../../types'

export const NAV: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'conversations', label: 'Conversations', icon: MessagesSquare },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'settings', label: 'AI Settings', icon: SlidersHorizontal },
]

/** Navegación inferior en móvil: los 4 más usados + "Más". */
export const MOBILE_PRIMARY: ViewId[] = ['conversations', 'overview', 'agenda', 'knowledge']

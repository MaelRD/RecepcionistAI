import { CalendarPlus, CalendarX, Clock, Headset, Tag } from 'lucide-react'
import type { QuickActionId } from '../../types'

const ACTIONS: { id: QuickActionId; label: string; icon: typeof Tag }[] = [
  { id: 'book', label: 'Quiero agendar una cita', icon: CalendarPlus },
  { id: 'prices', label: 'Consultar precios', icon: Tag },
  { id: 'hours', label: 'Consultar horarios', icon: Clock },
  { id: 'cancel', label: 'Cancelar cita', icon: CalendarX },
  { id: 'human', label: 'Hablar con una persona', icon: Headset },
]

export function QuickActions({ onPick, disabled }: { onPick: (id: QuickActionId) => void; disabled?: boolean }) {
  return (
    <div className="scroll-thin -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          disabled={disabled}
          onClick={() => onPick(a.id)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-medium text-zinc-600 ring-1 ring-zinc-950/[0.08] transition hover:text-zinc-900 hover:ring-zinc-950/20 active:scale-[0.97] disabled:opacity-50"
        >
          <a.icon className="size-3.5 text-zinc-400" />
          {a.label}
        </button>
      ))}
    </div>
  )
}

import { Brain, Paintbrush, PenTool, Scissors } from 'lucide-react'
import type { BusinessProfile } from '../../types'

function ToothIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7.5 3.5c-2.4 0-4 1.9-4 4.4 0 2.3.9 3.6 1.5 5.4.7 2.1.8 7.2 2.8 7.2 1.6 0 1.4-4.4 2.6-5.6.4-.4 1.8-.4 2.2 0 1.2 1.2 1 5.6 2.6 5.6 2 0 2.1-5.1 2.8-7.2.6-1.8 1.5-3.1 1.5-5.4 0-2.5-1.6-4.4-4-4.4-1.8 0-2.6 1-4.5 1s-2.7-1-4.5-1Z" />
    </svg>
  )
}

const MAP = {
  tooth: ToothIcon,
  nails: Paintbrush,
  barber: Scissors,
  psychology: Brain,
  tattoo: PenTool,
} as const

export function BusinessIcon({ icon, className }: { icon: BusinessProfile['icon']; className?: string }) {
  const Icon = MAP[icon]
  return <Icon className={className} />
}

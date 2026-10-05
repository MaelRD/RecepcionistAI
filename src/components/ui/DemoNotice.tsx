import { Info } from 'lucide-react'
import { cn } from '../../lib/cn'

export const DEMO_COPY = 'Esto es una demostración. La recepcionista puede configurarse según los procesos de cada negocio.'

export function DemoNotice({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex items-start gap-2.5 rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-[13px] text-brand-700 ring-1 ring-inset ring-brand-500/10', className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <p className={cn('leading-snug', compact && 'text-[12px]')}>{DEMO_COPY}</p>
    </div>
  )
}

import { cn } from '../../lib/cn'
import { initials } from '../../lib/format'

const PALETTE = ['bg-sky-100 text-sky-700', 'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-rose-100 text-rose-700', 'bg-violet-100 text-violet-700', 'bg-zinc-100 text-zinc-700']

export function Avatar({ name, className }: { name: string; className?: string }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (
    <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', PALETTE[hash % PALETTE.length], className)}>
      {initials(name) || '?'}
    </span>
  )
}

/** Marca de la recepcionista IA: orbe con gradiente suave del color del negocio. */
export function AIOrb({ className, pulse }: { className?: string; pulse?: boolean }) {
  return (
    <span className={cn('relative inline-flex size-8 shrink-0 items-center justify-center', className)}>
      {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/25 [animation-duration:1.8s]" />}
      <span className="relative size-full rounded-full bg-[radial-gradient(circle_at_30%_25%,#fff_0%,var(--brand-100)_22%,var(--brand-500)_62%,var(--brand-700)_100%)] shadow-[inset_0_-2px_6px_rgb(0_0_0/0.15),0_2px_8px_-2px_var(--brand-500)]" />
    </span>
  )
}

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'brand' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-zinc-900 text-white shadow-[0_1px_2px_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.12)] hover:bg-zinc-800',
  brand: 'bg-brand-600 text-white shadow-[0_1px_2px_rgb(0_0_0/0.15),inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-brand-700',
  secondary: 'bg-white text-zinc-800 ring-1 ring-zinc-950/10 shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-zinc-50',
  ghost: 'text-zinc-600 hover:bg-zinc-950/[0.04] hover:text-zinc-900',
  danger: 'bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant = 'secondary', size = 'md', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex shrink-0 select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,box-shadow,transform,color] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  />
))
Button.displayName = 'Button'

import { motion } from 'framer-motion'
import { Ellipsis, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { MOBILE_PRIMARY, NAV } from './nav'
import { useAppStore } from '../../context/AppStore'
import { Drawer } from '../ui/Drawer'
import { cn } from '../../lib/cn'

export function BottomNav() {
  const { view, navigate, resetDemo } = useAppStore()
  const [more, setMore] = useState(false)
  const primary = NAV.filter((n) => MOBILE_PRIMARY.includes(n.id))
  const secondary = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.id))
  const moreActive = secondary.some((n) => n.id === view)

  return (
    <>
      <nav className="glass fixed inset-x-0 bottom-0 z-30 border-t border-zinc-950/[0.06] pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Navegación">
        <div className="grid grid-cols-5">
          {[...primary.map((n) => ({ ...n, onClick: () => navigate(n.id), active: view === n.id })), { id: 'more', label: 'Más', icon: Ellipsis, onClick: () => setMore(true), active: moreActive }].map((item) => (
            <button key={item.id} onClick={item.onClick} className={cn('relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors', item.active ? 'text-zinc-900' : 'text-zinc-400')}>
              {item.active && <motion.span layoutId="bottom-nav" className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <item.icon className={cn('size-5', item.active && 'text-brand-600')} strokeWidth={item.active ? 2.1 : 1.8} />
              {item.label === 'Conversations' ? 'Chat' : item.label}
            </button>
          ))}
        </div>
      </nav>
      <Drawer open={more} onClose={() => setMore(false)} side="bottom" title="Más módulos">
        <div className="space-y-1 px-3 pb-2">
          {secondary.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                navigate(n.id)
                setMore(false)
              }}
              className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium', view === n.id ? 'bg-zinc-100' : 'active:bg-zinc-50')}
            >
              <n.icon className="size-5 text-zinc-500" /> {n.label}
            </button>
          ))}
          <button onClick={resetDemo} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[14px] text-zinc-400">
            <RotateCcw className="size-4" /> Restablecer demo
          </button>
        </div>
      </Drawer>
    </>
  )
}

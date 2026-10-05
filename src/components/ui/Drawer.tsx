import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

/** Panel lateral (tablet) o inferior (móvil) para el contexto de la conversación. */
export function Drawer({ open, onClose, side, title, children }: { open: boolean; onClose: () => void; side: 'right' | 'bottom'; title: string; children: ReactNode }) {
  const isBottom = side === 'bottom'
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40">
          <motion.div className="absolute inset-0 bg-zinc-950/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            initial={isBottom ? { y: '100%' } : { x: '100%' }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            drag={isBottom ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose()
            }}
            className={
              isBottom
                ? 'absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white shadow-[var(--shadow-lift)]'
                : 'absolute inset-y-0 right-0 flex w-[min(380px,92vw)] flex-col bg-white shadow-[var(--shadow-lift)]'
            }
          >
            {isBottom && <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-zinc-200" />}
            <div className="flex shrink-0 items-center justify-between px-5 pt-3 pb-2">
              <p className="text-sm font-semibold">{title}</p>
              <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <X className="size-4" />
              </button>
            </div>
            <div className="scroll-thin min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

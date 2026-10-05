import { motion } from 'framer-motion'
import { AIOrb } from '../ui/Avatar'

export function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="mt-3 flex items-end gap-2.5" aria-label="Escribiendo">
      <AIOrb className="size-7" pulse />
      <div className="flex h-9 items-center gap-1 rounded-[18px] rounded-tl-md bg-white px-4 ring-1 ring-zinc-950/[0.06]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-zinc-400"
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}

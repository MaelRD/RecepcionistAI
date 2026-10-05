import { motion } from 'framer-motion'
import type { ChatMessage } from '../../types'
import { AIOrb, Avatar } from '../ui/Avatar'
import { CardView } from './MessageCards'
import { formatTime } from '../../lib/dates'
import { cn } from '../../lib/cn'

interface Props {
  message: ChatMessage
  /** Primer mensaje de una racha del mismo autor: muestra avatar. */
  first: boolean
  aiName: string
}

export function MessageBubble({ message: m, first, aiName }: Props) {
  if (m.role === 'system') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-2">
        <span className="rounded-full bg-zinc-950/[0.04] px-3 py-1 text-[11.5px] text-zinc-500">{m.text}</span>
      </motion.div>
    )
  }

  const mine = m.role === 'customer'
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
      className={cn('flex gap-2.5', mine ? 'justify-end' : 'justify-start', first ? 'mt-3' : 'mt-1')}
    >
      {!mine && <div className="w-7 shrink-0">{first && (m.role === 'human' ? <Avatar name={m.author ?? 'Equipo'} className="size-7" /> : <AIOrb className="size-7" />)}</div>}
      <div className={cn('flex max-w-[82%] flex-col sm:max-w-[72%]', mine ? 'items-end' : 'items-start')}>
        {first && !mine && (
          <p className="mb-1 ml-1 text-[11.5px] text-zinc-400">
            <span className="font-medium text-zinc-600">{m.role === 'human' ? m.author : aiName}</span>
            {m.role === 'ai' && ' · Recepcionista IA'} · {formatTime(m.at)}
          </p>
        )}
        {m.card ? (
          <CardView card={m.card} />
        ) : (
          <div
            className={cn(
              'px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-line',
              mine
                ? 'rounded-[18px] rounded-br-md bg-zinc-900 text-white shadow-[0_1px_2px_rgb(0_0_0/0.15)]'
                : m.role === 'human'
                  ? 'rounded-[18px] rounded-tl-md bg-amber-50 text-amber-950 ring-1 ring-amber-600/10'
                  : 'rounded-[18px] rounded-tl-md bg-white text-zinc-800 ring-1 ring-zinc-950/[0.06] shadow-[0_1px_2px_rgb(0_0_0/0.03)]',
            )}
          >
            {m.text}
          </div>
        )}
      </div>
    </motion.div>
  )
}

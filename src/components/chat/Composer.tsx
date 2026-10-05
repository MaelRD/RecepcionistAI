import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, type FormEvent } from 'react'
import { useConversation } from '../../context/ConversationContext'
import { cn } from '../../lib/cn'

export function Composer() {
  const { draft, setDraft, send, autoplay, state } = useConversation()
  const inputRef = useRef<HTMLInputElement>(null)
  const transferred = state.handoff === 'transferred'

  useEffect(() => {
    if (!autoplay && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
  }, [autoplay])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) send(draft)
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 ring-1 ring-zinc-950/[0.08] shadow-[var(--shadow-soft)] transition focus-within:ring-brand-500/40 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-500)_10%,transparent)]">
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        readOnly={autoplay}
        placeholder={transferred ? 'Escribe al equipo de Recepción…' : 'Escribe como si fueras un cliente…'}
        aria-label="Mensaje"
        className="min-w-0 flex-1 bg-transparent py-1.5 text-[16px] placeholder:text-zinc-400 focus:outline-none sm:text-[14.5px]"
      />
      <button
        type="submit"
        disabled={!draft.trim()}
        aria-label="Enviar"
        className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl transition active:scale-95', draft.trim() ? 'bg-brand-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)]' : 'bg-zinc-100 text-zinc-400')}
      >
        <ArrowUp className="size-4" strokeWidth={2.4} />
      </button>
    </form>
  )
}

import { ChatView } from '../components/chat/ChatView'
import { ContextPanel } from '../components/chat/ContextPanel'

export function ConversationsPage() {
  return (
    <>
      <ChatView />
      <aside className="scroll-thin hidden w-[340px] shrink-0 overflow-y-auto border-l border-zinc-950/[0.06] bg-[#fbfbfb] xl:block" aria-label="Contexto de la conversación">
        <ContextPanel />
      </aside>
    </>
  )
}

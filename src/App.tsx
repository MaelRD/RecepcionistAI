import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ComponentType } from 'react'
import type { ViewId } from './types'
import { useAppStore } from './context/AppStore'
import { useMediaQuery } from './hooks/useMediaQuery'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/layout/BottomNav'
import { Drawer } from './components/ui/Drawer'
import { ContextPanel } from './components/chat/ContextPanel'
import { ConversationsPage } from './pages/Conversations'
import { OverviewPage } from './pages/Overview'
import { AgendaPage } from './pages/Agenda'
import { CustomersPage } from './pages/Customers'
import { KnowledgePage } from './pages/Knowledge'
import { AutomationsPage } from './pages/Automations'
import { SettingsPage } from './pages/Settings'
import { cn } from './lib/cn'

const PAGES: Record<ViewId, ComponentType> = {
  overview: OverviewPage,
  conversations: ConversationsPage,
  agenda: AgendaPage,
  customers: CustomersPage,
  knowledge: KnowledgePage,
  automations: AutomationsPage,
  settings: SettingsPage,
}

export default function App() {
  const { view, business } = useAppStore()
  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [contextOpen, setContextOpen] = useState(false)
  const isChat = view === 'conversations'
  const Page = PAGES[view]

  // El color de marca se adapta al negocio seleccionado.
  useEffect(() => {
    const root = document.documentElement
    Object.entries(business.accent).forEach(([k, v]) => root.style.setProperty(`--brand-${k}`, v))
  }, [business])

  useEffect(() => {
    if (isDesktop || !isChat) setContextOpen(false)
  }, [isDesktop, isChat])

  return (
    <div className="flex h-dvh overflow-hidden">
      {!isMobile && <Sidebar compact={!isDesktop} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar showSwitcher={!isDesktop} onOpenContext={isChat && !isDesktop ? () => setContextOpen(true) : undefined} />

        <main className={cn('relative min-h-0 flex-1', isChat ? 'flex overflow-hidden' : 'scroll-thin overflow-y-auto', isMobile && 'pb-[calc(56px+env(safe-area-inset-bottom))]')}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(isChat ? 'flex min-w-0 flex-1' : 'min-h-full')}
            >
              <Page />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!isDesktop && (
        <Drawer open={contextOpen} onClose={() => setContextOpen(false)} side={isMobile ? 'bottom' : 'right'} title="Contexto de la conversación">
          <ContextPanel embedded />
        </Drawer>
      )}
      {isMobile && <BottomNav />}
    </div>
  )
}

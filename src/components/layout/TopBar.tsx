import { ArrowUpRight, PanelRight } from 'lucide-react'
import { NAV } from './nav'
import { useAppStore } from '../../context/AppStore'
import { useLead } from '../../context/LeadContext'
import { BusinessSwitcher } from './BusinessSwitcher'
import { Brand } from './Sidebar'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export function TopBar({ showSwitcher, onOpenContext }: { showSwitcher: boolean; onOpenContext?: () => void }) {
  const { view } = useAppStore()
  const { openLead } = useLead()
  const current = NAV.find((n) => n.id === view)

  return (
    <header className="glass sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-950/[0.06] px-4 md:px-5">
      <div className="md:hidden">
        <Brand compact />
      </div>
      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <p className="truncate text-[14px] font-semibold">{current?.label}</p>
        <Badge tone="neutral" className="hidden lg:inline-flex">
          Demo
        </Badge>
      </div>
      <div className="ml-auto flex min-w-0 items-center gap-2">
        {showSwitcher && (
          <div className="w-[min(46vw,200px)]">
            <BusinessSwitcher compact align="right" />
          </div>
        )}
        {onOpenContext && (
          <Button variant="secondary" size="sm" onClick={onOpenContext} aria-label="Ver contexto de la conversación">
            <PanelRight className="size-4" />
            <span className="hidden sm:inline">Contexto</span>
          </Button>
        )}
        <Button variant="primary" size="sm" onClick={openLead} className="hidden sm:inline-flex">
          <span className="xl:hidden">Quiero una</span>
          <span className="hidden xl:inline">Quiero una recepcionista para mi negocio</span>
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    </header>
  )
}

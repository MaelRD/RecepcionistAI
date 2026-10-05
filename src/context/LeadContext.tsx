import { createContext, useContext, useState, type ReactNode } from 'react'
import { LeadModal } from '../components/layout/LeadModal'

const Ctx = createContext<{ openLead: () => void }>({ openLead: () => {} })

export function LeadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Ctx.Provider value={{ openLead: () => setOpen(true) }}>
      {children}
      <LeadModal open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  )
}

export const useLead = () => useContext(Ctx)

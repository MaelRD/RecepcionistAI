import { useCallback, useEffect, useState } from 'react'
import type { ViewId } from '../types'

const VIEWS: ViewId[] = ['overview', 'conversations', 'agenda', 'customers', 'knowledge', 'automations', 'settings']

const read = (): ViewId => {
  const hash = window.location.hash.replace('#/', '').replace('#', '') as ViewId
  return VIEWS.includes(hash) ? hash : 'conversations'
}

/** Navegación ligera basada en hash: funciona en Netlify sin configurar rutas. */
export function useHashView() {
  const [view, setView] = useState<ViewId>(read)
  useEffect(() => {
    const onHash = () => setView(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const navigate = useCallback((next: ViewId) => {
    window.location.hash = `/${next}`
    setView(next)
  }, [])
  return [view, navigate] as const
}

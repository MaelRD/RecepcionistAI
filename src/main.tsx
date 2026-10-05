import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig, MotionGlobalConfig } from 'framer-motion'
import './index.css'
import App from './App'
import { AppStoreProvider } from './context/AppStore'
import { ConversationProvider } from './context/ConversationContext'
import { LeadProvider } from './context/LeadContext'

// `?static` desactiva animaciones (útil para capturas y pruebas automatizadas).
if (new URLSearchParams(window.location.search).has('static')) MotionGlobalConfig.skipAnimations = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AppStoreProvider>
        <ConversationProvider>
          <LeadProvider>
            <App />
          </LeadProvider>
        </ConversationProvider>
      </AppStoreProvider>
    </MotionConfig>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'

window.onerror = (message, source, lineno, colno, error) => {
  console.error('GLOBAL ERROR:', {
    message,
    source,
    lineno,
    colno,
    error,
  })
  return false
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('GLOBAL ERROR:', event.reason)
})

const renderApp = () => {
  console.log('[SheCare] main.tsx bootstrapping app')

  const rootElement = document.getElementById('root')

  if (!rootElement) {
    console.error('[SheCare] Root element with id "root" not found')
    return
  }

  console.log('[SheCare] Root element found, rendering React app')
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[SheCare] DOMContentLoaded fired')
    renderApp()
  })
} else {
  renderApp()
}

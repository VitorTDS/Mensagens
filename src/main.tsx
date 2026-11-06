import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { registerPwa } from './lib/pwa'

registerPwa()

// O Safari do iPhone ignora o bloqueio de zoom da meta viewport no gesto de pinca.
document.addEventListener('gesturestart', (event) => event.preventDefault())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

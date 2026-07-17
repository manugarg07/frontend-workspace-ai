import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initErrorMonitoring } from '@/services/errorMonitoring'
import './index.css'
import App from './App.tsx'

// Start centralized logging and global crash boundary tracking
initErrorMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

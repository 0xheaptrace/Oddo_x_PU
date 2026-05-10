import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useUiStore } from '@/store/uiStore'

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

applyTheme(useUiStore.getState().theme)
let lastTheme = useUiStore.getState().theme
useUiStore.subscribe((s) => {
  if (s.theme !== lastTheme) {
    lastTheme = s.theme
    applyTheme(s.theme)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

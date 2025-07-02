import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { LogServiceProvider } from '@/lib/service-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LogServiceProvider>
        <App />
      </LogServiceProvider>
    </QueryClientProvider>
  </StrictMode>,
)

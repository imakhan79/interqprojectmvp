import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'
import './index.css'

window.onerror = (msg, url, line, col, error) => {
  console.error('Global error:', msg, 'line:', line, 'error:', error);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="interq-admin-theme">
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
)

import "@fontsource-variable/inter";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/theme-provider'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="timeline-ui-theme">
    <App />
  </ThemeProvider>
);

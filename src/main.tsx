import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './integrations/SentryConfig'
import { initConsoleGuard } from './security/ConsoleGuard'
import { initSecurityHardening } from './security/SecurityHardening'

// Initialize Sentry before the app renders
initSentry();

// Initialize Console Guard for safety
initConsoleGuard();

// Apply security hardening
initSecurityHardening();

// GLOBAL CHUNK RECOVERY: Handle "Failed to fetch dynamically imported module"
// This happens after a new deployment when the browser tries to load old assets.
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module') || 
      e.message?.includes('Importing a module script failed')) {
    console.warn('🛡️ Chunk load failure detected. Attempting recovery...');
    window.location.reload();
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('Failed to fetch dynamically imported module')) {
    console.warn('🛡️ Async chunk load failure detected. Attempting recovery...');
    window.location.reload();
  }
});

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

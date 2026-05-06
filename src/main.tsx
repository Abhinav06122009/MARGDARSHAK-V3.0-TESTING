import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import GlobalQuickActions from '@/components/navigation/GlobalQuickActions';
import { AmbientSoundPlayer } from '@/components/ui/AmbientSoundPlayer';
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
window.addEventListener('error', (e) => {
  const isChunkError = e.message?.includes('Failed to fetch dynamically imported module') || 
                       e.message?.includes('Importing a module script failed');
  
  if (isChunkError) {
    const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0');
    if (reloadCount < 3) {
      sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
      console.warn(`🛡️ Chunk load failure detected. Attempting recovery (${reloadCount + 1}/3)...`);
      window.location.reload();
    } else {
      console.error('🛡️ Recovery failed. Please check your internet connection or clear browser cache.');
      sessionStorage.removeItem('chunk_reload_count');
    }
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  const isChunkError = e.reason?.message?.includes('Failed to fetch dynamically imported module');
  if (isChunkError) {
    const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0');
    if (reloadCount < 3) {
      sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
      window.location.reload();
    }
  }
});

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <>
    <App />
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-4 pointer-events-auto">
      <GlobalQuickActions isDocked />
      <AmbientSoundPlayer isWidget />
    </div>
  </>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './integrations/SentryConfig'
import { initConsoleGuard } from './security/ConsoleGuard'

// Initialize Sentry before the app renders
initSentry();

// Initialize Console Guard for safety
initConsoleGuard();

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

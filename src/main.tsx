import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './integrations/SentryConfig'

// Initialize Sentry before the app renders
initSentry();

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);

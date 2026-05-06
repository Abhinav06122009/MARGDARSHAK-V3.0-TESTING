import * as Sentry from "@sentry/react";

/**
 * Initializes Sentry for error tracking.
 * Optimized for core stability and PII collection.
 */
export const initSentry = () => {
  
  Sentry.init({
    dsn: "https://bbf03485b3c84be48acc4182e1a62991@o4511286169108480.ingest.us.sentry.io/4511286186344448",
    
    // Essential integrations for performance and error context
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.1,
    
    // Session Replay
    replaysSessionSampleRate: 0.05, // Sample 5% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
    
    // Distributed Tracing 
    // Removed Supabase from here to prevent CORS 'baggage' header issues
    tracePropagationTargets: ["localhost"],

    // PII & Identity
    sendDefaultPii: true,
    
    environment: import.meta.env.MODE || 'development',
    debug: false, // Disable debug mode for production performance
  });
  
  Sentry.captureMessage("Sentry initialized in Margdarshak", "info");
};

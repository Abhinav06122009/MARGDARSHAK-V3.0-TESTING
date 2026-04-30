/**
 * ConsoleGuard.ts
 * Prevents Self-XSS attacks by warning users about the dangers of pasting code into the console.
 */

export const initConsoleGuard = () => {
  // Only run in production to avoid hindering development. 
  // To test in development, comment out the line below.
  if (import.meta.env.DEV) return;

  const warningTitle = '⚠️ SECURITY WARNING!';
  const warningText = 'Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS. Do not enter or paste code that you do not understand. If someone told you to paste something here, they are trying to hack you.';


  const titleStyle = [
    'color: #ff0000',
    'font-size: 50px',
    'font-weight: bold',
    'text-shadow: 2px 2px 0 rgb(0, 0, 0)',
    'padding: 10px',
  ].join(';');

  const textStyle = [
    'color: #000000',
    'font-size: 18px',
    'line-height: 1.5',
    'font-family: sans-serif',
  ].join(';');

  // Capture original methods before overriding
  const originalLog = console.log;
  const originalClear = console.clear;
  const originalError = console.error;
  const originalWarn = console.warn;

  // EXPOSE DEBUG TRACE (Hidden back-door for debugging)
  (window as any)._trace = {
    log: originalLog,
    error: originalError,
    warn: originalWarn,
    clear: originalClear
  };

  // Check for Debug Bypass
  const isDebug = 
    localStorage.getItem('debug') === 'true' || 
    window.location.search.includes('debug=true');

  const showWarning = () => {
    if (isDebug) {
      originalLog.call(console, '🛠️ DEBUG MODE ACTIVE: Console Guard Bypassed.');
      return;
    }
    originalClear.call(console);
    originalLog.call(console, `%c${warningTitle}`, titleStyle);
    originalLog.call(console, `%c${warningText}`, textStyle);
  };

  // Run immediately
  showWarning();

  // If debug is active, we don't override the console
  if (isDebug) return;

  // Override console methods to prevent other logs
  const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'group', 'groupCollapsed', 'groupEnd'];
  
  methods.forEach(method => {
    (console as any)[method] = (...args: any[]) => {
      // Just keep it quiet, but still log to Sentry if available
      // originalError.call(console, ...args); // Uncomment for invisible debugging
    };
  });
};

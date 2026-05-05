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


  // Check for Debug Bypass - ONLY ALLOWED IN DEV
  const isDebug = import.meta.env.DEV && (
    localStorage.getItem('debug') === 'true' || 
    window.location.search.includes('debug=true')
  );

  // --- EXTREME LOCKDOWN ---
  const blockConsole = () => {
    if (isDebug) return;

    // 1. Removed debugger trap to prevent browser freezing.
    
    // 2. Overwrite all methods with empty stubs + track attempts
    const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'group', 'groupCollapsed', 'groupEnd', 'clear', 'time', 'timeEnd', 'count', 'assert'];
    
    const silentConsole: any = {};
    methods.forEach(m => {
      silentConsole[m] = () => {
        // Trigger a strike if they try to call console methods in production
        if (!isDebug) {
          window.dispatchEvent(new CustomEvent('security-violation', { detail: { type: 'Console Probe', metadata: { method: m } } }));
        }
      };
    });

    // 3. Force console object to be immutable
    try {
      Object.defineProperty(window, 'console', {
        value: silentConsole,
        writable: false,
        configurable: false
      });
    } catch (e) {
      methods.forEach(m => {
        try {
          Object.defineProperty(console, m, {
            value: () => {},
            writable: false,
            configurable: false
          });
        } catch (err) {}
      });
    }

    // 4. Removed the trap to prevent performance degradation
  };

  // Run immediately
  blockConsole(); 

  const showWarning = () => {
    if (isDebug) {
      originalLog.call(console, '🛡️ DEBUG MODE ACTIVE: Console Guard Bypassed.');
      return;
    }
    
    // Use the original log methods one last time before complete blackout
    originalClear.call(console);
    originalLog.call(console, `%c${warningTitle}`, titleStyle);
    originalLog.call(console, `%c${warningText}`, textStyle);
    
    // Add a final "F*** OFF" message for potential attackers
    originalLog.call(console, '%cACCESS DENIED: All activity is being logged and traced to your IP.', 'color: red; font-weight: bold;');
  };

  if (!isDebug) showWarning();
};

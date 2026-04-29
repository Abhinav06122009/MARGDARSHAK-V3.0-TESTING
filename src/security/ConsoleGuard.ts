/**
 * ConsoleGuard.ts
 * Prevents Self-XSS attacks by warning users about the dangers of pasting code into the console.
 */

export const initConsoleGuard = () => {
  // Only run in production to avoid hindering development. 
  // To test in development, comment out the line below.
  if (import.meta.env.DEV) return;

  const warningTitle = 'Stop!';
  const warningText = 'Using this console may allow attackers to impersonate you and steal your information using an attack called Self-XSS.Do not enter or paste code that you do not understand.';


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

  const showWarning = () => {
    originalClear.call(console);
    originalLog.call(console, `%c${warningTitle}`, titleStyle);
    originalLog.call(console, `%c${warningText}`, textStyle);
  };

  // Run immediately
  showWarning();

  // Override console methods to prevent other logs
  const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'error', 'table', 'group', 'groupCollapsed', 'groupEnd'];
  
  methods.forEach(method => {
    (console as any)[method] = () => {
      // Just keep it quiet, don't re-show the massive warning on every log
      // which triggers console.clear() and causes UI lag
    };
  });
};

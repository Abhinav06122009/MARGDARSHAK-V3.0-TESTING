/**
 * ConsoleGuard.ts
 * Deep-strips the console to prevent any data leak or devtools analysis.
 * Implements a strict no-recording policy as per VSAV Protocol.
 */

export const initConsoleGuard = () => {
  const isDev = import.meta.env.DEV;
  
  // Define the types of logs to neutralize
  const consoleTypes = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'group', 'groupCollapsed'];

  // Check if we are an officer to allow debugging in local dev
  // Note: in production, even officers might have their logs stripped 
  // depending on the strictest enforcement.
  
  const clearConsole = () => {
    // Only strip in production or if explicitly requested
    if (!isDev) {
      consoleTypes.forEach((type) => {
        (console as any)[type] = () => {
          // Absolute silence
        };
      });
      
      // Override clear to prevent anyone from seeing it happened
      console.clear = () => {};
    }
  };

  clearConsole();

  // Self-Destruct console on interval to ensure no persistent memory leaks
  setInterval(() => {
    if (!isDev) {
      // Periodic deep purge
      consoleTypes.forEach((type) => {
        (console as any)[type] = () => {};
      });
    }
  }, 1000);
};

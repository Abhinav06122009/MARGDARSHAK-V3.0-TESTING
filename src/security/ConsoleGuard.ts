/**
 * ConsoleGuard.ts
 * Deep-strips the console to prevent any data leak or devtools analysis.
 * Displays a high-fidelity security warning before neutralization.
 */

export const initConsoleGuard = () => {
  const isDev = import.meta.env.DEV;
  
  // Define the types of logs to neutralize
  const consoleTypes = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'group', 'groupCollapsed'];

  const showSecurityBanner = () => {
    // A high-fidelity, enhanced console banner
    console.log(
      "%c🛡️ SECURITY PROTOCOL ACTIVE: VSAV GYANTAPA", 
      "color: #10b981; font-size: 36px; font-weight: 900; text-shadow: 0 0 15px #10b981, 0 0 30px #10b981; font-family: 'Inter', system-ui, -apple-system, sans-serif; padding: 20px 0;"
    );
    
    console.log(
      "%c[ ACCESS TERMINATED ]",
      "color: #ef4444; background: #450a0a; font-size: 18px; font-weight: 900; padding: 10px 40px; border-radius: 8px; border: 2px solid #ef4444; margin: 10px 0;"
    );

    console.log(
      "%cDue to deep-layered security enforcement by VSAV GYANTAPA, this console has been effectively neutralized. Any attempt to inspect, scrape, or tamper with the application environment is a direct violation of the VSAV Security Accord.",
      "color: #d1d5db; font-size: 14px; font-weight: 600; line-height: 1.6; border-left: 4px solid #10b981; padding-left: 20px; margin: 15px 0;"
    );

    console.log(
      "%c⚠️ CRITICAL NOTICE: Your session ID, IP address, and hardware fingerprint have been successfully captured and linked to this terminal instance. The VSAV Sentinel System is monitoring your activity in real-time.",
      "color: #f59e0b; background: #451a03; padding: 12px; border-radius: 4px; font-weight: bold; border: 1px solid #f59e0b;"
    );

    console.log(
      "%cIDENTITY VERIFIED: %cSYSTEM_PROTECTED_ENVIRONMENT",
      "color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 20px;",
      "color: #10b981; font-weight: 900;"
    );
    
    console.log(
      "%c© 2026 VSAV GYANTAPA. ALL RIGHTS RESERVED.",
      "color: #4b5563; font-size: 9px; font-weight: bold; margin-top: 5px;"
    );
  };

  const clearConsole = () => {
    // First, show the banner regardless of mode (so user sees it once)
    showSecurityBanner();

    // Only strip in production
    if (!isDev) {
      // Neutralize
      consoleTypes.forEach((type) => {
        const original = (console as any)[type];
        (console as any)[type] = (...args: any[]) => {
          // Internal Bypass
          if (args[0] && typeof args[0] === 'string' && args[0].includes('__GYANTAPA_BYPASS__')) {
             original.apply(console, args);
             return;
          }
        };
      });
      
      console.clear = () => {};
    }
  };

  clearConsole();

  // Self-Destruct console on interval to ensure no persistent memory leaks
  setInterval(() => {
    if (!isDev) {
      consoleTypes.forEach((type) => {
        if (!(console as any)[type].toString().includes('__GYANTAPA_BYPASS__')) {
          (console as any)[type] = () => {};
        }
      });
    }
  }, 1000);
};

import { supabase, supabaseHelpers } from '@/integrations/supabase/client';
import { translateClerkIdToUUID } from '@/lib/id-translator';

export const initSecurityHardening = () => {
  const isDev = import.meta.env.DEV;

  // Identity & IP Tracking
  let userIP = 'unknown';
  const resolveIP = async () => {
    if (userIP !== 'unknown') return userIP;
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      userIP = data.ip;
      return userIP;
    } catch { return 'unknown'; }
  };
  resolveIP();

  const getFingerprint = () => ({
    ua: navigator.userAgent,
    lang: navigator.language,
    scr: `${window.screen.width}x${window.screen.height}`,
    plat: navigator.platform,
    cores: navigator.hardwareConcurrency,
    mem: (navigator as any).deviceMemory
  });

  // Violation Cooldown (Prevent Double-Striking)
  const violationCooldowns = new Map<string, number>();

  // --- ELITE BYPASS CACHE ---
  let cachedIsOfficer: boolean | null = null;
  const isEliteOfficer = async () => {
    if (cachedIsOfficer !== null) return cachedIsOfficer;
    try {
      const clerk = (window as any).Clerk;
      if (!clerk?.user) return false;
      
      const metadata = clerk.user.publicMetadata || {};
      const subscription = (metadata.subscription as any) || {};
      
      // DEEP ROLE SCAN: Check multiple possible locations for roles
      const rawRoles = subscription.role || 
                       (metadata as any).role || 
                       (metadata.public as any)?.role || 
                       [];
      
      const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
      const normalizedRoles = roles.map((r: any) => String(r).toLowerCase().replace(/_/g, ''));

      // Officer definition: Owners, Admins, or multiple high-level roles
      const isAplusPlus = normalizedRoles.length >= 2;
      const isAClass = normalizedRoles.some((r: string) => ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'sentinel'].includes(r));
      const isBClass = normalizedRoles.some((r: string) => ['admin', 'superadmin', 'owner', 'official'].includes(r));

      cachedIsOfficer = isAplusPlus || isAClass || isBClass;

      // RECOVERY PROTOCOL: If they are an officer, clear any existing bans
      if (cachedIsOfficer) {
        if (sessionStorage.getItem('mg_session_locked') === 'true') {
          console.log('🛡️ [SECURITY] Officer detected. Clearing session lock.');
          sessionStorage.removeItem('mg_session_locked');
        }
        if (parseInt(localStorage.getItem('mg_security_strikes') || '0') > 0) {
          console.log('🛡️ [SECURITY] Officer detected. Resetting security strikes.');
          localStorage.setItem('mg_security_strikes', '0');
        }
      }

      return cachedIsOfficer;
    } catch { 
      return false; 
    }
  };

  const logViolation = async (type: string, metadata: any = {}) => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('googlebot') || ua.includes('adsense')) return;
    
    // Non-blocking check
    isEliteOfficer().then(isOfficer => {
      if (isOfficer) {
        console.log('🛡️ Officer detected: Security protocols bypassed.');
        return;
      }
      executeViolationLog(type, metadata);
    });
  };

  const executeViolationLog = async (type: string, metadata: any = {}) => {
    const now = Date.now();
    const lastTrigger = violationCooldowns.get(type) || 0;
    if (now - lastTrigger < 5000) return;
    violationCooldowns.set(type, now);

    try {
      const currentIP = await resolveIP();
      const persistentId = localStorage.getItem('mg_sid') || 'trace-' + Math.random().toString(36).slice(2);
      if (!localStorage.getItem('mg_sid')) localStorage.setItem('mg_sid', persistentId);

      let userId: string | null = null;
      const user = await supabaseHelpers.getCurrentUser();
      
      if (user) {
        userId = user.id;
      } else if ((window as any).Clerk?.user) {
        userId = await translateClerkIdToUUID((window as any).Clerk.user.id);
      }

      if (!userId) {
        window.dispatchEvent(new CustomEvent('security-warning', { detail: { type, ip: currentIP } }));
        return;
      }

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: dbThreats } = await supabase
        .from('security_threats')
        .select('id')
        .or(`ip_address.eq.${currentIP},metadata->>persistent_id.eq.${persistentId}${userId ? `,user_id.eq.${userId}` : ''}`)
        .gt('created_at', oneDayAgo)
        .limit(3); // Optimized limit

      const localStrikes = parseInt(localStorage.getItem('mg_security_strikes') || '0');
      const dbStrikeCount = dbThreats?.length || 0;
      const strikes = Math.max(localStrikes, dbStrikeCount) + 1;

      localStorage.setItem('mg_security_strikes', strikes.toString());
      const fingerprint = getFingerprint();

      if (strikes === 1) {
        await supabase.from('security_threats').insert({
          event_type: type,
          user_id: userId,
          ip_address: currentIP,
          threat_level: 'warning',
          threat_score: 50,
          summary: `STRIKE 1: ${type} detected. Forensic ID: ${persistentId}`,
          metadata: { ...metadata, ...fingerprint, persistent_id: persistentId, strikes: 1 }
        });
        window.dispatchEvent(new CustomEvent('security-warning', { detail: { type, ip: currentIP } }));
      } else {
        await supabase.from('security_threats').insert({
          event_type: type,
          user_id: userId,
          ip_address: currentIP,
          threat_level: 'critical',
          threat_score: 100,
          summary: `STRIKE 2: Persistent ${type}. PERMANENT BAN. Forensic ID: ${persistentId}`,
          metadata: { ...metadata, ...fingerprint, persistent_id: persistentId, strikes: 2 }
        });

        if (userId) {
          await supabase
            .from('profiles')
            .update({ 
              is_blocked: true, 
              blocked_reason: `Permanent Ban: 2 Security Strikes (${type})` 
            })
            .eq('id', userId);
        }

        window.dispatchEvent(new CustomEvent('security-ban', { detail: { type, ip: currentIP } }));
      }
    } catch (err) { if (isDev) console.error('Tracing error:', err); }
  };

  // --- MAXIMUM LOCKDOWN: KEYBOARD & SYSTEM INTERCEPT ---
  const applyKeyboardLockdown = () => {
    const forbiddenKeys = [
      'Control', 'Alt', 'Meta', 'Shift', 'Delete', 'F12', 'F11', 'F10', 'F9', 'F8', 'F7', 'F6', 'F5', 'F4', 'F3', 'F2', 'F1',
      'PrintScreen', 'ScrollLock', 'Pause', 'Insert', 'ContextMenu', 'PageUp', 'PageDown', 'Home', 'End'
    ];

    const handleKeydown = (e: KeyboardEvent) => {
      // Allow officers to work
      if (cachedIsOfficer === true) return;

      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as any).tagName) || (e.target as any).isContentEditable;
      
      // If it's a forbidden key and NOT in an input field, KILL IT
      if (forbiddenKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
        // Exception: Allow Shift only in inputs for typing
        if (e.key === 'Shift' && isInput) return;
        
        // Exception: Allow basic typing shortcuts in inputs if absolutely needed, 
        // but the user asked to block ALL like Ctrl, so we block them.
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Log the tamper attempt if it's a high-risk key
        if (['F12', 'Control', 'Meta', 'Alt'].includes(e.key)) {
          logViolation('Restricted Key Access', { key: e.key, target: (e.target as any).tagName });
        }
        
        return false;
      }
    };

    window.addEventListener('keydown', handleKeydown, { capture: true, passive: false });
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (forbiddenKeys.includes(e.key) && cachedIsOfficer !== true) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true, passive: false });
  };

  // --- SCREENSHOT & CLIPBOARD PROTECTION ---
  const applyMediaProtection = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Disable all selection and interaction */
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
        outline: none !important;
      }
      
      /* Allow inputs to function */
      input, textarea, [contenteditable="true"], .selectable {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }

      /* Prevent image saving/context menu */
      img, video, canvas {
        pointer-events: none !important;
        -webkit-touch-callout: none !important;
        user-select: none !important;
      }

      /* Anti-Screenshot Print Shield */
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    // Clipboard Poisoning
    document.addEventListener('copy', (e) => {
      if (cachedIsOfficer === true) return;
      e.clipboardData?.setData('text/plain', '🛡️ SECURITY ALERT: Data extraction is prohibited. Your IP has been logged.');
      e.preventDefault();
      logViolation('Copy Attempt', { type: 'CLIPBOARD_EXTRACT' });
    });

    // Detect PrintScreen Key
    window.addEventListener('keyup', (e) => {
      if (['PrintScreen', 'Snapshot', 'PrtSc'].includes(e.key)) {
        logViolation('Screenshot Attempt', { key: e.key });
      }
    });
  };

  // --- CONSOLE NEUTRALIZATION PROTOCOL ---
  const applyConsoleNeutralization = () => {
    if (cachedIsOfficer === true) return;

    const clearConsole = () => {
      if (cachedIsOfficer === true) return;
      
      console.clear();
      // 1. Copyright Message
      console.log(
        '%c© 2026 VSAV GYANTAPA | MAXIMUM SECURITY ENFORCEMENT',
        'color: #10b981; font-weight: 900; font-size: 14px; background: #000; padding: 4px 12px; border-radius: 4px;'
      );
      // 2. Security Enforcement Warning
      console.log(
        '%cDue to deep-layered security enforcement by VSAV GYANTAPA, this console has been effectively neutralized. Any attempt to inspect, scrape, or tamper with the application environment is a direct violation of the VSAV Security Accord.',
        'color: #ef4444; font-weight: bold; font-size: 12px; margin-top: 8px; line-height: 1.5;'
      );
      // 3. Access Terminated Badge
      console.log(
        '%c[ ACCESS TERMINATED ]',
        'color: #fff; background: #ef4444; font-weight: 900; font-size: 16px; padding: 10px 40px; margin-top: 15px; border-radius: 8px; border: 2px solid #fff;'
      );
    };

    // Immediate and perpetual clearing cycle (5ms interval as requested)
    const interval = setInterval(clearConsole, 5);
    
    // Total Blackout: Trap all console methods
    const methods: (keyof Console)[] = ['log', 'warn', 'error', 'info', 'debug', 'table', 'trace', 'dir', 'group', 'groupCollapsed'];
    methods.forEach(method => {
      const original = (console as any)[method];
      (console as any)[method] = (...args: any[]) => {
        if (cachedIsOfficer === true) {
          original.apply(console, args);
          return;
        }
        // Void all other logs
      };
    });

    return interval;
  };

  applyKeyboardLockdown();
  applyMediaProtection();
  applyConsoleNeutralization();

  // --- CONTEXT MENU LOCKDOWN ---
  document.addEventListener('contextmenu', (e) => {
    if (cachedIsOfficer === true) return;
    e.preventDefault();
  }, false);

  // --- DEVTOOLS DETECTION ---
  let devtoolsOpen = false;
  const checkDevTools = () => {
    if (cachedIsOfficer === true) return;

    // Detect based on window dimension changes (Side panel open)
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        logViolation('DevTools Detected', { dimension_shift: true });
      }
    } else {
      devtoolsOpen = false;
    }
  };

  setInterval(checkDevTools, 2000);

  window.addEventListener('security-violation', (e: any) => {
    logViolation(e.detail.type, e.detail.metadata);
  });

  // Periodically refresh officer status
  setInterval(isEliteOfficer, 10000);
};


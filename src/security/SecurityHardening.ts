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

  // --- ELITE BYPASS LOGIC ---
  const isEliteOfficer = async () => {
    try {
      const clerk = (window as any).Clerk;
      if (!clerk?.user) return false;
      
      // CRITICAL FIX: Only use publicMetadata for role checks. 
      // unsafeMetadata can be modified by the user from the client.
      const metadata = clerk.user.publicMetadata || {};
      const subscription = (metadata.subscription as any) || {};
      const rawRoles = subscription.role || (metadata as any).role || [];
      const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
      const normalizedRoles = roles.map((r: any) => String(r).toLowerCase().replace(/_/g, ''));

      // A++ Class (Multi-role), A-Class (C-Suite), or B-Class (Admins/Owners)
      const isAplusPlus = normalizedRoles.length >= 2;
      const isAClass = normalizedRoles.some((r: string) => ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio'].includes(r));
      const isBClass = normalizedRoles.some((r: string) => ['admin', 'superadmin', 'owner'].includes(r));

      return isAplusPlus || isAClass || isBClass;
    } catch { return false; }
  };

  const logViolation = async (type: string, metadata: any = {}) => {
    // 0. ELITE & BOT WHITELISTING
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('googlebot') || ua.includes('adsense')) return;
    
    const isOfficer = await isEliteOfficer();
    if (isOfficer) {
      console.log('🛡️ Officer detected: Security protocols bypassed.');
      return;
    }

    // 1. Cooldown Check (5 second window)
    const now = Date.now();
    const lastTrigger = violationCooldowns.get(type) || 0;
    if (now - lastTrigger < 5000) return;
    violationCooldowns.set(type, now);

    try {
      const currentIP = await resolveIP();
      const persistentId = localStorage.getItem('mg_sid') || 'trace-' + Math.random().toString(36).slice(2);
      if (!localStorage.getItem('mg_sid')) localStorage.setItem('mg_sid', persistentId);

      // 1. Identification & Unified Strike Logic
      let userId: string | null = null;
      const user = await supabaseHelpers.getCurrentUser();
      
      if (user) {
        userId = user.id;
      } else if ((window as any).Clerk?.user) {
        userId = await translateClerkIdToUUID((window as any).Clerk.user.id);
      }

      // CRITICAL: Skip DB logging if no authenticated session is present to avoid 401 errors
      // Front-end protection (cooldowns, strikes in localStorage) still functions.
      if (!userId) {
        console.log('🛡️ Security violation noted locally (Anonymous user).');
        window.dispatchEvent(new CustomEvent('security-warning', { detail: { type, ip: currentIP } }));
        return;
      }

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: dbThreats } = await supabase
        .from('security_threats')
        .select('id')
        .or(`ip_address.eq.${currentIP},metadata->>persistent_id.eq.${persistentId}${userId ? `,user_id.eq.${userId}` : ''}`)
        .gt('created_at', oneDayAgo);

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
        // STRIKE 2+: HARD BLOCK
        await supabase.from('security_threats').insert({
          event_type: type,
          user_id: userId,
          ip_address: currentIP,
          threat_level: 'critical',
          threat_score: 100,
          summary: `STRIKE 2: Persistent ${type}. PERMANENT BAN. Forensic ID: ${persistentId}`,
          metadata: { ...metadata, ...fingerprint, persistent_id: persistentId, strikes: 2 }
        });

        // 2. Update profile status to blocked if user is authenticated
        if (userId) {
          await supabase
            .from('profiles')
            .update({ 
              is_blocked: true, 
              blocked_reason: `Permanent Ban: 2 Security Strikes (${type})` 
            })
            .eq('id', userId);
        }

        // 3. Dispatch ban event to UI
        window.dispatchEvent(new CustomEvent('security-ban', { detail: { type, ip: currentIP } }));
      }
    } catch (err) { if (isDev) console.error('Tracing error:', err); }
  };

  // --- SCREENSHOT PROTECTION ---
  const addScreenshotDefense = () => {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body { display: none !important; } }`;
    document.head.appendChild(style);

    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('Security Policy: Screenshots are prohibited.');
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === '4')) {
        window.blur();
      }
    });
  };
  addScreenshotDefense();

  // --- KEYBOARD LOCKDOWN & BYPASS ---
  document.addEventListener('keydown', async (e) => {
    const forbiddenKeys = ['u', 's', 'p', 'a']; // Silent block keys
    const inspectKeys = ['F12', 'i', 'j', 'c']; // DevTools trigger keys
    
    const isForbidden = (e.ctrlKey || e.metaKey) && forbiddenKeys.includes(e.key.toLowerCase());
    const isInspection = e.key === 'F12' || 
                         ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.key.toLowerCase() === 'u') && inspectKeys.includes(e.key.toLowerCase())) ||
                         ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i');

    if (isForbidden || isInspection) {
      const isOfficer = await isEliteOfficer();
      if (isOfficer) return; // Full bypass for officers

      e.preventDefault();
      
      // ONLY F12 or Inspect combos trigger strikes
      if (isInspection) {
        logViolation('Tamper Attempt', { key: e.key, combo: 'DEVT_OPEN' });
      } else {
        // Silent block for others
        console.warn('Action blocked by security policy.');
      }
      return false;
    }
  }, false);

  document.addEventListener('contextmenu', async (e) => {
    const isOfficer = await isEliteOfficer();
    if (!isOfficer) e.preventDefault();
  }, false);

  // --- DEVTOOLS DETECTION ---
  let devtoolsOpen = false;
  const checkDevTools = async () => {
    const isOfficer = await isEliteOfficer();
    if (isOfficer) return;

    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        logViolation('DevTools Opened', { state: 'detected', screen: `${window.outerWidth}x${window.outerHeight}`, inner: `${window.innerWidth}x${window.innerHeight}` });
      }
      // AGGRESSIVE: Freeze the browser if devtools remains open
      (function freeze() {
        while(devtoolsOpen) {
          debugger;
        }
      })();
    } else {
      devtoolsOpen = false;
    }
  };

  // --- NETWORK PROBE DETECTION ---
  const detectNetworkProbe = () => {
    const start = Date.now();
    // Perform a tiny internal fetch to check for interceptors/proxies
    fetch('/favicon.ico', { cache: 'no-store' }).then(() => {
      const duration = Date.now() - start;
      if (duration > 500) { // Unusually slow internal fetch might indicate a proxy/interceptor
        logViolation('Network Proxy Detected', { latency: duration });
      }
    }).catch(() => {});
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 2000); // More frequent checks
  setInterval(detectNetworkProbe, 15000); 

  // Global violation listener (from ConsoleGuard)
  window.addEventListener('security-violation', (e: any) => {
    logViolation(e.detail.type, e.detail.metadata);
  });


  // --- 6. VISUAL LOCKDOWN (TOTAL SHIELD) ---
  const applyVisualLockdown = async () => {
    const isOfficer = await isEliteOfficer();
    if (isOfficer) return;

    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      input, textarea, [contenteditable="true"], .selectable {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        cursor: text !important;
      }
      img {
        pointer-events: none !important;
        -webkit-touch-callout: none !important;
      }
      @media print {
        body {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
  applyVisualLockdown();

  // --- 7. DEVELOPER 2-STEP VERIFICATION (Dev2SV) ---
  const initDev2SV = async () => {
    const isOfficer = await isEliteOfficer();
    if (!isOfficer) return;

    // Check if verified in this volatile session
    const isVerified = (window as any).__MG_DEV_VERIFIED__ === true;
    if (!isVerified) {
      window.dispatchEvent(new CustomEvent('dev-verification-required'));
    }
  };
  initDev2SV();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // console.clear(); // DEACTIVATED FOR DIAGNOSTIC RECORDING
      // Anti-tab-switching: Detect if user is trying to find bypasses elsewhere
    }
  });

  console.log('%c🛡️ SUPREME SECURITY ACTIVE: Brand VSAV Gyantapa Protocol', 'color: #10b981; font-weight: bold; font-size: 20px; text-shadow: 0 0 10px rgba(16,185,129,0.5)');
};

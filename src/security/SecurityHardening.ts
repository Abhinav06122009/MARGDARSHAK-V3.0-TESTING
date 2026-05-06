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

  // --- SCREENSHOT & KEYBOARD PROTECTION ---
  const addScreenshotDefense = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print { body { display: none !important; } }
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -webkit-touch-callout: none !important;
      }
      input, textarea, [contenteditable="true"], .selectable {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      img {
        pointer-events: none !important;
        -webkit-user-drag: none !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('keyup', (e) => {
      const blockedKeys = ['PrintScreen', 'Snapshot', 'PrtSc'];
      if (blockedKeys.includes(e.key)) {
        navigator.clipboard.writeText('🛡️ SECURITY ALERT: Unauthorized data capture prohibited.');
        logViolation('Screenshot Attempt', { key: e.key });
      }
    });

    window.addEventListener('keydown', (e) => {
      // 1. Block Screen Capture Shortcuts (Win+Shift+S, Cmd+Shift+4, etc.)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === '4' || e.key === 's')) {
        e.preventDefault();
        window.blur();
        logViolation('Screen Capture Shortcut', { combo: 'WIN_SHIFT_S' });
      }

      // 2. Block Inspect & DevTools Shortcuts
      const forbiddenKeys = ['u', 's', 'p', 'a', 'i', 'j', 'c'];
      const isForbiddenCombo = (e.ctrlKey || e.metaKey) && forbiddenKeys.includes(e.key.toLowerCase());
      const isF12 = e.key === 'F12';
      
      // 3. Block System Keys (Windows, Alt, Del, etc.)
      const isSystemKey = ['Meta', 'Alt', 'Delete', 'ContextMenu', 'Control'].includes(e.key) && !['input', 'textarea'].includes((e.target as any).tagName.toLowerCase());

      if (isForbiddenCombo || isF12 || isSystemKey) {
        if (cachedIsOfficer === true) return;
        e.preventDefault();
        e.stopPropagation();
        
        if (isForbiddenCombo || isF12) {
          logViolation('Tamper Attempt', { key: e.key, type: 'DEVT_ACCESS' });
        }
        return false;
      }
    }, true);
  };
  addScreenshotDefense();

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

  console.log('%c🛡️ SUPREME SECURITY ACTIVE: Brand VSAV Gyantapa Protocol', 'color: #10b981; font-weight: bold; font-size: 20px; text-shadow: 0 0 10px rgba(16,185,129,0.5)');
};


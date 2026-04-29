import { supabase, supabaseHelpers } from '@/integrations/supabase/client';

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

  const logViolation = async (type: string, metadata: any = {}) => {
    // 0. BOT WHITELISTING
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('googlebot') || ua.includes('adsense')) return;

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
      if (user) userId = user.id;
      if (!userId && (window as any).Clerk?.user) userId = (window as any).Clerk.user.id;

      // Only count threats from the last 24 hours to prevent "Old Strike" bans
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: dbThreats } = await supabase
        .from('security_threats')
        .select('id')
        .or(`ip_address.eq.${currentIP},metadata->>persistent_id.eq.${persistentId}${userId ? `,user_id.eq.${userId}` : ''}`)
        .gt('created_at', oneDayAgo); // Unified across ALL event types

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
          await supabase.from('profiles').update({ is_blocked: true, blocked_reason: `STRIKE 2: Security violation (${type})` }).eq('id', userId);
        }
        window.dispatchEvent(new CustomEvent('security-ban', { detail: { type, ip: currentIP } }));
      }
    } catch (err) { if (isDev) console.error('Tracing error:', err); }
  };

  // If it's a Google bot, we bypass
  const isGoogleBot = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('googlebot') || ua.includes('adsense') || ua.includes('google-adwords');
  };
  if (isGoogleBot()) return;

  // --- SCREENSHOT PROTECTION (ANTI-STEAL) ---
  const addScreenshotDefense = () => {
    // 1. Blackout on Print
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    // 2. Key Detection (PrintScreen / Win+Shift+S)
    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        // Just clear clipboard and notify, NO strike/ban
        navigator.clipboard.writeText('Security Policy: Screenshots are prohibited on MARGDARSHAK.');
        console.warn('Screenshot attempt blocked.');
      }
    });

    window.addEventListener('keydown', (e) => {
      // Win + Shift + S or Cmd + Shift + 4
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === '4')) {
        // Just clear focus to trigger blur, NO strike/ban
        window.blur();
        console.warn('Screenshot shortcut detected. Content obscured.');
      }
    });
  };

  addScreenshotDefense();

  // --- 1. GLOBAL OVERLAYS & DETECTION ---

  // If it's a Google bot, we bypass the aggressive anti-bot/anti-debugger measures
  // to ensure AdSense eligibility and SEO ranking.
  if (isGoogleBot()) {
    console.log('🤖 Google Bot detected: Bypassing security shields for crawling.');
    return;
  }

  // --- 1. GLOBAL OVERLAYS & DETECTION ---

  const createOverlay = (message: string) => {
    const div = document.createElement('div');
    div.id = 'security-overlay';
    div.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: black;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999999;
      font-family: sans-serif;
      text-align: center;
      padding: 20px;
    `;
    div.innerHTML = `
      <h1 style="color: #ff0000; font-size: 3rem; margin-bottom: 20px;">🛡️ SECURITY ALERT</h1>
      <p style="font-size: 1.5rem;">${message}</p>
      <p style="margin-top: 20px; color: #888;">This action is prohibited for security reasons.</p>
    `;
    document.body.appendChild(div);
  };

  // --- 2. PREVENTION OF COPYING AND INSPECTION ---

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  document.addEventListener('keydown', (e) => {
    const forbiddenKeys = ['F12', 'u', 'i', 'j', 'c', 's', 'p', 'a'];
    if (
      e.key === 'F12' ||
      (e.ctrlKey && forbiddenKeys.includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && forbiddenKeys.includes(e.key.toLowerCase())) ||
      (e.metaKey && forbiddenKeys.includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
      return false;
    }
  }, false);

  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('cut', (e) => e.preventDefault());
  document.addEventListener('paste', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  document.addEventListener('dragstart', (e) => e.preventDefault());


  // --- 3. TRACKING AND PRIVACY PROTECTION ---

  const metaReferrer = document.createElement('meta');
  metaReferrer.name = 'referrer';
  metaReferrer.content = 'no-referrer';
  document.head.appendChild(metaReferrer);

  const fixLinks = () => {
    const links = document.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      if (links[i].target === '_blank') {
        if (!links[i].rel.includes('noopener')) links[i].rel += ' noopener';
        if (!links[i].rel.includes('noreferrer')) links[i].rel += ' noreferrer';
      }
    }
  };
  setInterval(fixLinks, 10000); // Increased interval

  if (location.protocol === 'http:' && !isDev) {
    location.replace(`https://${location.host}${location.pathname}${location.search}`);
  }


  // --- 4. HARDENING AND ANTI-HACKING ---

  (window as any).eval = () => {
    throw new Error('Security Violation: eval() is prohibited.');
  };

  if (window.self !== window.top) {
    window.top!.location.href = window.self.location.href;
  }

  // Headless Browser Detection (Bypassed by Google whitelist above)
  if (!isDev) {
    const isHeadless = navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent);
    if (isHeadless) {
      document.body.innerHTML = '<h1>Access Denied: Bot detected</h1>';
      throw new Error('Bot detected');
    }
  }

  // Debugger Protection (Optimized)
  if (!isDev) {
    setInterval(() => {
      if (window.location.pathname.includes('/sso-callback')) return;
      
      const startTime = Date.now();
      (function() {
        // Light check that doesn't use recursion
        const check = function() {
          if (typeof window === 'undefined') return;
          try {
            // Only trigger if console is likely open
            if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
              (function() {}).constructor("debugger")();
            }
          } catch (e) {}
        };
        check();
      })();
      
      // If check takes too long, it might be a sign of debugger interference
      const duration = Date.now() - startTime;
      if (duration > 100) {
        // Slow down even more if we detect lag
        console.warn('⚡ Performance Guard: Throttling security cycles');
      }
    }, 15000); // Increased from 1s to 15s to prevent CPU spikes
  }

  // --- 2. PREVENTION OF COPYING AND INSPECTION ---
  document.addEventListener('keydown', (e) => {
    const forbiddenKeys = ['F12', 'u', 'i', 'j', 'c', 's', 'p', 'a'];
    const isInspection = e.key === 'F12' ||
      (e.ctrlKey && forbiddenKeys.includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && forbiddenKeys.includes(e.key.toLowerCase())) ||
      (e.metaKey && forbiddenKeys.includes(e.key.toLowerCase()));

    if (isInspection) {
      e.preventDefault();
      logViolation('Tamper Attempt', { key: e.key, combo: e.ctrlKey ? 'CTRL' : 'META' });
      return false;
    }
  }, false);

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  // --- 5. DEVTOOLS DETECTION ---
  let devtoolsOpen = false;
  const threshold = 250; // Increased threshold for high-density displays

  const checkDevTools = () => {
    // Skip devtools check on mobile/touch devices as it's prone to false positives
    // due to mobile browser address bars and system UI scaling.
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        logViolation('DevTools Opened', { state: 'detected' });
      }
    } else {
      devtoolsOpen = false;
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 5000); // Increased interval


  // --- 6. VISUAL LOCKDOWN ---

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
    input, textarea, [contenteditable="true"] {
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.clear();
    }
  });

  // --- 7. TAMPER DETECTION ---

  const tamperCheck = () => {
    if (console.log.toString().includes('[native code]') && !isDev) {
      // Tamper logic here if needed
    }
  };
  setInterval(tamperCheck, 15000); // Increased interval

  console.log('%c🛡️ MAX SECURITY ACTIVE', 'color: green; font-weight: bold; font-size: 20px;');
};

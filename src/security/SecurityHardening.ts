import { supabase, supabaseHelpers } from '@/integrations/supabase/client';

export const initSecurityHardening = () => {
  const isDev = import.meta.env.DEV;
  let userIP = 'unknown';

  // Get IP address on load
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => userIP = data.ip)
    .catch(() => {});

  const getFingerprint = () => {
    return {
      ua: navigator.userAgent,
      lang: navigator.language,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency,
      mem: (navigator as any).deviceMemory,
      res: `${window.screen.width}x${window.screen.height}`,
      depth: window.screen.colorDepth,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touch: navigator.maxTouchPoints,
    };
  };

  const logViolation = async (type: string, metadata: any = {}) => {
    try {
      // Attempt to get user from multiple sources for maximum tracing
      let userId: string | null = null;
      let userEmail: string | null = null;
      
      const user = await supabaseHelpers.getCurrentUser();
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }

      // If user ID is still missing, check Clerk directly from window if available
      if (!userId && (window as any).Clerk?.user) {
        userId = (window as any).Clerk.user.id;
        userEmail = (window as any).Clerk.user.primaryEmailAddress?.emailAddress;
      }

      const fingerprint = getFingerprint();
      const payload = {
        event_type: type,
        user_id: userId,
        ip_address: userIP,
        risk_level: 'critical',
        metadata: {
          ...metadata,
          ...fingerprint,
          user_email: userEmail,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          persistent_id: localStorage.getItem('mg_sid') || 'new-trace-' + Math.random().toString(36).slice(2)
        },
        summary: `SECURITY ALERT: ${type} from ${userIP} (User: ${userId || 'Anonymous'})`
      };

      // Store a persistent tracker on their device for subsequent identification
      if (!localStorage.getItem('mg_sid')) {
        localStorage.setItem('mg_sid', payload.metadata.persistent_id);
      }

      // Log to security_logs
      await supabase.from('security_logs').insert(payload);
      
      // Log to security_threats for admin panel visibility
      await supabase.from('security_threats').insert({
        event_type: type,
        user_id: userId,
        ip_address: userIP,
        threat_level: 'critical',
        threat_score: 98,
        summary: `CRITICAL: ${type} by ${userId ? 'Identified User' : 'Anonymous Guest'}. IP: ${userIP}`,
        metadata: payload.metadata
      });

      // If user is identified, perform immediate lockdown and ban
      if (userId) {
        await supabase.from('profiles').update({ 
          risk_level: 'critical',
          security_score: 0,
          is_blocked: true,
          blocked_reason: `AUTOMATED BAN: ${type} detected. Security forensic trace: ${payload.metadata.persistent_id}`
        }).eq('id', userId);
        
        console.warn('🛡️ Security trace completed. User identity confirmed and restricted.');
      } else {
        console.warn('🛡️ Security trace completed. IP logged for administrative review.');
      }
    } catch (err) {
      // Fail silently to the user but log to console in dev if needed
      if (isDev) console.error('Tracing error:', err);
    }
  };

  // --- 0. BOT WHITELISTING (CRITICAL FOR ADSENSE/SEO) ---
  const isGoogleBot = () => {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes('googlebot') || 
      ua.includes('mediapartners-google') || 
      ua.includes('adsbot-google') ||
      ua.includes('google-adwords') ||
      ua.includes('adsense')
    );
  };

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
  setInterval(fixLinks, 3000);

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

  // Debugger Protection (Infinite loop)
  if (!isDev) {
    setInterval(() => {
      (function() {
        (function a() {
          try {
            (function b(i) {
              if (('' + i / i).length !== 1 || i % 20 === 0) {
                (function() {}).constructor('debugger')();
              } else {
                debugger;
              }
              b(++i);
            }(0));
          } catch (e) {
            setTimeout(a, 5000);
          }
        }());
      }());
    }, 1000);
  }


  // --- 5. DEVTOOLS DETECTION ---

  if (!isDev) {
    let devtoolsOpen = false;
    const threshold = 160;
    
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          createOverlay('Developer tools detected. Access restricted.');
          logViolation('DevTools Access Attempt', { state: 'detected' });
        }
      } else {
        if (devtoolsOpen) {
          devtoolsOpen = false;
          const overlay = document.getElementById('security-overlay');
          if (overlay) overlay.remove();
        }
      }
    };
    
    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 1000);
  }


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
  setInterval(tamperCheck, 5000);

  console.log('%c🛡️ MAX SECURITY ACTIVE', 'color: green; font-weight: bold; font-size: 20px;');
};

import { supabase, supabaseHelpers } from '@/integrations/supabase/client';

export const initSecurityHardening = () => {
  const isDev = import.meta.env.DEV;
  let userIP = 'unknown';

  // Get IP address on load
  fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => userIP = data.ip)
    .catch(() => {});

  const logViolation = async (type: string, metadata: any = {}) => {
    try {
      const user = await supabaseHelpers.getCurrentUser();
      const payload = {
        event_type: type,
        user_id: user?.id || null,
        ip_address: userIP,
        risk_level: 'critical',
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          platform: navigator.platform
        },
        summary: `Security Violation: ${type} detected from ${userIP}`
      };

      // Log to security_logs table
      await supabase.from('security_logs').insert(payload);
      
      // Log to security_threats table for immediate visibility
      await supabase.from('security_threats').insert({
        event_type: type,
        user_id: user?.id || null,
        ip_address: userIP,
        threat_level: 'critical',
        threat_score: 95,
        summary: `CRITICAL: ${type} detected from ${userIP}. User Auto-Blocked.`,
        metadata: payload.metadata
      });

      // If user is identified, auto-block them
      if (user?.id) {
        await supabase.from('profiles').update({ 
          risk_level: 'critical',
          security_score: 0,
          is_blocked: true,
          blocked_reason: `System Auto-Block: ${type} detected at ${new Date().toLocaleString()}`
        }).eq('id', user.id);
      }
    } catch (err) {
      console.error('Failed to log security violation:', err);
    }
  };

  // --- 0. BOT WHITELISTING (CRITICAL FOR ADSENSE/SEO) ---
  const isGoogleBot = () => {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes('googlebot') || 
      ua.includes('mediapartners-google') || 
      ua.includes('adsbot-google') ||
      ua.includes('google-adwords')
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

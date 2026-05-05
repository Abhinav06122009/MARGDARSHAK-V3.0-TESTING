import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef, useCallback } from 'react';

export interface BaseDeviceFingerprint {
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  canvas: string;
  timestamp: string;
  colorDepth: number;
  deviceMemory: number | 'unknown';
  hardwareConcurrency: number | 'unknown';
  touchSupport: boolean;
}

export interface DeviceFingerprint extends BaseDeviceFingerprint {
  webgl: {
    vendor: string;
    renderer: string;
  } | 'no_webgl' | 'webgl_error' | 'no_webgl_debug';
  audio: string;
  plugins: number;
}

export const advancedSecurity = {
  getWebGLFingerprint: () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_webgl';
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'no_webgl_debug';
      return {
        vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return 'webgl_error';
    }
  },

  getAudioFingerprint: async () => {
    // AUDIO FINGERPRINTING IS SLOW - USE SPARINGLY
    try {
      const audioContext = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
      if (!audioContext) return 'no_audio_context';
      const context = new audioContext(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      const compressor = context.createDynamicsCompressor();
      const properties: [keyof DynamicsCompressorNode, number][] = [['threshold', -50], ['knee', 40], ['ratio', 12], ['reduction', -20], ['attack', 0], ['release', 0.25]];
      properties.forEach(
        (item) => {
          const prop = compressor[item[0]];
          if (prop && typeof prop.setValueAtTime === 'function') {
            prop.setValueAtTime(item[1], context.currentTime);
          }
        }
      );
      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);
      const buffer = await context.startRendering();
      const sum = buffer.getChannelData(0).slice(4500, 5000).reduce((acc, val) => acc + Math.abs(val), 0);
      return sum.toString();
    } catch (e) {
      return 'audio_context_error';
    }
  },

  enhanceDeviceFingerprint: async (baseFingerprint: BaseDeviceFingerprint): Promise<DeviceFingerprint> => {
    // Return base immediately if possible, or do advanced in background
    const webgl = advancedSecurity.getWebGLFingerprint();
    // Skip audio for standard flow to maintain "lightning fast" speed
    return { ...baseFingerprint, webgl, audio: 'optimized_skip', plugins: navigator.plugins.length };
  },

  calculateDeviceTrustScore: (fingerprint: DeviceFingerprint) => {
    let score = 100;
    const heuristics = {
      'no_webgl': -20,
      'webgl_error': -10,
      'no_audio_context': -15,
      'audio_context_error': -10,
      'Tor': -40,
      'Headless': -50,
    };

    if (fingerprint.userAgent.includes('Tor')) score += heuristics['Tor'];
    if (fingerprint.userAgent.includes('Headless')) score += heuristics['Headless'];
    if (fingerprint.webgl === 'no_webgl') score += heuristics['no_webgl'];
    if (fingerprint.webgl === 'webgl_error') score += heuristics['webgl_error'];
    if (navigator.webdriver) score -= 50;

    return Math.max(0, score);
  },

  checkForAnomalies: (currentFingerprint: DeviceFingerprint, previousFingerprint: DeviceFingerprint) => {
    if (!previousFingerprint) return [];
    const anomalies = [];
    if (currentFingerprint.timezone !== previousFingerprint.timezone) {
      anomalies.push(`Timezone changed from ${previousFingerprint.timezone} to ${currentFingerprint.timezone}`);
    }
    if (currentFingerprint.language !== previousFingerprint.language) {
      anomalies.push(`Language changed from ${previousFingerprint.language} to ${currentFingerprint.language}`);
    }
    if (currentFingerprint.platform !== previousFingerprint.platform) {
      anomalies.push(`Platform changed from ${previousFingerprint.platform} to ${currentFingerprint.platform}`);
    }
    return anomalies;
  },
  
  useBehavioralAnalysis: () => {
    const [isBehaviorNormal, setIsBehaviorNormal] = useState(true);    
    const [typingSpeed, setTypingSpeed] = useState(0);
    const lastActivity = useRef(Date.now());
    const keyPressCount = useRef(0);
    const lastKeyPressTime = useRef(Date.now());

    const handleActivity = useCallback(() => {
      const now = Date.now();
      // Only update if it's been at least 2 seconds since last update
      if (now - lastActivity.current > 2000) {
        lastActivity.current = now;
        if (!isBehaviorNormal) setIsBehaviorNormal(true);
      }
    }, [isBehaviorNormal]);

    const handleKeyDown = useCallback(() => {
      const now = Date.now();
      if (keyPressCount.current > 0) {
        setTypingSpeed(keyPressCount.current / ((now - lastKeyPressTime.current) / 1000));
      }
      keyPressCount.current += 1;
      lastKeyPressTime.current = now;
      handleActivity();
    }, [handleActivity]);

    useEffect(() => {
      window.addEventListener('mousemove', handleActivity, { passive: true });
      window.addEventListener('keydown', handleActivity, { passive: true });
      window.addEventListener('scroll', handleActivity, { passive: true });

      const interval = setInterval(() => {
        if (Date.now() - lastActivity.current > 60000) { 
          if (isBehaviorNormal) {
            setIsBehaviorNormal(false);
          }
        }
      }, 10000); 

      return () => {
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('scroll', handleActivity);
        clearInterval(interval);
      };
    }, [handleActivity, handleKeyDown, isBehaviorNormal]);

    return { isBehaviorNormal, typingSpeed };
  }
};

export const securityFeatures = {
  generateDeviceFingerprint: async (): Promise<DeviceFingerprint> => {
    // CACHE FINGERPRINT TO PREVENT RE-CALCULATION
    const cached = sessionStorage.getItem('device_fingerprint');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('M', 2, 2); // Minimal fill
    }
    
    const baseFingerprint: BaseDeviceFingerprint = {
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.substring(0, 80),
      canvas: canvas.toDataURL().substring(0, 30),
      timestamp: new Date().toISOString(),
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      touchSupport: 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0,
    };

    const finalFingerprint = await advancedSecurity.enhanceDeviceFingerprint(baseFingerprint);
    sessionStorage.setItem('device_fingerprint', JSON.stringify(finalFingerprint));
    return finalFingerprint;
  },

  checkRateLimit: (email: string) => {
    // Client-side rate limiting removed (insecure). 
    // Rate limiting is now strictly enforced server-side in Netlify functions.
    return { allowed: true };
  },

  logSecurityEvent: (event: string, data: unknown) => {
    // NON-BLOCKING LOGGING - Using native fetch for Netlify compatibility
    const logData = async () => {
      try {
        const fingerprint = await securityFeatures.generateDeviceFingerprint();
        await fetch('/.netlify/functions/log-security-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            deviceFingerprint: fingerprint,
            data,
            timestamp: new Date().toISOString()
          }),
        });
      } catch (e) {
        // Silently fail to not interrupt user flow
      }
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(logData);
    } else {
      setTimeout(logData, 100);
    }
  },

  checkPasswordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { score, checks, strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong' };
  },

  // --- UNHACKABLE PROTOCOL V3 ---
  initZeroThreatShield: () => {
    // Prevent multiple initializations
    if (document.getElementById('mg-honeypot-v3')) return;

    // 1. Debugger Trap Removed for performance stability
    /*
    setInterval(() => {
      const start = performance.now();
      debugger; 
      const end = performance.now();
      if (end - start > 100) {
        securityFeatures.logSecurityEvent('PENETRATION_ATTEMPT', {
          type: 'DEBUGGER_DETECTED',
          latency: end - start
        });
      }
    }, 5000);
    */

    // 2. Honeypot Monitor
    const honeypot = document.createElement('div');
    honeypot.id = 'mg-honeypot-v3';
    honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;z-index:-1;';
    honeypot.innerHTML = '<a href="/.netlify/functions/admin-debug" tabIndex="-1" aria-hidden="true">System Debug Core</a>';
    document.body.appendChild(honeypot);

    honeypot.addEventListener('click', () => {
      securityFeatures.logSecurityEvent('HONEYPOT_CLICKED', { type: 'HIDDEN_ADMIN_ACCESS' });
      window.location.href = '/blocked';
    });
  }
};


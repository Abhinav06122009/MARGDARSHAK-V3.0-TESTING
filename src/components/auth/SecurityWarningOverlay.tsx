import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export const SecurityWarningOverlay = () => {
  const [warning, setWarning] = useState<{ type: string; ip: string } | null>(null);

  useEffect(() => {
    const handleWarning = (e: any) => {
      setWarning(e.detail);
      // Auto-hide after 10 seconds
      setTimeout(() => setWarning(null), 10000);
    };
    
    const handleBan = () => {
      // Force immediate reload to trigger GlobalSecurityGuard lockdown
      // window.location.reload(); // DEACTIVATED FOR DIAGNOSTIC RECORDING
      console.warn('🛡️ [SECURITY_BYPASS] Auto-reload suppressed for diagnostic recording.');
    };

    window.addEventListener('security-warning', handleWarning);
    window.addEventListener('security-ban', handleBan);
    return () => {
      window.removeEventListener('security-warning', handleWarning);
      window.removeEventListener('security-ban', handleBan);
    };
  }, []);

  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 100 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[99999999] w-full max-w-xl px-6"
        >
          <div className="bg-zinc-950 border-2 border-amber-500/50 rounded-[2rem] p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)] backdrop-blur-3xl overflow-hidden relative">
            {/* Warning Background Pulse */}
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
            
            <button 
              onClick={() => setWarning(null)}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-500" />
            </button>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                  UNAUTHORIZED <span className="text-amber-500">PROBE DETECTED</span>
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 font-medium">
                  Protocol <span className="text-amber-500 font-bold">VSAV_GYANTAPA</span> has flagged your session for unauthorized inspection. 
                  Your IP <span className="text-white font-bold">{warning.ip}</span> has been logged and assigned <span className="text-amber-500 font-black">STRIKE 1</span>.
                </p>
                
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Security Enforcement</span>
                  </div>
                  <p className="text-[11px] font-bold text-red-200 leading-tight">
                    THIS IS YOUR ONLY WARNING. A SECOND ATTEMPT WILL TRIGGER A PERMANENT HARDWARE AND IP BAN FROM THIS PLATFORM.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-amber-500/30 w-full">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-full bg-amber-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

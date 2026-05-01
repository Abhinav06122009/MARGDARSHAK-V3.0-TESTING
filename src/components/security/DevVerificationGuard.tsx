import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Key, Fingerprint, Lock, ShieldCheck, Cpu } from 'lucide-react';

const DevVerificationGuard = () => {
  const [show, setShow] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  // The secret developer bypass key - in a real app, this would be validated server-side
  const DEV_SECRET = 'GYANTAPA_2026_ADMIN'; 

  useEffect(() => {
    const handleRequired = () => setShow(true);
    window.addEventListener('dev-verification-required', handleRequired);
    return () => window.removeEventListener('dev-verification-required', handleRequired);
  }, []);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(false);

    // Artificial delay for cinematic effect
    await new Promise(r => setTimeout(r, 1500));

    if (pin.toUpperCase() === DEV_SECRET) {
      setSuccess(true);
      setTimeout(() => {
        sessionStorage.setItem('mg_dev_verified', 'true');
        setShow(false);
      }, 1000);
    } else {
      setError(true);
      setIsVerifying(false);
      setPin('');
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#020202] backdrop-blur-3xl p-6"
      >
        {/* Background Tech Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          className="relative w-full max-w-md p-10 rounded-[3rem] bg-zinc-950/80 border border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden"
        >
          {/* Animated Scan Line */}
          <motion.div
            animate={{ y: [0, 400, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-8 p-6 rounded-full bg-emerald-500/5 border border-emerald-500/20">
              {success ? (
                <ShieldCheck className="w-16 h-16 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-16 h-16 text-emerald-500 animate-pulse" />
              )}
            </div>

            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
              Developer <span className="text-emerald-500">2-Step Verify</span>
            </h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Protocol: VSAV_GYANTAPA_IDENTITY_GUARD
            </p>

            <div className="w-full space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="ENTER ACCESS TOKEN..."
                  disabled={isVerifying || success}
                  className={`w-full h-16 bg-black border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl px-16 text-white font-black tracking-[0.5em] placeholder:text-zinc-800 focus:outline-none focus:border-emerald-500/50 transition-all text-center uppercase`}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-[9px] font-black uppercase tracking-widest"
                >
                  INVALID TOKEN. TRACING ATTEMPT...
                </motion.div>
              )}

              <button
                onClick={handleVerify}
                disabled={isVerifying || success || !pin}
                className="relative w-full h-16 group overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-0 transition-all duration-500 ${success ? 'bg-emerald-500' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'}`} />
                <div className="relative flex items-center justify-center gap-4 text-white font-black uppercase tracking-[0.4em] text-xs">
                  {isVerifying ? (
                    <>
                      <Cpu className="w-5 h-5 animate-spin" />
                      <span>Validating_Identity...</span>
                    </>
                  ) : success ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Access_Granted</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Commit_Verification</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6">
               <div className="flex flex-col items-center">
                 <Fingerprint className="w-4 h-4 text-zinc-700 mb-2" />
                 <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Biometric_Ready</span>
               </div>
               <div className="w-px h-8 bg-white/5" />
               <div className="flex flex-col items-center">
                 <Lock className="w-4 h-4 text-zinc-700 mb-2" />
                 <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest">Quantum_Encrypted</span>
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DevVerificationGuard;

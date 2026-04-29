import React, { useEffect, useState, useCallback } from 'react';
import { Fingerprint, KeyRound, Plus, Trash2, ShieldCheck, Loader2, Smartphone, ExternalLink, AlertTriangle, Bluetooth } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk } from '@clerk/react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";

const Passkeys: React.FC<{ userId: string; userEmail: string; fullName: string }> = () => {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);
  const [supported, setSupported] = useState(true);
  const [secureContext, setSecureContext] = useState(true);
  const [inIframe, setInIframe] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok =
      typeof window.PublicKeyCredential !== 'undefined' &&
      typeof navigator.credentials?.create === 'function';
    setSupported(ok);
    setSecureContext(window.isSecureContext === true);

    let framed = false;
    try { framed = window.top !== window.self; } catch { framed = true; }
    setInIframe(framed);
  }, []);

  const openInNewTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      /* ignore */
    }
  };

  const registerPasskey = async () => {
    if (!user || !supported || !secureContext || inIframe) return;
    setRegistering(true);
    try {
      await user.createPasskey();
      toast({ 
        title: 'BIO-METRIC ENROLLED', 
        description: 'New passkey registered successfully in Clerk.',
        className: "bg-zinc-900 border-emerald-500/50 text-emerald-400"
      });
    } catch (err: any) {
      console.error('Passkey error:', err);
      const isVerificationError = err.message?.toLowerCase().includes('verification') || err.errors?.[0]?.code === 'session_step_up_required';
      
      toast({ 
        title: isVerificationError ? 'SECURITY CHECK REQUIRED' : 'ENROLMENT FAILED', 
        description: isVerificationError 
          ? 'For your security, please verify your identity before registering a new passkey.' 
          : err.message || 'Verification failed.', 
        variant: 'destructive',
        action: isVerificationError ? (
          <ToastAction 
            altText="Verify Now" 
            onClick={() => openUserProfile({ label: 'security' })}
            className="bg-cyan-500 hover:bg-cyan-600 text-black border-none font-black text-[10px] uppercase tracking-widest"
          >
            Verify Now
          </ToastAction>
        ) : undefined
      });
    } finally {
      setRegistering(false);
    }
  };

  const removePasskey = async (passkeyId: string) => {
    if (!user) return;
    try {
      const pk = user.passkeys.find(p => p.id === passkeyId);
      if (pk) {
        await pk.delete();
        toast({ 
          title: 'KEY REVOKED', 
          description: 'Bio-metric token purged.',
          className: "bg-zinc-900 border-red-500/50 text-red-400"
        });
      }
    } catch (err: any) {
      toast({ 
        title: 'REVOCATION FAILED', 
        description: err.message, 
        variant: 'destructive' 
      });
    }
  };

  if (!isLoaded) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
      <div className="w-12 h-12 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Querying_Vault</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-2xl"
    >
      {/* HUD Layers: Standardized */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] animate-scanline pointer-events-none opacity-20" />

      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
        <Fingerprint size={140} />
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <Fingerprint className="text-cyan-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight italic uppercase leading-none">Bio-Metrics</h2>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">Hardware-Layer Protection</p>
            </div>
          </div>
          <p className="text-sm text-white/40 leading-relaxed font-medium">
            Deploy cryptographic tokens for password-less node access. Your biometric data is
            retained within your hardware secure enclave and never broadcasted to our clusters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {inIframe && (
            <button
              onClick={openInNewTab}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-white/40 font-black uppercase tracking-[0.2em] text-[10px] border border-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              <ExternalLink size={16} />
              Open_Tab
            </button>
          )}
          <button
            onClick={registerPasskey}
            disabled={!supported || !secureContext || inIframe || registering}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4.5 rounded-[1.5rem] bg-cyan-500 text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-cyan-400 transition-all shadow-[0_15px_30px_-10px_rgba(6,182,212,0.4)] disabled:opacity-20 active:scale-95"
          >
            {registering ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {registering ? 'SYNCING...' : 'ENROLL_KEY'}
          </button>
        </div>
      </div>

      {!supported && (
        <div className="mb-8 px-6 py-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-4 font-bold uppercase tracking-wider">
          <AlertTriangle size={18} className="flex-shrink-0" />
          Legacy Browser Environment: Protocol Disabled
        </div>
      )}

      {user?.passkeys.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group/empty">
          <div className="absolute inset-0 bg-cyan-500/[0.01] group-hover/empty:bg-cyan-500/[0.03] transition-colors" />
          <ShieldCheck className="w-16 h-16 text-white/5 mb-6 group-hover/empty:scale-110 transition-transform duration-700" />
          <h4 className="text-white/40 font-black uppercase tracking-[0.4em] text-xs mb-2">Vault_Empty</h4>
          <p className="text-white/10 text-[10px] uppercase tracking-tighter">No active hardware credentials detected for this node.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <AnimatePresence mode="popLayout">
            {user?.passkeys.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex items-center gap-6 p-7 rounded-[2rem] bg-black/40 border border-white/5 group/key hover:border-cyan-500/30 transition-all shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent opacity-0 group-hover/key:opacity-100 transition-opacity" />
                <div className="p-4 bg-cyan-500/10 rounded-2xl group-hover/key:bg-cyan-500/20 transition-colors border border-cyan-500/20 relative z-10">
                  <Smartphone className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="text-white font-black uppercase tracking-tight truncate mb-1">{p.name || 'Hardware Key'}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] truncate">
                      Synced: {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removePasskey(p.id)}
                  className="p-3.5 rounded-xl text-white/5 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90 relative z-10"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Passkeys;

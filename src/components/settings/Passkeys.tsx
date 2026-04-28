import React, { useEffect, useState, useCallback } from 'react';
import { Fingerprint, KeyRound, Plus, Trash2, ShieldCheck, Loader2, Smartphone, ExternalLink, AlertTriangle, Bluetooth } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoredPasskey {
  id: string;
  credentialId: string;
  deviceName: string;
  createdAt: string;
  transports?: string[];
  platform?: string;
}

const bufToBase64Url = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlToBuf = (s: string): Uint8Array => {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
  const bin = atob(norm + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const randomChallenge = (): Uint8Array => {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
};

const guessDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android device';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Linux/i.test(ua)) return 'Linux device';
  return 'This device';
};

interface PasskeysProps {
  userId: string;
  userEmail: string;
  fullName: string;
}

const Passkeys: React.FC<PasskeysProps> = ({ userId, userEmail, fullName }) => {
  const { toast } = useToast();
  const [passkeys, setPasskeys] = useState<StoredPasskey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [supported, setSupported] = useState(true);
  const [secureContext, setSecureContext] = useState(true);
  const [inIframe, setInIframe] = useState(false);
  const [platformAuth, setPlatformAuth] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      const stored = (user?.user_metadata?.passkeys as StoredPasskey[] | undefined) || [];
      setPasskeys(stored);
    } catch (e) {
      console.error('Failed to load passkeys:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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

    if (ok && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setPlatformAuth)
        .catch(() => setPlatformAuth(false));
    }
    refresh();
  }, [refresh]);

  const openInNewTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      /* ignore */
    }
  };

  const registerPasskey = async () => {
    if (!supported || !secureContext || inIframe) return;
    setRegistering(true);
    try {
      const challenge = randomChallenge();
      const userIdBytes = new TextEncoder().encode(userId);
      const excludeCredentials = passkeys.map(p => ({
        id: base64UrlToBuf(p.credentialId),
        type: 'public-key' as const,
        transports: (p.transports || ['internal', 'hybrid']) as AuthenticatorTransport[],
      }));

      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: 'MARGDARSHAK', id: window.location.hostname },
        user: { id: userIdBytes, name: userEmail, displayName: fullName || userEmail },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
        timeout: 90_000,
        attestation: 'none',
        excludeCredentials,
      };

      const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
      if (!cred) throw new Error('Handshake failed');

      const credentialId = bufToBase64Url(cred.rawId);
      let transports: string[] = [];
      const resp = cred.response as AuthenticatorAttestationResponse;
      if (typeof resp.getTransports === 'function') {
        try { transports = resp.getTransports(); } catch { /* ignore */ }
      }
      if (transports.length === 0) transports = ['internal'];

      const newKey: StoredPasskey = {
         id: crypto.randomUUID(),
         credentialId,
         deviceName: guessDeviceName(),
         createdAt: new Date().toISOString(),
         transports,
         platform: navigator.platform || 'unknown',
      };

      const { data: { user: latest } } = await supabase.auth.getUser();
      const existing = (latest?.user_metadata?.passkeys as StoredPasskey[] | undefined) || [];

      if (!existing.some(p => p.credentialId === credentialId)) {
        const updated = [...existing, newKey];
        const { error: updErr } = await supabase.auth.updateUser({ data: { passkeys: updated } });
        if (updErr) throw updErr;
        toast({ title: 'BIO-METRIC ENROLLED', description: `${newKey.deviceName} synced.` });
      }

      await refresh();
    } catch (err: any) {
      toast({ title: 'ENROLMENT FAILED', description: err?.message, variant: 'destructive' });
    } finally {
      setRegistering(false);
    }
  };

  const removePasskey = async (id: string) => {
    try {
      const { data: { user: latest } } = await supabase.auth.getUser();
      const existing = (latest?.user_metadata?.passkeys as StoredPasskey[] | undefined) || [];
      const updated = existing.filter(p => p.id !== id);
      const { error } = await supabase.auth.updateUser({ data: { passkeys: updated } });
      if (error) throw error;
      toast({ title: 'KEY REVOKED', description: 'Bio-metric token purged.' });
      await refresh();
    } catch (err: any) {
      toast({ title: 'REVOCATION FAILED', description: err?.message, variant: 'destructive' });
    }
  };

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

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
          <div className="w-12 h-12 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Querying_Vault</span>
        </div>
      ) : passkeys.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group/empty">
          <div className="absolute inset-0 bg-cyan-500/[0.01] group-hover/empty:bg-cyan-500/[0.03] transition-colors" />
          <ShieldCheck className="w-16 h-16 text-white/5 mb-6 group-hover/empty:scale-110 transition-transform duration-700" />
          <h4 className="text-white/40 font-black uppercase tracking-[0.4em] text-xs mb-2">Vault_Empty</h4>
          <p className="text-white/10 text-[10px] uppercase tracking-tighter">No active hardware credentials detected for this node.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <AnimatePresence mode="popLayout">
            {passkeys.map(p => (
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
                  {p.transports?.includes('internal') ? <Smartphone className="w-6 h-6 text-cyan-400" /> : <Bluetooth className="w-6 h-6 text-cyan-400" />}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="text-white font-black uppercase tracking-tight truncate mb-1">{p.deviceName}</div>
                  <div className="flex items-center gap-2">
                     <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_5px_#06b6d4]" />
                     <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] truncate">
                       Last_Sync: {new Date(p.createdAt).toLocaleDateString()}
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

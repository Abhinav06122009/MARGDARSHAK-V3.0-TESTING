import React, { useEffect, useState, useCallback } from 'react';
import { Fingerprint, KeyRound, Plus, Trash2, ShieldCheck, Loader2, Smartphone, ExternalLink, AlertTriangle, Zap, Bluetooth, Nfc } from 'lucide-react';
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
    if (!supported) {
      toast({ title: 'Not supported', description: 'This browser does not support passkeys.', variant: 'destructive' });
      return;
    }
    if (!secureContext) {
      toast({ title: 'Insecure connection', description: 'Passkeys require HTTPS. Open the site in a secure tab.', variant: 'destructive' });
      return;
    }
    if (inIframe) {
      toast({
        title: 'Open in a new tab',
        description: 'Passkey setup is blocked inside embedded previews. Click "Open in a new tab" to continue.',
        variant: 'destructive',
      });
      return;
    }

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
        rp: {
          name: 'MARGDARSHAK',
          id: window.location.hostname,
        },
        user: {
          id: userIdBytes,
          name: userEmail,
          displayName: fullName || userEmail,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        timeout: 90_000,
        attestation: 'none',
        excludeCredentials,
      };

      const cred = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
      if (!cred) throw new Error('No credential returned');

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

      if (existing.some(p => p.credentialId === credentialId)) {
        toast({ title: 'Already registered', description: 'This passkey is already saved on your account.' });
      } else {
        const updated = [...existing, newKey];
        const { error: updErr } = await supabase.auth.updateUser({ data: { passkeys: updated } });
        if (updErr) throw updErr;
        toast({
          title: 'Bio-Metric Synced',
          description: `${newKey.deviceName} has been enrolled in your security profile.`,
        });
      }

      await refresh();
    } catch (err: any) {
      const name = err?.name || '';
      let description = err?.message || 'Could not create passkey.';
      if (name === 'NotAllowedError') {
        description = inIframe
          ? 'Passkey creation is blocked inside embedded previews. Open the site in a new tab and try again.'
          : 'Enrolment cancelled by user.';
      } else if (name === 'InvalidStateError') {
        description = 'This device already has a passkey registered for this account.';
      }
      toast({ title: 'Enrolment Failed', description, variant: 'destructive' });
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
      toast({ title: 'Credential Revoked', description: 'The bio-metric key has been removed.' });
      await refresh();
    } catch (err: any) {
      toast({ title: 'Revocation Failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const canAdd = supported && secureContext && !inIframe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 md:col-span-2 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
         <Fingerprint size={140} />
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
        <div className="max-w-xl">
           <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-cyan-500/10 rounded-2xl">
                 <Fingerprint className="text-cyan-400" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tight italic uppercase leading-none">Bio-Metrics</h2>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Passkey Infrastructure</p>
              </div>
           </div>
           <p className="text-sm text-white/40 leading-relaxed">
             Deploy cryptographic passkeys for password-less authentication. Your biometric data is 
             stored locally on your hardware and never transmitted to our nodes.
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {inIframe && (
            <button
              onClick={openInNewTab}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              <ExternalLink size={16} />
              Open Nexus Tab
            </button>
          )}
          <button
            onClick={registerPasskey}
            disabled={!canAdd || registering}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/10 disabled:opacity-30 active:scale-95"
          >
            {registering ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {registering ? 'Authorizing...' : 'Enroll Key'}
          </button>
        </div>
      </div>

      {!supported && (
        <div className="mb-6 px-6 py-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-4">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span className="font-bold uppercase tracking-wider">Legacy Browser Detected: Passkeys unavailable.</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scanning Vault</span>
        </div>
      ) : passkeys.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
          <ShieldCheck className="w-16 h-16 text-white/5 mb-4" />
          <h4 className="text-white/60 font-black uppercase tracking-widest text-sm mb-1">No Active Credentials</h4>
          <p className="text-white/20 text-xs uppercase tracking-tighter">Register your first hardware key to secure your node.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {passkeys.map(p => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-6 p-6 rounded-[1.75rem] bg-black/40 border border-white/5 group/key hover:border-cyan-500/30 transition-all shadow-xl"
              >
                <div className="p-4 bg-cyan-500/10 rounded-2xl group-hover/key:bg-cyan-500/20 transition-colors">
                  {p.transports?.includes('internal') ? (
                    <Smartphone className="w-6 h-6 text-cyan-400" />
                  ) : (
                    <Bluetooth className="w-6 h-6 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-black uppercase tracking-tight truncate">{p.deviceName}</div>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                     <span className="text-[9px] font-black text-white/30 uppercase tracking-widest truncate">
                       Synced: {new Date(p.createdAt).toLocaleDateString()}
                     </span>
                  </div>
                </div>
                <button
                  onClick={() => removePasskey(p.id)}
                  className="p-3 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90"
                  aria-label="Revoke"
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

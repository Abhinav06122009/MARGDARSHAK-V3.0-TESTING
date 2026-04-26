import React, { useEffect, useState, useCallback } from 'react';
import { Fingerprint, KeyRound, Plus, Trash2, ShieldCheck, Loader2, Smartphone, ExternalLink, AlertTriangle } from 'lucide-react';
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
          // Use the current origin's hostname so it matches automatically across
          // production, preview deployments, and localhost.
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
          // Allow either built-in (Touch ID, Windows Hello) or roaming (security
          // key, phone via QR) so users on desktops without biometrics can still
          // register.
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
          title: 'Passkey created',
          description: `${newKey.deviceName} can now be used to sign in to this device.`,
          className: 'bg-gray-900/50 backdrop-blur-md border border-emerald-500/60 shadow-lg rounded-xl p-4 text-emerald-300 font-semibold',
        });
      }

      await refresh();
    } catch (err: any) {
      const name = err?.name || '';
      let description = err?.message || 'Could not create passkey.';
      if (name === 'NotAllowedError') {
        description = inIframe
          ? 'Passkey creation is blocked inside embedded previews. Open the site in a new tab and try again.'
          : 'You cancelled the prompt or it timed out. Please try again and confirm with your device.';
      } else if (name === 'InvalidStateError') {
        description = 'This device already has a passkey registered for this account.';
      } else if (name === 'SecurityError') {
        description = 'Passkeys require a secure (HTTPS) connection on a top-level page.';
      } else if (name === 'NotSupportedError') {
        description = 'No compatible authenticator was found on this device.';
      }
      toast({ title: 'Passkey setup failed', description, variant: 'destructive' });
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
      toast({ title: 'Passkey removed', description: 'The passkey has been removed from your account.' });
      await refresh();
    } catch (err: any) {
      toast({ title: 'Could not remove passkey', description: err?.message || 'Please try again.', variant: 'destructive' });
    }
  };

  const canAdd = supported && secureContext && !inIframe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 md:col-span-2"
    >
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Fingerprint className="text-cyan-400" />
            Passkeys
          </h2>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Use your device's fingerprint, face, PIN, or a security key to sign in without a password.
            Passkeys are tied to your device and never leave it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {inIframe && (
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              title="Open this page in a new browser tab"
            >
              <ExternalLink size={18} />
              Open in a new tab
            </button>
          )}
          <button
            onClick={registerPasskey}
            disabled={!canAdd || registering}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registering ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {registering ? 'Waiting for device...' : 'Add a passkey'}
          </button>
        </div>
      </div>

      {!supported && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <span>Your current browser does not support passkeys. Try a recent version of Chrome, Safari, Edge, or Firefox.</span>
        </div>
      )}

      {supported && !secureContext && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <span>Passkeys require an HTTPS (secure) connection. Open the site over HTTPS and reload.</span>
        </div>
      )}

      {supported && secureContext && inIframe && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <span>
            Browsers block passkey creation inside embedded previews. Click <strong>Open in a new tab</strong> above,
            sign in there, and add your passkey from the Settings page.
          </span>
        </div>
      )}

      {supported && secureContext && !inIframe && platformAuth === false && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
          <span>No built-in fingerprint, face, or PIN was detected. You can still create a passkey using a security key or your phone via QR code.</span>
        </div>
      )}

      {loading ? (
        <div className="py-10 flex items-center justify-center text-white/50 text-sm gap-2">
          <Loader2 className="animate-spin" size={16} />
          Loading your passkeys...
        </div>
      ) : passkeys.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-cyan-400/70 mx-auto mb-2" />
          <p className="text-white/80 font-semibold">No passkeys yet</p>
          <p className="text-white/50 text-sm mt-1">
            Add one to sign in faster on this device next time.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {passkeys.map(p => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-black/30 border border-white/10"
              >
                <div className="p-2.5 bg-cyan-500/15 rounded-xl">
                  {p.transports?.includes('internal') ? (
                    <Smartphone className="w-5 h-5 text-cyan-300" />
                  ) : (
                    <KeyRound className="w-5 h-5 text-cyan-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{p.deviceName}</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    Added {new Date(p.createdAt).toLocaleString()}
                    {p.transports && p.transports.length > 0 && (
                      <span> · {p.transports.join(', ')}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removePasskey(p.id)}
                  className="p-2 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove passkey"
                  title="Remove passkey"
                >
                  <Trash2 size={18} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
};

export default Passkeys;

import React, { useState, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
}

interface AdvisorReport {
  score: number;
  summary: string;
  recommendations: Recommendation[];
}

interface SecurityAdvisorProps {
  userId: string;
  userEmail: string;
  passkeyCount: number;
  hasFullName: boolean;
}

const tryParseJson = (text: string): AdvisorReport | null => {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* fall through */ }
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.substring(start, end + 1)); } catch { /* fall through */ }
  }
  return null;
};

const severityColor = (s: Recommendation['severity']) => {
  switch (s) {
    case 'critical': return 'border-red-500/40 bg-red-500/10 text-red-200';
    case 'high':     return 'border-orange-500/40 bg-orange-500/10 text-orange-200';
    case 'medium':   return 'border-amber-500/40 bg-amber-500/10 text-amber-200';
    default:         return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
  }
};

const severityRank: Record<Recommendation['severity'], number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

const SecurityAdvisor: React.FC<SecurityAdvisorProps> = ({
  userId, userEmail, passkeyCount, hasFullName,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AdvisorReport | null>(null);

  const buildSnapshot = useCallback(() => {
    let inIframe = false;
    try { inIframe = window.top !== window.self; } catch { inIframe = true; }
    return {
      account: {
        userIdHash: userId.slice(0, 8) + '...', // never send full UUID
        emailDomain: userEmail.split('@')[1] || 'unknown',
        hasFullName,
        passkeyCount,
      },
      browser: {
        userAgent: navigator.userAgent.slice(0, 200),
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        secureContext: window.isSecureContext,
        inIframe,
        webAuthnSupported: typeof window.PublicKeyCredential !== 'undefined',
        platform: navigator.platform,
      },
      protections: {
        usesPasskey: passkeyCount > 0,
        passwordOnly: passkeyCount === 0,
        httpsOnly: location.protocol === 'https:',
      },
      app: {
        protocol: location.protocol,
        host: location.hostname,
      },
    };
  }, [userId, userEmail, passkeyCount, hasFullName]);

  const runAudit = useCallback(async () => {
    setLoading(true);
    try {
      const { authedFetch, readErrorMessage } = await import('@/lib/ai/authedFetch');
      const res = await authedFetch('/api/security-advisor', {
        method: 'POST',
        body: JSON.stringify({ snapshot: buildSnapshot() }),
      });
      if (!res.ok) throw new Error(await readErrorMessage(res));
      const data = await res.json().catch(() => ({}));
      const parsed = tryParseJson(typeof data?.raw === 'string' ? data.raw : '');
      if (!parsed || !Array.isArray(parsed.recommendations)) {
        throw new Error('Could not parse advisor response. Please try again.');
      }
      parsed.recommendations.sort(
        (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
      );
      setReport(parsed);
    } catch (err: any) {
      toast({
        title: 'Advisor unavailable',
        description: err?.message || 'Could not run a security audit right now.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [buildSnapshot, toast]);

  const score = report?.score ?? null;
  const scoreColor = score === null
    ? 'text-white/60'
    : score >= 80 ? 'text-emerald-400'
    : score >= 60 ? 'text-amber-400'
    : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/10 md:col-span-2"
    >
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-fuchsia-400" />
            AI Security Advisor
          </h2>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            NVIDIA Nemotron 3 inspects your account and browser settings, then suggests prioritized
            steps to harden your security. No personal content is sent — only configuration flags.
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-500 text-white font-semibold hover:bg-fuchsia-400 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {loading ? 'Auditing...' : report ? 'Re-run audit' : 'Run security audit'}
        </button>
      </div>

      {!report && !loading && (
        <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-fuchsia-400/70 mx-auto mb-2" />
          <p className="text-white/80 font-semibold">Ready when you are</p>
          <p className="text-white/50 text-sm mt-1">Run an audit to get personalised recommendations.</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-black/30 border border-white/10">
            <div className={`text-4xl font-black ${scoreColor}`}>{score}</div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-white/40 mb-0.5">Security score</div>
              <div className="text-sm text-white/80">{report.summary}</div>
            </div>
          </div>

          {report.recommendations.length === 0 ? (
            <div className="px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-sm">
              You're all set — no actions recommended right now.
            </div>
          ) : (
            <ul className="space-y-3">
              {report.recommendations.map((r, i) => (
                <li key={i} className={`px-4 py-3 rounded-xl border ${severityColor(r.severity)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert size={16} />
                    <span className="font-semibold">{r.title}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider opacity-80">{r.severity}</span>
                  </div>
                  <p className="text-sm opacity-90">{r.description}</p>
                  {r.action && (
                    <p className="text-xs mt-1 opacity-80"><strong>Next step:</strong> {r.action}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SecurityAdvisor;

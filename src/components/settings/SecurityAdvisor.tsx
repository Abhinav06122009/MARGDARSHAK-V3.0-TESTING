import React, { useState, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, Sparkles, Brain, Zap, Target } from 'lucide-react';
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
    case 'critical': return 'border-red-500/30 bg-red-500/5 text-red-400';
    case 'high':     return 'border-orange-500/30 bg-orange-500/5 text-orange-400';
    case 'medium':   return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
    default:         return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
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
        userIdHash: userId.slice(0, 8) + '...',
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
        throw new Error('Incomplete data stream.');
      }
      parsed.recommendations.sort(
        (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
      );
      setReport(parsed);
      toast({ title: 'Audit Complete', description: 'AI has finalized your security report.' });
    } catch (err: any) {
      toast({ title: 'Advisor Offline', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [buildSnapshot, toast]);

  const score = report?.score ?? null;
  const scoreColor = score === null
    ? 'text-white/20'
    : score >= 80 ? 'text-emerald-400'
    : score >= 60 ? 'text-amber-400'
    : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 md:col-span-2 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
         <Brain size={140} />
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
        <div className="max-w-xl">
           <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-fuchsia-500/10 rounded-2xl">
                 <Sparkles className="text-fuchsia-400" />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tight italic uppercase leading-none">AI Intelligence</h2>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">NVIDIA-Powered Security Audit</p>
              </div>
           </div>
           <p className="text-sm text-white/40 leading-relaxed">
             Deploy an AI agent to scan your system configuration. Our proprietary model analyzes 
             authentication entropy and browser integrity to provide real-time hardening steps.
           </p>
        </div>
        
        <button
          onClick={runAudit}
          disabled={loading}
          className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-fuchsia-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-fuchsia-400 transition-all shadow-xl shadow-fuchsia-500/10 disabled:opacity-30 active:scale-95"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {loading ? 'Analyzing...' : 'Execute Audit'}
        </button>
      </div>

      {!report && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
          <Target className="w-16 h-16 text-white/5 mb-4" />
          <h4 className="text-white/60 font-black uppercase tracking-widest text-sm mb-1">Awaiting Instruction</h4>
          <p className="text-white/20 text-xs uppercase tracking-tighter">Trigger a scan to identify security vulnerabilities.</p>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-black/40 border border-white/5">
            <div className={`text-5xl font-black ${scoreColor} drop-shadow-2xl`}>{score}</div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-1 font-black">Integrity Index</div>
              <div className="text-sm text-white/60 font-medium leading-relaxed italic">"{report.summary}"</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {report.recommendations.map((r, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-[1.75rem] border ${severityColor(r.severity)} group/rec relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <ShieldAlert size={40} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10">{r.severity}</span>
                  <h5 className="font-black text-white uppercase tracking-tight truncate">{r.title}</h5>
                </div>
                <p className="text-sm opacity-60 leading-relaxed mb-4">{r.description}</p>
                {r.action && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                    <Zap size={12} />
                    <span>Protocol: {r.action}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SecurityAdvisor;

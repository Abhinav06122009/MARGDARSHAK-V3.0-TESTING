import React, { useState, useCallback } from 'react';
import { ShieldAlert, ShieldCheck, Loader2, RefreshCw, Sparkles, Brain, Zap, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
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
  try { return JSON.parse(text); } catch { /* ignore */ }
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try { return JSON.parse(fence[1].trim()); } catch { /* ignore */ }
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.substring(start, end + 1)); } catch { /* ignore */ }
  }
  return null;
};

const severityColor = (s: Recommendation['severity']) => {
  switch (s) {
    case 'critical': return 'border-red-500/30 bg-red-500/10 text-red-400';
    case 'high':     return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
    case 'medium':   return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    default:         return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
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
        throw new Error('Data fragmentation detected');
      }
      parsed.recommendations.sort(
        (a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9),
      );
      setReport(parsed);
      toast({ title: 'ANALYSIS_COMPLETE', description: 'AI has finalized security report.' });
    } catch (err: any) {
      toast({ title: 'AUDIT_FAILED', description: err?.message, variant: 'destructive' });
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
      className="bg-zinc-950/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-2xl"
    >
      {/* HUD Layers: Standardized */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/5 to-transparent h-[200%] animate-scanline pointer-events-none opacity-20" />

      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
         <Brain size={140} />
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12 relative z-10">
        <div className="max-w-2xl">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-fuchsia-500/10 rounded-2xl border border-fuchsia-500/20">
                 <Sparkles className="text-fuchsia-400" size={24} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tight italic uppercase leading-none">Intelligence</h2>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-2">NVIDIA_Protocol_Audit</p>
              </div>
           </div>
           <p className="text-sm text-white/40 leading-relaxed font-medium">
             Deploy an AI agent to scan node configuration. Our neural model analyzes 
             authentication entropy and environmental vectors to provide real-time hardening.
           </p>
        </div>
        
        <button
          onClick={runAudit}
          disabled={loading}
          className="w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-4.5 rounded-[1.5rem] bg-fuchsia-500 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-fuchsia-400 transition-all shadow-[0_15px_30px_-10px_rgba(217,70,239,0.4)] disabled:opacity-20 active:scale-95"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {loading ? 'ANALYZING...' : 'EXECUTE_AUDIT'}
        </button>
      </div>

      {!report && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center relative group/empty overflow-hidden">
          <div className="absolute inset-0 bg-fuchsia-500/[0.01] group-hover/empty:bg-fuchsia-500/[0.03] transition-colors" />
          <Target className="w-16 h-16 text-white/5 mb-6 group-hover/empty:scale-110 transition-transform duration-700" />
          <h4 className="text-white/40 font-black uppercase tracking-[0.4em] text-xs mb-2">Awaiting_Instruction</h4>
          <p className="text-white/10 text-[10px] uppercase tracking-tighter">Trigger scan to identify potential data-stream vulnerabilities.</p>
        </div>
      )}

      {report && (
        <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden group/score">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/[0.02] to-transparent opacity-0 group-hover/score:opacity-100 transition-opacity" />
            <div className={`text-6xl font-black ${scoreColor} drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10`}>{score}</div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <Activity size={12} className="text-white/20 animate-pulse" />
                 <div className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black">Integrity_Coefficient</div>
              </div>
              <div className="text-sm text-white/50 font-medium leading-relaxed italic">"{report.summary}"</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.recommendations.map((r, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-7 rounded-[2rem] border ${severityColor(r.severity)} group/rec relative overflow-hidden shadow-xl hover:scale-[1.02] transition-all`}
              >
                <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                   <ShieldAlert size={60} />
                </div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/10 border border-white/5">{r.severity}</span>
                  <h5 className="font-black text-white uppercase tracking-tight truncate leading-none">{r.title}</h5>
                </div>
                <p className="text-[13px] opacity-40 leading-relaxed mb-6 font-medium relative z-10">{r.description}</p>
                {r.action && (
                  <div className="flex items-center gap-3 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 relative z-10 shadow-inner group-hover:bg-emerald-500/10 transition-colors">
                    <Zap size={14} className="animate-pulse" />
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

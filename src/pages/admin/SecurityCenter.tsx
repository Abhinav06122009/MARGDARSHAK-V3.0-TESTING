import AdminLayout from '@/components/admin/AdminLayout';
import ThreatCard from '@/components/admin/ThreatCard';
import SecurityEventsPanel from '@/components/admin/SecurityEventsPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { SecurityBadge } from '@/components/security/SecurityBadge';
import { Shield, Radar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SecurityCenter = () => {
  const { threats, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
              <Shield className="w-8 h-8 text-red-500" /> Security Center
            </h2>
            <p className="text-sm font-bold text-zinc-500 tracking-wide mt-2">Monitor security events and system activity.</p>
          </div>
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-2xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">System Secure</span>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <Radar className="w-6 h-6 text-red-500" /> Live Threat Feed
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Real-time security activity monitoring.</p>
            </div>
            {threats[0] && (
              <div className="scale-110">
                <SecurityBadge
                  score={threats[0]?.threat_score}
                  level={['low', 'medium', 'high', 'critical'].includes(threats[0]?.threat_level || '')
                    ? (threats[0]?.threat_level as 'low' | 'medium' | 'high' | 'critical')
                    : 'low'}
                />
              </div>
            )}
          </div>
          
          <div className="mt-4 grid gap-6 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-4 bg-white/5 rounded-3xl border border-white/5">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Updating Security Status...</p>
              </div>
            ) : threats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5 text-sm font-bold text-emerald-500 tracking-wide text-center">
                <Shield className="w-10 h-10 mb-4 opacity-50" />
                No threats detected.<br/>Monitoring active.
              </div>
            ) : (
              threats.map((threat, index) => (
                <motion.div key={threat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                  <ThreatCard
                    title={threat.event_type.replace(/_/g, ' ')}
                    level={threat.threat_level}
                    score={threat.threat_score}
                    summary={threat.summary}
                    ip={threat.ip_address}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ── Audit Log (Fraud Prevention) ── */}
        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <SecurityEventsPanel />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecurityCenter;

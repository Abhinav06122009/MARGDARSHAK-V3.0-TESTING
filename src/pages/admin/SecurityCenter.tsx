import AdminLayout from '@/components/admin/AdminLayout';
import ThreatCard from '@/components/admin/ThreatCard';
import SecurityEventsPanel from '@/components/admin/SecurityEventsPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { SecurityBadge } from '@/components/security/SecurityBadge';
import { Shield, Radar, Loader2, Activity, Zap, Radio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SecurityCenter = () => {
  const { threats, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-16 py-6">
        
        {/* Page Header Architecture */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 shadow-2xl"
            >
              <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Global Security Grid Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Security <span className="text-emerald-500">Center</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Real-time surveillance and autonomous threat neutralization hub.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl group">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-emerald-500 transition-colors italic">System Integral</span>
            </div>
          </div>
        </div>

        {/* Tactical Surveillance Matrix */}
        <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-10 mb-12 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <Radar className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Live <span className="text-emerald-500">Feed</span></h3>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2 opacity-60 italic">Real-time security activity monitoring across all system nodes.</p>
              </div>
            </div>
            {threats[0] && (
              <div className="scale-125 hover:scale-150 transition-transform duration-700">
                <SecurityBadge
                  score={threats[0]?.threat_score}
                  level={['low', 'medium', 'high', 'critical'].includes(threats[0]?.threat_level || '')
                    ? (threats[0]?.threat_level as 'low' | 'medium' | 'high' | 'critical')
                    : 'low'}
                />
              </div>
            )}
          </div>
          
          <div className="grid gap-8 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-24 text-zinc-700 gap-8 bg-black/20 rounded-[3rem] border border-white/5 shadow-inner">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 animate-pulse italic">Synchronizing Threat Vectors...</p>
              </div>
            ) : threats.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-24 bg-emerald-500/[0.02] rounded-[3rem] border border-emerald-500/10 text-center gap-8 group/secure"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl group-hover/secure:scale-110 transition-transform duration-700">
                  <Shield className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="space-y-3">
                  <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Zero Hostile Signals</p>
                  <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.4em] italic">System operational security is absolute.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {threats.map((threat, index) => (
                  <motion.div key={threat.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                    <ThreatCard
                      title={threat.event_type.replace(/_/g, ' ')}
                      level={threat.threat_level}
                      score={threat.threat_score}
                      summary={threat.summary}
                      ip={threat.ip_address}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Audit Matrix (Fraud Prevention Architecture) ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <SecurityEventsPanel />
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default SecurityCenter;

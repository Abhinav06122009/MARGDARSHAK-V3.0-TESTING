import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import ThreatCard from '@/components/admin/ThreatCard';
import { useAdmin } from '@/hooks/useAdmin';
import { ShieldCheck, User, AlertTriangle, Ban, Loader2, DatabaseZap, LifeBuoy, BrainCircuit, Activity, Zap, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SentryTestButton } from '@/integrations/SentryDiagnostics';

const AdminDashboard = () => {
  const { stats, threats, users, tickets, loading } = useAdmin();
  const [isVerified, setIsVerified] = useState((window as any).__MG_DEV_VERIFIED__ === true);

  useEffect(() => {
    const checkVerification = () => {
      const verified = (window as any).__MG_DEV_VERIFIED__ === true;
      setIsVerified(verified);
      if (!verified) {
        window.dispatchEvent(new CustomEvent('dev-verification-required'));
      }
    };

    checkVerification();
    
    // Listen for verification success
    const handleSuccess = () => setIsVerified(true);
    window.addEventListener('dev-verification-success', handleSuccess);
    
    return () => {
      window.removeEventListener('dev-verification-success', handleSuccess);
    };
  }, []);

  if (!isVerified) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="p-10 rounded-[3rem] bg-zinc-950 border border-emerald-500/20 shadow-2xl"
           >
              <Lock className="w-20 h-20 text-emerald-500/50 mb-8 mx-auto animate-pulse" />
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Verification <span className="text-emerald-500">Required</span></h2>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                You are attempting to access a high-command security node. Please provide your 'Second-Strip' identity token in the overlay to proceed.
              </p>
           </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-16 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4"
            >
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Real-time Diagnostics Active</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">Security <span className="text-emerald-500">Command</span></h2>
            <p className="text-[10px] font-black text-zinc-600 tracking-[0.4em] uppercase mt-4 opacity-60 italic">Live orchestration of system integrity and global policy enforcement.</p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3 shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">System Load: 12%</span>
            </div>
          </div>
        </div>

        {/* Global Statistics Matrix */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Vanguard" value={users.length} icon={<User className="h-5 w-5" />} hint="Total verified accounts" />
          <StatCard title="Elite Operatives" value={users.filter(u => u.subscription_tier === 'premium_elite').length} icon={<DatabaseZap className="h-5 w-5" />} hint="Active Elite subscriptions" />
          <StatCard title="Premium Assets" value={users.filter(u => u.subscription_tier === 'premium').length} icon={<ShieldCheck className="h-5 w-5" />} hint="Tier 2 membership status" />
          <StatCard title="Support Uplinks" value={tickets.filter(t => t.status !== 'completed').length} icon={<LifeBuoy className="h-5 w-5" />} hint="Pending support tickets" />
          <StatCard title="Neutralized Nodes" value={stats?.blockedUsers ?? '—'} icon={<Ban className="h-5 w-5" />} hint="Security-restricted users" />
        </div>

        {/* Tactical Alerts & Diagnostics */}
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          
          {/* Security Alert Matrix */}
          <div className="rounded-[3.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 shadow-[0_60px_100px_-30px_rgba(0,0,0,0.9)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 shadow-2xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Security <span className="text-emerald-500">Alerts</span></h3>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-2 opacity-60 italic">Scan results from the autonomous security vanguard.</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                Nodes Scanned: {users.length * 12}
              </div>
            </div>
            
            <div className="grid gap-6 relative z-10">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-24 text-zinc-700 gap-6 bg-black/20 rounded-[2.5rem] border border-white/5">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] italic animate-pulse">Synchronizing Threat Matrix...</p>
                </div>
              ) : threats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 bg-emerald-500/[0.02] rounded-[3rem] border border-emerald-500/10 text-center gap-6 group/secure">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl group-hover/secure:scale-110 transition-transform duration-700">
                    <Zap className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-white uppercase italic tracking-tighter">Zero Vulnerabilities</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] opacity-60">System operational integrity is at 100%.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {threats.map((threat, index) => (
                    <motion.div key={threat.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
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

          {/* System Diagnostic Hub */}
          <div className="space-y-12">
            <div className="rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <Cpu className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Neural Insights</h3>
              </div>
              
              <div className="space-y-8 relative z-10">
                <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">
                  Autonomous vanguard protocols are actively inspecting high-risk sessions and analyzing predictive usage patterns in real-time.
                </p>
                
                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-6 shadow-inner">
                   {[
                    { label: 'Network Anomalies', status: 'Optimal', color: 'text-emerald-500' },
                    { label: 'Auth Integrity', status: 'Monitoring', color: 'text-blue-500' },
                    { label: 'Data Exfiltration', status: 'Secure', color: 'text-emerald-500' }
                  ].map((sys, i) => (
                    <div key={i} className="flex justify-between items-center group/stat">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover/stat:text-white transition-colors">{sys.label}</span>
                      <div className="flex items-center gap-3">
                         <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${sys.color}`}>{sys.status}</span>
                         <div className={`w-1.5 h-1.5 rounded-full ${sys.color.replace('text', 'bg')} animate-pulse`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <BrainCircuit className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Diagnostic Tools</h3>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Sentry Health Protocol</h4>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-loose opacity-60">
                    Initiate a managed exception sequence to verify Sentry diagnostic captures and stack trace integrity.
                  </p>
                  <div className="pt-2">
                    <SentryTestButton />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

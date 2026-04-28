import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import ThreatCard from '@/components/admin/ThreatCard';
import { useAdmin } from '@/hooks/useAdmin';
import { ShieldCheck, User, AlertTriangle, Ban, Loader2, DatabaseZap, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { SentryTestButton } from '@/integrations/SentryDiagnostics';

const AdminDashboard = () => {
  const { stats, threats, users, tickets, loading } = useAdmin();

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Security Overview</h2>
          <p className="text-sm font-bold text-zinc-500 tracking-wide mt-1">Live snapshot of system health and policy enforcement.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Users" value={users.length} icon={<User className="h-5 w-5" />} />
          <StatCard title="Elite Members" value={users.filter(u => u.subscription_tier === 'premium_elite').length} icon={<DatabaseZap className="h-5 w-5 text-purple-400" />} />
          <StatCard title="Premium Users" value={users.filter(u => u.subscription_tier === 'premium').length} icon={<ShieldCheck className="h-5 w-5 text-amber-400" />} />
          <StatCard title="Pending Support" value={tickets.filter(t => t.status !== 'completed').length} icon={<LifeBuoy className="h-5 w-5 text-indigo-400" />} />
          <StatCard title="Blocked Users" value={stats?.blockedUsers ?? '—'} icon={<Ban className="h-5 w-5" />} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10">
              <ShieldCheck className="w-6 h-6 text-red-500" /> Security Alerts
            </h3>
            
            <div className="mt-8 grid gap-4 relative z-10">
              {loading ? (
                <div className="flex items-center justify-center p-12 text-zinc-500 gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" /> Scanning for alerts...
                </div>
              ) : threats.length === 0 ? (
                <div className="flex items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5 text-sm font-bold text-emerald-500 tracking-wide">
                  No active risks detected. System is secure.
                </div>
              ) : (
                threats.map((threat, index) => (
                  <motion.div key={threat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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

          <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />
            <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10">
              <DatabaseZap className="w-6 h-6 text-red-500" /> Admin Insights
            </h3>
            
            <div className="mt-6 flex-1 flex flex-col justify-between relative z-10">
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                The security system is actively inspecting high-risk sessions, analyzing usage patterns, and flagging suspicious content in real-time.
              </p>
              
              <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Service Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                      {loading ? 'Initializing' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Network Anomalies', status: 'Optimal' },
                    { label: 'Auth Integrity', status: 'Monitoring' },
                    { label: 'Data Exfiltration', status: 'Secure' }
                  ].map((sys, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-[10px] font-bold text-zinc-400">{sys.label}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
          <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10 uppercase italic tracking-tighter">
            System Diagnostics
          </h3>
          <p className="text-sm font-bold text-zinc-500 tracking-wide mt-1 relative z-10">Verification tools for external integrations and monitoring.</p>
          
          <div className="mt-8 flex flex-wrap gap-4 relative z-10">
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <DatabaseZap className="w-5 h-5 text-red-500" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Sentry Health Check</h4>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                Trigger a managed exception to verify that Sentry is capturing stack traces, breadcrumbs, and diagnostic data correctly.
              </p>
              <div className="pt-2">
                <SentryTestButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

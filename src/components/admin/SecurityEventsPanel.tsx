import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Globe,
  User, Monitor, Clock, RefreshCw, Search, ChevronDown,
  ChevronUp, Filter, Download, Eye, Wifi, Zap, Sparkles, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SecurityEvent {
  id: string;
  user_id: string | null;
  email: string | null;
  full_name: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  risk_score: number;
  anomalies: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

interface FilterType {
  search: string;
  eventType: string;
  minRisk: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  low:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-blue-400    bg-blue-400/10    border-blue-400/30',
  high:   'text-amber-400   bg-amber-400/10   border-amber-400/30',
  critical:'text-red-400     bg-red-400/10     border-red-400/30',
};

const getRiskLabel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score < 20)  return 'low';
  if (score < 50)  return 'medium';
  if (score < 75)  return 'high';
  return 'critical';
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  signin_success:        <CheckCircle  className="w-4 h-4 text-emerald-500" />,
  signin_failed:         <XCircle     className="w-4 h-4 text-red-500"    />,
  signup_success:        <CheckCircle  className="w-4 h-4 text-blue-500"  />,
  signup_failed:         <XCircle     className="w-4 h-4 text-red-500"    />,
  login_anomaly_detected:<AlertTriangle className="w-4 h-4 text-amber-500"/>,
  behavioral_anomaly_detected:<AlertTriangle className="w-4 h-4 text-orange-500"/>,
  suspicious_activity:   <AlertTriangle className="w-4 h-4 text-red-500"  />,
};

const defaultIcon = <Shield className="w-4 h-4 text-zinc-600" />;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const parseUA = (ua: string | null) => {
  if (!ua) return 'Unknown';
  if (ua.includes('Chrome'))  return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari'))  return 'Safari';
  if (ua.includes('Edge'))    return 'Edge';
  return ua.substring(0, 40);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InternalStatCard = ({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode; color: string;
}) => (
  <div className={`rounded-[2rem] border p-8 flex items-center gap-6 bg-white/[0.01] backdrop-blur-3xl shadow-2xl transition-all duration-700 hover:bg-white/[0.03] group ${color}`}>
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-700">{icon}</div>
    <div>
      <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{value}</p>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">{label}</p>
    </div>
  </div>
);

const RiskBadge = ({ score }: { score: number }) => {
  const label = getRiskLabel(score);
  return (
    <span className={`text-[9px] font-black px-3 py-1 rounded-full border shadow-2xl italic tracking-widest ${RISK_COLORS[label]}`}>
      {label.toUpperCase()} PROTOCOL: {score}
    </span>
  );
};

const EventRow = ({ ev, expanded, onToggle }: {
  ev: SecurityEvent; expanded: boolean; onToggle: () => void;
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    className="border border-white/5 rounded-[2.5rem] overflow-hidden mb-6 transition-all duration-700 bg-white/[0.01] hover:bg-white/[0.03] shadow-xl group"
  >
    {/* Main row */}
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-6 px-10 py-6 text-left relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="flex-shrink-0 p-3 bg-white/[0.02] border border-white/5 rounded-xl shadow-2xl group-hover:scale-110 transition-transform">
        {EVENT_ICONS[ev.event_type] ?? defaultIcon}
      </span>
      <span className="flex-1 min-w-0 grid grid-cols-4 gap-6 text-[10px] font-black uppercase tracking-widest items-center relative z-10">
        {/* Event type */}
        <span className="text-blue-500 italic truncate">{ev.event_type.replace(/_/g, ' ')}</span>
        {/* Identity */}
        <span className="truncate text-zinc-400 flex items-center gap-3">
          <User className="w-3.5 h-3.5 flex-shrink-0 text-zinc-700" />
          {ev.full_name || ev.email || 'ANONYMOUS_UNIT'}
        </span>
        {/* IP */}
        <span className="truncate text-zinc-500 flex items-center gap-3">
          <Globe className="w-3.5 h-3.5 flex-shrink-0 text-zinc-700" />
          {ev.ip_address || '—'}
        </span>
        {/* Time */}
        <span className="text-zinc-600 flex items-center gap-3"><Clock className="w-3.5 h-3.5 text-zinc-700" /> {formatDate(ev.created_at)}</span>
      </span>
      <RiskBadge score={ev.risk_score} />
      <span className="flex-shrink-0 text-zinc-700 ml-4">
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </span>
    </button>

    {/* Expanded detail */}
    <AnimatePresence>
      {expanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-black/40 px-10 py-10 grid grid-cols-2 gap-10 border-t border-white/5"
        >
          <div className="space-y-6">
            <InternalDetail label="Unit ID"    value={ev.user_id    || '—'} />
            <InternalDetail label="Comm Uplink"      value={ev.email      || '—'} />
            <InternalDetail label="Designation"  value={ev.full_name  || '—'} />
            <InternalDetail label="Vector Source" value={ev.ip_address || '—'} />
            <InternalDetail label="OS Environment"    value={parseUA(ev.user_agent)} />
            <InternalDetail label="Geo Node"    value={ev.metadata?.country || 'GLOBAL_CORE'} />
          </div>
          <div className="space-y-8">
            {ev.anomalies && ev.anomalies.length > 0 && (
              <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10">
                <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em] block mb-4 italic flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Anomaly Detectors
                </span>
                <ul className="space-y-3">
                  {ev.anomalies.map((a, i) => (
                    <li key={i} className="text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ev.metadata?.extra && (
              <div>
                <span className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] block mb-4 italic">Neural Context Matrix</span>
                <pre className="text-zinc-500 text-[10px] font-mono bg-black/60 rounded-[1.5rem] p-6 overflow-auto max-h-48 border border-white/5 shadow-inner">
                  {JSON.stringify(ev.metadata.extra, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const InternalDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-4">
    <span className="text-zinc-700 w-32 flex-shrink-0 text-[10px] font-black uppercase tracking-widest italic">{label}</span>
    <span className="text-white font-mono text-[10px] break-all opacity-80">{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SecurityEventsPanel: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>({ search: '', eventType: '', minRisk: 0 });
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filter.eventType) query = query.eq('event_type', filter.eventType);
      if (filter.minRisk > 0) query = query.gte('risk_score', filter.minRisk);

      const { data, error } = await query;
      if (error) throw error;

      let rows = data as SecurityEvent[];
      // Client-side text search (across email, name, IP)
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        rows = rows.filter(e =>
          (e.email       || '').toLowerCase().includes(q) ||
          (e.full_name   || '').toLowerCase().includes(q) ||
          (e.ip_address  || '').includes(q)              ||
          (e.event_type  || '').includes(q)
        );
      }

      setEvents(rows);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Summary stats
  const total     = events.length;
  const highRisk  = events.filter(e => e.risk_score >= 50).length;
  const failures  = events.filter(e => e.event_type.includes('failed')).length;
  const anomalies = events.filter(e => e.event_type.includes('anomaly')).length;

  const uniqueEventTypes = [...new Set(events.map(e => e.event_type))].sort();

  const exportCsv = () => {
    const headers = ['id','email','full_name','event_type','ip_address','risk_score','created_at'];
    const rows = events.map(e =>
      headers.map(h => JSON.stringify((e as any)[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_events_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] shadow-2xl">
            <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Security <span className="text-emerald-500">Log</span></h2>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-2 opacity-60">Forensic audit log · Login surveillance · Anomaly matrix</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={exportCsv}
            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-white/[0.02] hover:bg-white/[0.05] text-zinc-500 hover:text-white rounded-2xl border border-white/5 transition-all shadow-xl group"
          >
            <Download className="w-4 h-4 group-hover:scale-125 transition-transform" /> Export Data
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-black rounded-2xl border border-transparent transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 active:scale-95 group"
          >
            <RefreshCw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InternalStatCard label="Total Audit Events" value={total}     icon={<Eye   className="w-6 h-6 text-blue-500"   />} color="border-blue-500/20"   />
        <InternalStatCard label="High Risk Signals"    value={highRisk}  icon={<AlertTriangle className="w-6 h-6 text-red-500"    />} color="border-red-500/20"    />
        <InternalStatCard label="Auth Failures" value={failures} icon={<XCircle className="w-6 h-6 text-orange-500" />} color="border-orange-500/20" />
        <InternalStatCard label="Neural Anomalies"    value={anomalies} icon={<Wifi   className="w-6 h-6 text-amber-500" />} color="border-amber-500/20" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 items-center bg-white/[0.01] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div className="relative flex-1 min-w-[20rem] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN IDENTITY, EMAIL, IP, OR EVENT VECTOR..."
            value={filter.search}
            onChange={e => { setFilter(f => ({ ...f, search: e.target.value })); setPage(0); }}
            className="w-full pl-16 pr-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 border border-white/5 rounded-[1.8rem] text-white placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
          />
        </div>
        <select
          value={filter.eventType}
          onChange={e => { setFilter(f => ({ ...f, eventType: e.target.value })); setPage(0); }}
          className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 border border-white/5 rounded-[1.8rem] text-white focus:outline-none focus:border-emerald-500/30 shadow-inner appearance-none min-w-[15rem] text-center"
        >
          <option value="">All Event Vectors</option>
          {uniqueEventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select
          value={filter.minRisk}
          onChange={e => { setFilter(f => ({ ...f, minRisk: Number(e.target.value) })); setPage(0); }}
          className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 border border-white/5 rounded-[1.8rem] text-white focus:outline-none focus:border-emerald-500/30 shadow-inner appearance-none min-w-[15rem] text-center"
        >
          <option value={0}>All Risk Levels</option>
          <option value={20}>Medium Sector+</option>
          <option value={50}>High Sector+</option>
          <option value={75}>Critical Sector Only</option>
        </select>
      </div>

      {/* Event list */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-700 gap-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center">
               <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic">Synchronizing Forensic Feed...</p>
          </div>
        ) : events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-zinc-800 text-center gap-8 group/secure"
          >
            <div className="w-32 h-32 bg-white/[0.01] border border-white/5 rounded-[3rem] flex items-center justify-center shadow-2xl group-hover/secure:scale-110 transition-transform duration-700">
               <Shield className="w-16 h-16 text-zinc-900" />
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">No Forensic Data Detected</p>
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic max-w-sm mx-auto leading-relaxed">System logs appear clear. Data will manifest as neural identities trigger surveillance protocols.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {events.map(ev => (
              <EventRow
                key={ev.id}
                ev={ev}
                expanded={expandedId === ev.id}
                onToggle={() => setExpandedId(prev => prev === ev.id ? null : ev.id)}
              />
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-10 border-t border-white/5 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">
              <span>Displaying {events.length} Data Points · Vector_Page {page + 1}</span>
              <div className="flex gap-4">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-8 py-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all disabled:opacity-10 active:scale-95"
                >PREV_VEC</button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={events.length < PAGE_SIZE}
                  className="px-8 py-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-500 hover:text-white transition-all disabled:opacity-10 active:scale-95"
                >NEXT_VEC</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityEventsPanel;

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Globe,
  User, Monitor, Clock, RefreshCw, Search, ChevronDown,
  ChevronUp, Filter, Download, Eye, Wifi
} from 'lucide-react';

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

interface Filter {
  search: string;
  eventType: string;
  minRisk: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  low:    'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-yellow-400  bg-yellow-400/10  border-yellow-400/30',
  high:   'text-orange-400  bg-orange-400/10  border-orange-400/30',
  critical:'text-red-400   bg-red-400/10    border-red-400/30',
};

const getRiskLabel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score < 20)  return 'low';
  if (score < 50)  return 'medium';
  if (score < 75)  return 'high';
  return 'critical';
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  signin_success:        <CheckCircle  className="w-4 h-4 text-emerald-400" />,
  signin_failed:         <XCircle     className="w-4 h-4 text-red-400"    />,
  signup_success:        <CheckCircle  className="w-4 h-4 text-blue-400"  />,
  signup_failed:         <XCircle     className="w-4 h-4 text-red-400"    />,
  login_anomaly_detected:<AlertTriangle className="w-4 h-4 text-yellow-400"/>,
  behavioral_anomaly_detected:<AlertTriangle className="w-4 h-4 text-orange-400"/>,
  suspicious_activity:   <AlertTriangle className="w-4 h-4 text-red-400"  />,
};

const defaultIcon = <Shield className="w-4 h-4 text-gray-400" />;

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

const StatCard = ({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode; color: string;
}) => (
  <div className={`rounded-xl border p-4 flex items-center gap-4 bg-gray-900/60 ${color}`}>
    <div className="p-2 rounded-lg bg-current/10">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  </div>
);

const RiskBadge = ({ score }: { score: number }) => {
  const label = getRiskLabel(score);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${RISK_COLORS[label]}`}>
      {label.toUpperCase()} {score}
    </span>
  );
};

const EventRow = ({ ev, expanded, onToggle }: {
  ev: SecurityEvent; expanded: boolean; onToggle: () => void;
}) => (
  <div className="border border-gray-800 rounded-xl overflow-hidden mb-2 transition-all">
    {/* Main row */}
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900/50 hover:bg-gray-800/60 transition-colors text-left"
    >
      <span className="flex-shrink-0">
        {EVENT_ICONS[ev.event_type] ?? defaultIcon}
      </span>
      <span className="flex-1 min-w-0 grid grid-cols-4 gap-2 text-sm items-center">
        {/* Event type */}
        <span className="font-mono text-blue-300 truncate">{ev.event_type}</span>
        {/* Identity */}
        <span className="truncate text-gray-300 flex items-center gap-1">
          <User className="w-3 h-3 flex-shrink-0 text-gray-500" />
          {ev.full_name || ev.email || 'Anonymous'}
        </span>
        {/* IP */}
        <span className="truncate text-gray-400 flex items-center gap-1">
          <Globe className="w-3 h-3 flex-shrink-0 text-gray-500" />
          {ev.ip_address || '—'}
        </span>
        {/* Time */}
        <span className="text-gray-500 text-xs">{formatDate(ev.created_at)}</span>
      </span>
      <RiskBadge score={ev.risk_score} />
      <span className="flex-shrink-0 text-gray-500 ml-1">
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </span>
    </button>

    {/* Expanded detail */}
    {expanded && (
      <div className="bg-gray-950/80 px-4 py-4 grid grid-cols-2 gap-4 text-sm border-t border-gray-800">
        <div className="space-y-2">
          <Detail label="User ID"    value={ev.user_id    || '—'} />
          <Detail label="Email"      value={ev.email      || '—'} />
          <Detail label="Full Name"  value={ev.full_name  || '—'} />
          <Detail label="IP Address" value={ev.ip_address || '—'} />
          <Detail label="Browser"    value={parseUA(ev.user_agent)} />
          <Detail label="Country"    value={ev.metadata?.country || '—'} />
        </div>
        <div className="space-y-2">
          {ev.anomalies && ev.anomalies.length > 0 && (
            <div>
              <span className="text-gray-500 text-xs block mb-1">Anomalies</span>
              <ul className="space-y-1">
                {ev.anomalies.map((a, i) => (
                  <li key={i} className="text-yellow-400 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ev.metadata?.extra && (
            <div>
              <span className="text-gray-500 text-xs block mb-1">Extra Context</span>
              <pre className="text-gray-300 text-xs bg-black/40 rounded p-2 overflow-auto max-h-32">
                {JSON.stringify(ev.metadata.extra, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex gap-2">
    <span className="text-gray-500 w-24 flex-shrink-0 text-xs">{label}</span>
    <span className="text-gray-200 font-mono text-xs break-all">{value}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SecurityEventsPanel: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>({ search: '', eventType: '', minRisk: 0 });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Events</h2>
            <p className="text-xs text-gray-500">Fraud prevention · Login audit log · Anomaly detection</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg border border-blue-600/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={total}     icon={<Eye   className="w-5 h-5 text-blue-400"   />} color="border-blue-800"   />
        <StatCard label="High Risk"    value={highRisk}  icon={<AlertTriangle className="w-5 h-5 text-red-400"    />} color="border-red-800"    />
        <StatCard label="Auth Failures" value={failures} icon={<XCircle className="w-5 h-5 text-orange-400" />} color="border-orange-800" />
        <StatCard label="Anomalies"    value={anomalies} icon={<Wifi   className="w-5 h-5 text-yellow-400" />} color="border-yellow-800" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by email, name, IP, event…"
            value={filter.search}
            onChange={e => { setFilter(f => ({ ...f, search: e.target.value })); setPage(0); }}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter.eventType}
          onChange={e => { setFilter(f => ({ ...f, eventType: e.target.value })); setPage(0); }}
          className="px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Event Types</option>
          {uniqueEventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filter.minRisk}
          onChange={e => { setFilter(f => ({ ...f, minRisk: Number(e.target.value) })); setPage(0); }}
          className="px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value={0}>All Risk Levels</option>
          <option value={20}>Medium+ (≥20)</option>
          <option value={50}>High+ (≥50)</option>
          <option value={75}>Critical (≥75)</option>
        </select>
      </div>

      {/* Event list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-3" />
          Loading security events…
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <Shield className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Events appear here after users sign in or trigger security checks.</p>
        </div>
      ) : (
        <>
          {events.map(ev => (
            <EventRow
              key={ev.id}
              ev={ev}
              expanded={expandedId === ev.id}
              onToggle={() => setExpandedId(prev => prev === ev.id ? null : ev.id)}
            />
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-sm text-gray-400">
            <span>Showing {events.length} events (page {page + 1})</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >← Prev</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={events.length < PAGE_SIZE}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SecurityEventsPanel;

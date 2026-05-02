import React from 'react';
import { ShieldCheck, AlertTriangle, History, Smartphone, Ban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

// Simplified types for real-world security data
interface SecurityDashboardData {
  total_threats: number;
  threats_today: number;
  high_risk_logins: number;
  last_login_time?: string;
  active_sessions_count?: number;
  security_score?: number;
}

interface SecurityEvent {
  id: string;
  created_at: string;
  event_type: string;
  ip_address: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details?: {
    location?: string;
    device?: string;
    status?: string;
  };
}

interface SecurityPanelProps {
  dashboardData: SecurityDashboardData | null;
  threats: SecurityEvent[] | null;
}

const SecurityMetric = ({ title, value, icon, status = 'default' }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-zinc-900/80 backdrop-blur-xl p-5 rounded-2xl border border-white/5 flex items-center justify-between group transition-all duration-300 hover:border-indigo-500/30"
  >
    <div className="space-y-1">
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
    <div className={`p-4 rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-110 ${
      status === 'warning' ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/5' : 
      status === 'danger' ? 'bg-red-500/10 text-red-500 shadow-red-500/5' : 
      'bg-indigo-500/10 text-indigo-400 shadow-indigo-500/5'
    }`}>
      {icon}
    </div>
  </motion.div>
);

const SecurityPanel: React.FC<SecurityPanelProps> = ({ dashboardData, threats }) => {
  if (!dashboardData) return null;

  return (
    <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 space-y-10 relative overflow-hidden group">
      {/* Background Pulse */}
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-5 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          >
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Zero-Trust Command</h2>
            <p className="text-zinc-500 text-sm font-bold tracking-tight">Vanguard Defense Matrix Active</p>
          </div>
        </div>
        
        {/* Real Status Badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <CheckCircle className="w-4 h-4 mr-2" />
            Shields_Online
          </Badge>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <SecurityMetric 
          title="Active Alerts" 
          value={dashboardData.threats_today} 
          icon={<AlertTriangle size={24} />} 
          status={dashboardData.threats_today > 0 ? 'warning' : 'default'}
        />
        <SecurityMetric 
          title="High Risk" 
          value={dashboardData.high_risk_logins} 
          icon={<Ban size={24} />} 
          status={dashboardData.high_risk_logins > 0 ? 'danger' : 'default'}
        />
        <SecurityMetric 
          title="Nodes Active" 
          value={dashboardData.active_sessions_count || 1} 
          icon={<Smartphone size={24} />} 
        />
        <SecurityMetric 
          title="Core Health" 
          value={`${dashboardData.security_score || 98}%`} 
          icon={<ShieldCheck size={24} />} 
        />
      </div>

      {/* Recent Activity Log */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-300">Recent Access Log</h3>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-zinc-900/30 overflow-hidden">
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-[140px]">Timestamp</TableHead>
                  <TableHead className="text-zinc-400">Activity</TableHead>
                  <TableHead className="text-zinc-400">Location/IP</TableHead>
                  <TableHead className="text-zinc-400 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats && threats.length > 0 ? (
                  threats.map((event) => (
                    <TableRow key={event.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-zinc-500 text-xs font-mono">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-zinc-200 font-medium capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs font-mono">
                        {event.ip_address}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={event.risk_level === 'low' ? 'outline' : 'destructive'} 
                          className="uppercase text-[10px]"
                        >
                          {event.risk_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-500 py-12">
                      No recent security events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
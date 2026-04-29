import { AlertTriangle, Activity, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ThreatAlertProps {
  title: string;
  summary: string;
  level: 'low' | 'medium' | 'high' | 'critical';
}

const levelStyles: Record<ThreatAlertProps['level'], string> = {
  low: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5',
  medium: 'border-blue-500/20 text-blue-500 bg-blue-500/5',
  high: 'border-amber-500/20 text-amber-500 bg-amber-500/5',
  critical: 'border-red-500/20 text-red-500 bg-red-500/5',
};

export const ThreatAlert = ({ title, summary, level }: ThreatAlertProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      className={`rounded-[2.5rem] border p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group transition-all duration-700 hover:bg-white/[0.02] ${levelStyles[level]}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-[40px] pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 text-lg font-black uppercase italic tracking-tighter">
          <div className="p-2.5 bg-current/10 rounded-xl border border-current/20 shadow-2xl group-hover:scale-110 transition-transform">
             <AlertTriangle className={`h-5 w-5 ${level === 'critical' ? 'animate-pulse' : ''}`} />
          </div>
          {title.replace(/_/g, ' ')}
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-current/20 text-[8px] font-black uppercase tracking-[0.3em] italic bg-current/5 shadow-2xl">
          {level} protocol
        </Badge>
      </div>
      
      <div className="mt-6 p-6 rounded-[1.5rem] bg-black/40 border border-white/5 shadow-inner">
        <p className="text-[11px] text-zinc-400 font-medium italic group-hover:text-zinc-200 transition-colors leading-relaxed">
          {summary}
        </p>
      </div>
      
      <div className="mt-6 flex items-center gap-3 opacity-10 group-hover:opacity-30 transition-opacity">
         <Activity className="w-3.5 h-3.5" />
         <div className="h-[1px] flex-1 bg-current" />
      </div>
    </motion.div>
  );
};

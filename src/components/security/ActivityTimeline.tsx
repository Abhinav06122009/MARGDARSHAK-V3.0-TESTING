import { Activity, Clock, Zap, Sparkles, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

export interface ActivityItem {
  id: string;
  created_at: string;
  activity_type: string;
  metadata?: Record<string, any> | null;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
}

export const ActivityTimeline = ({ items }: ActivityTimelineProps) => {
  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-white/[0.01] border border-white/5 rounded-3xl text-center gap-4">
           <Database className="w-8 h-8 text-zinc-800" />
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">No recent activity logs detected in the matrix.</p>
        </div>
      ) : (
        items.map((item, index) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-6 rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 backdrop-blur-3xl shadow-xl transition-all duration-700 hover:bg-white/[0.03] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.01] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="mt-1 rounded-[1.2rem] bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-500 shadow-2xl group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic group-hover:text-emerald-400 transition-colors">
                   {item.activity_type.replace(/_/g, ' ')} protocol
                </span>
                <span className="flex items-center gap-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest italic opacity-60">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>
              {item.metadata?.summary && (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                  <p className="text-[10px] text-zinc-500 font-medium italic group-hover:text-zinc-300 transition-colors leading-relaxed">
                    {item.metadata.summary}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

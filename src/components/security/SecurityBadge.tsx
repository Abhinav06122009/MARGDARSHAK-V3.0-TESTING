import { ShieldCheck, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface SecurityBadgeProps {
  score?: number | null;
  level?: 'low' | 'medium' | 'high' | 'critical';
}

const levelConfig = {
  low: { label: 'LOW_VEC', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: ShieldCheck },
  medium: { label: 'MID_VEC', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: ShieldCheck },
  high: { label: 'HIGH_VEC', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: ShieldAlert },
  critical: { label: 'CRIT_VEC', className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: ShieldAlert },
};

export const SecurityBadge = ({ score, level = 'low' }: SecurityBadgeProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="inline-block"
    >
      <Badge variant="outline" className={`flex items-center gap-3 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] italic border shadow-2xl backdrop-blur-3xl transition-all duration-700 ${config.className}`}>
        <Icon className={`h-3 w-3 ${level === 'critical' ? 'animate-pulse' : ''}`} />
        {config.label}
        {score !== undefined && score !== null ? (
          <span className="flex items-center gap-2 border-l border-white/10 pl-2 ml-1">
             <Activity className="w-2.5 h-2.5 opacity-40" />
             {score}
          </span>
        ) : ''}
      </Badge>
    </motion.div>
  );
};

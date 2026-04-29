import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}

const StatCard = ({ title, value, icon, hint }: StatCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-6 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3 group-hover:text-emerald-500 transition-colors">{title}</p>
          <p className="text-4xl font-black text-white tracking-tighter italic leading-none">{value}</p>
        </div>
        {icon && (
          <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-zinc-500 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-700 shadow-xl">
            {icon}
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-6 text-[8px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-3 relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          {hint}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;

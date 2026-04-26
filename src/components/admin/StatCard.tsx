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
      whileHover={{ y: -5 }}
      className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 relative overflow-hidden group shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{title}</p>
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-red-400 group-hover:scale-110 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all">
            {icon}
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-4 text-xs font-bold text-zinc-500 flex items-center gap-2 relative z-10">
          <span className="w-1 h-1 rounded-full bg-red-500" />
          {hint}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;

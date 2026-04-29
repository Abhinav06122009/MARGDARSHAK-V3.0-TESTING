import { AlertTriangle, ServerCrash, ShieldAlert, Zap, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreatCardProps {
  title: string;
  level: string;
  score: number;
  summary?: string | null;
  ip?: string | null;
}

const ThreatCard = ({ title, level, score, summary, ip }: ThreatCardProps) => {
  const isHighRisk = score > 75;
  const isMedRisk = score > 40 && score <= 75;

  const getStatusColor = () => {
    if (isHighRisk) return 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10';
    if (isMedRisk) return 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10';
  };

  const getAccentColor = () => {
    if (isHighRisk) return 'bg-red-500';
    if (isMedRisk) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl p-8 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ${
        isHighRisk 
          ? 'bg-red-500/[0.03] border-red-500/20' 
          : 'bg-white/[0.01] border-white/5 hover:border-emerald-500/20'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-2xl border shadow-2xl transition-transform duration-700 group-hover:scale-110 ${getStatusColor()}`}>
            {isHighRisk ? <ServerCrash className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-emerald-400 transition-colors">{title}</h4>
            <div className="flex items-center gap-2 mt-2">
              <Radio className={`w-3 h-3 ${getStatusColor().split(' ')[0]} animate-pulse`} />
              <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">Threat Signal Detected</p>
            </div>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] italic shadow-2xl ${getStatusColor()}`}>
          {level}
        </div>
      </div>

      {summary && (
        <div className="mb-8 relative z-10">
           <p className="text-sm text-zinc-500 leading-relaxed font-medium italic opacity-80 hover:opacity-100 transition-opacity">
            "{summary}"
          </p>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
        {ip && (
          <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/5 shadow-inner group/ip">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-700 group-hover/ip:text-emerald-500 transition-colors" />
            <span className="text-[10px] font-black tracking-widest text-zinc-500 font-mono group-hover/ip:text-white transition-colors">{ip}</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">Risk Vector</span>
          <div className="flex items-center gap-3">
             <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${getAccentColor()} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                />
             </div>
             <span className={`text-base font-black italic tracking-tighter ${getStatusColor().split(' ')[0]}`}>{score}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatCard;

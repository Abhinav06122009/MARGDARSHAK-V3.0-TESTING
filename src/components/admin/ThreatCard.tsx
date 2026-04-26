import { AlertTriangle, ServerCrash, ShieldAlert } from 'lucide-react';
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

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-3xl p-5 transition-all ${
        isHighRisk 
          ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
          : 'bg-white/[0.02] border-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isHighRisk ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
            {isHighRisk ? <ServerCrash className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Threat Level</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
          isHighRisk ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
        }`}>
          {level}
        </div>
      </div>

      {summary && <p className="text-xs text-zinc-400 leading-relaxed relative z-10 font-medium mb-4">{summary}</p>}
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
        {ip && (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-400">{ip}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Severity Score</span>
          <span className={`text-sm font-black ${isHighRisk ? 'text-red-400' : 'text-amber-400'}`}>{score}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatCard;

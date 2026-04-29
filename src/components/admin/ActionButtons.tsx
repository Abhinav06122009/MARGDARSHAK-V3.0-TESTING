import { CheckCircle2, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ActionButtons = ({ primaryLabel, secondaryLabel, onPrimary, onSecondary }: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-6">
      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPrimary}
        className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black border border-transparent rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] group"
      >
        <CheckCircle2 className="w-4 h-4 group-hover:scale-125 transition-transform" /> {primaryLabel}
      </motion.button>
      
      {secondaryLabel && (
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSecondary}
          className="flex items-center gap-3 px-8 py-4 bg-white/[0.02] hover:bg-amber-500/10 text-zinc-600 hover:text-amber-500 border border-white/5 hover:border-amber-500/20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all shadow-2xl group"
        >
          <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" /> {secondaryLabel}
        </motion.button>
      )}
    </div>
  );
};

export default ActionButtons;

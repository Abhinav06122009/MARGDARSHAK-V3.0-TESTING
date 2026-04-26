import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface ActionButtonsProps {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

const ActionButtons = ({ primaryLabel, secondaryLabel, onPrimary, onSecondary }: ActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button 
        onClick={onPrimary}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
      >
        <CheckCircle2 className="w-4 h-4" /> {primaryLabel}
      </button>
      
      {secondaryLabel && (
        <button 
          onClick={onSecondary}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]"
        >
          <ShieldAlert className="w-4 h-4" /> {secondaryLabel}
        </button>
      )}
    </div>
  );
};

export default ActionButtons;

import { Shield, ShieldAlert, UserX, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserRowProps {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  risk?: string | null;
  blocked?: boolean | null;
  onAction?: (action: 'block' | 'unblock', userId: string) => void;
}

const UserRow = ({ id, name, email, role, risk, blocked, onAction }: UserRowProps) => {
  const isHighRisk = risk?.toLowerCase() === 'high';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border p-5 transition-all ${
        blocked 
          ? 'bg-zinc-950/80 border-red-500/10 opacity-75' 
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
          blocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-zinc-400'
        }`}>
          {blocked ? <UserX className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-wide">{name || 'Unknown Identity'}</p>
          <p className="text-xs font-mono text-zinc-500 mt-0.5">{email || 'No email on file'}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-400">
          {role || 'MEMBER'}
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
          isHighRisk ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {isHighRisk && <ShieldAlert className="w-3 h-3" />}
          RISK: {risk || 'LOW'}
        </div>
        
        <button
          onClick={() => onAction?.(blocked ? 'unblock' : 'block', id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            blocked 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
          }`}
        >
          {blocked ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
          {blocked ? 'Restore Access' : 'Revoke Access'}
        </button>
      </div>
    </motion.div>
  );
};

export default UserRow;

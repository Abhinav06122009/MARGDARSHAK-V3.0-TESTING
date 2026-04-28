import { Shield, ShieldAlert, UserX, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserRowProps {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  risk?: string | null;
  blocked?: boolean | null;
  tier?: string | null;
  lastIp?: string | null;
  onAction?: (action: 'block' | 'unblock' | 'set_tier', userId: string, extra?: any) => void;
}

const UserRow = ({ id, name, email, role, risk, blocked, tier, lastIp, onAction }: UserRowProps) => {
  const isHighRisk = risk?.toLowerCase() === 'high';
  
  const tiers = [
    { id: 'free', label: 'Free', color: 'text-zinc-400 border-zinc-500/20 bg-zinc-500/5' },
    { id: 'premium', label: 'Premium', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
    { id: 'premium_elite', label: 'Elite', color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
  ];

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
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white tracking-wide">{name || 'Unknown Identity'}</p>
            {tier && (
              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                tier === 'premium_elite' ? 'text-purple-400 border-purple-500/20' : 
                tier === 'premium' ? 'text-amber-400 border-amber-500/20' : 'text-zinc-500 border-white/5'
              }`}>
                {tier}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-0.5">{email || 'No email on file'}</p>
          {lastIp && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
              <p className="text-[10px] font-black text-emerald-500/60 tracking-widest uppercase">IP: {lastIp}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Tier Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => onAction?.('set_tier', id, { tier: t.id })}
              className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${
                tier === t.id 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

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
          {blocked ? 'Restore' : 'Revoke'}
        </button>
      </div>
    </motion.div>
  );
};

export default UserRow;

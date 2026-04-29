import { Shield, ShieldAlert, UserX, UserCheck, Activity, Globe, Zap, Sparkles } from 'lucide-react';
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
    { id: 'free', label: 'FREE', color: 'text-zinc-600 border-white/5 bg-white/[0.01]' },
    { id: 'premium', label: 'PREMIUM', color: 'text-blue-500 border-blue-500/20 bg-blue-500/5 shadow-blue-500/10' },
    { id: 'premium_elite', label: 'ELITE', color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-emerald-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex flex-col md:flex-row md:items-center justify-between gap-10 rounded-[2.5rem] border p-8 transition-all duration-700 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] ${
        blocked 
          ? 'bg-zinc-950/90 border-red-500/10 opacity-60 grayscale' 
          : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-emerald-500/10'
      }`}
    >
      <div className="flex items-center gap-8">
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-2xl transition-all duration-700 group-hover:scale-110 ${
          blocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.02] border-white/5 text-zinc-700 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20'
        }`}>
          {blocked ? <UserX className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
        </div>
        <div>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-xl font-black text-white tracking-tighter uppercase italic group-hover:text-emerald-400 transition-colors">{name || 'UNKNOWN_ID'}</p>
            {tier && (
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] italic px-3 py-1 rounded-full border shadow-2xl ${
                tier === 'premium_elite' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                tier === 'premium' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 'text-zinc-600 border-white/5 bg-white/[0.01]'
              }`}>
                {tier.replace('_', ' ')} protocol
              </span>
            )}
          </div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2 font-mono group-hover:text-zinc-400 transition-colors">{email || 'NO_EMAIL_RECORDED'}</p>
          {lastIp && (
            <div className="flex items-center gap-3 mt-4 px-3 py-1.5 bg-black/40 rounded-xl border border-white/5 w-fit shadow-inner">
              <Globe className="w-3 h-3 text-emerald-500/60" />
              <p className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase">LINK: <span className="text-white opacity-40">{lastIp}</span></p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-6">
        {/* Protocol Selector */}
        <div className="flex items-center gap-2 bg-black/60 p-2 rounded-2xl border border-white/5 shadow-2xl">
          {tiers.map((t) => (
            <button
              key={t.id}
              onClick={() => onAction?.('set_tier', id, { tier: t.id })}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${
                tier === t.id 
                  ? `${t.color.split(' ')[0]} ${t.color.split(' ')[1]} ${t.color.split(' ')[2]} italic shadow-2xl` 
                  : 'text-zinc-800 hover:text-zinc-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 shadow-xl group-hover:text-white transition-colors italic">
          {role || 'MEMBER'}
        </div>
        
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] italic shadow-2xl ${
          isHighRisk ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.01] border-white/5 text-zinc-700 group-hover:text-emerald-500'
        }`}>
          <Activity className={`w-3.5 h-3.5 ${isHighRisk ? 'animate-pulse' : ''}`} />
          RISK: {risk || 'SAFE'}
        </div>
        
        <button
          onClick={() => onAction?.(blocked ? 'unblock' : 'block', id)}
          className={`flex items-center gap-4 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-700 shadow-2xl hover:translate-y-[-4px] active:scale-95 ${
            blocked 
              ? 'bg-emerald-500 text-black shadow-emerald-500/20' 
              : 'bg-white/[0.02] text-zinc-600 border border-white/5 hover:bg-red-500 hover:text-white hover:border-red-500/30'
          }`}
        >
          {blocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          {blocked ? 'Authorize' : 'Revoke'}
        </button>
      </div>
    </motion.div>
  );
};

export default UserRow;

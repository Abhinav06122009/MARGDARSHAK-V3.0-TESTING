import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Sparkles, Zap, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const UpgradeCard = () => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950 shadow-2xl group h-full"
    >
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-orange-600/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Aurora Border Animation */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700"
        animate={{ 
          background: [
            'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(245,158,11,0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.3) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent z-10 pointer-events-none"
      />

      <div className="relative z-20 p-8 md:p-10 flex flex-col h-full">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-black shadow-xl shadow-amber-500/20">
            <Crown className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-end">
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">
              Premium Plus
            </div>
            <div className="text-[7px] text-zinc-600 font-bold uppercase tracking-tighter mt-1 italic">Identity Slot: Available</div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
             <Sparkles className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Neural Upgrade</span>
          </div>
          <h3 className="text-3xl font-black text-white leading-[1.1] tracking-tighter mb-4 italic">
            ASCEND TO THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-200">SUPREME RANK</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium max-w-[240px]">
            Unleash the full computational potential of the Margdarshak Neural Core with Sovereign status.
          </p>
        </div>

        {/* Tactical Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-10">
          {[
            { icon: Zap, text: "Unlimited AI Generation", color: "text-amber-400" },
            { icon: ShieldCheck, text: "Advanced Security Protocol", color: "text-emerald-400" },
            { icon: Flame, text: "Priority Neural Access", color: "text-rose-400" }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 group/item"
            >
              <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 ${feature.color} group-hover/item:scale-110 transition-transform`}>
                <feature.icon size={12} />
              </div>
              <span className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Tactical Action Button */}
        <div className="mt-auto">
          <Link
            to="/upgrade"
            className="group/btn relative flex items-center justify-between w-full p-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-black text-black text-xs tracking-[0.2em] overflow-hidden transition-all hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] active:scale-95"
          >
            <span className="relative z-10">INITIALIZE UPGRADE</span>
            <ArrowRight size={18} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out skew-x-12" />
          </Link>
          
          <div className="flex items-center justify-center gap-3 mt-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em]">
               Secured via 256-Bit Encryption
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UpgradeCard;
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Flame } from 'lucide-react';
import { calculateXP, calculateLevel } from '@/lib/gamification/streakService';

interface VirtualPetProps {
  stats: any;
  tasks: any[];
}

const PET_STATES = {
  sad: { emoji: '🥺', color: 'text-blue-400', message: 'I miss studying with you...', glow: 'bg-blue-500/20' },
  neutral: { emoji: '🙂', color: 'text-zinc-400', message: 'Ready to learn?', glow: 'bg-zinc-500/10' },
  happy: { emoji: '😄', color: 'text-green-400', message: 'Great job today!', glow: 'bg-green-500/20' },
  excited: { emoji: '🤩', color: 'text-amber-400', message: 'You are on fire!!', glow: 'bg-amber-500/30' },
  galaxy: { emoji: '🌌', color: 'text-purple-400', message: 'Ascended intelligence!', glow: 'bg-purple-600/40' }
};

export const VirtualPet: React.FC<VirtualPetProps> = ({ stats, tasks }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const minutes = stats?.minutes_today || 0;
  
  const xp = calculateXP(completedTasks, minutes) + (stats?.xp || 0);
  const { level, currentTierXP, progress } = calculateLevel(xp);
  
  const streak = stats?.study_streak || 0;

  const mood = useMemo(() => {
    if (streak === 0 && xp < 100) return 'sad';
    if (streak > 7 || xp > 5000) return 'galaxy';
    if (streak > 3 || completedTasks > 2) return 'excited';
    if (completedTasks > 0 || minutes > 30) return 'happy';
    return 'neutral';
  }, [streak, completedTasks, minutes, xp]);

  const petState = PET_STATES[mood as keyof typeof PET_STATES];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 flex flex-col items-center justify-center group h-full transition-all duration-700 hover:border-indigo-500/40">
      {/* ── Holographic Auras ── */}
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1], rotate: [0, 90, 180, 270, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${petState.glow}`} 
      />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full blur-[100px] bg-indigo-500/10 pointer-events-none" />

      <div className="w-full flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white uppercase tracking-[0.2em] italic drop-shadow-lg">
              Aether_Core
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 2, 1], opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className={`w-1.5 h-1.5 rounded-full ${petState.color.replace('text-', 'bg-')}`}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] leading-tight">{petState.message}</p>
        </div>
        
        <div className="text-right">
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs font-black text-amber-400 uppercase tracking-widest shadow-2xl"
          >
            <Star size={12} className="fill-amber-400" /> LEVEL {level}
          </motion.div>
        </div>
      </div>

      <div className="relative my-8 group-hover:scale-110 transition-transform duration-700">
        {/* Orbital Ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-12 border border-dashed border-white/10 rounded-full pointer-events-none opacity-40"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-16 border border-dotted border-white/5 rounded-full pointer-events-none opacity-20"
        />
        
        <motion.div 
          layoutId="pet-emoji"
          animate={{ 
            y: [0, -20, 0],
            rotate: mood === 'excited' ? [-8, 8, -8] : mood === 'galaxy' ? [0, 360] : 0,
            scale: [1, 1.15, 1],
            filter: ["drop-shadow(0 0 20px rgba(255,255,255,0.1))", "drop-shadow(0 0 40px rgba(255,255,255,0.4))", "drop-shadow(0 0 20px rgba(255,255,255,0.1))"]
          }}
          transition={{ 
            y: { repeat: Infinity, duration: mood === 'excited' || mood === 'galaxy' ? 1.2 : 4, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: mood === 'excited' ? 0.4 : 12, ease: "linear" },
            scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            filter: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="text-9xl relative z-10 cursor-pointer select-none"
        >
          {petState.emoji}
        </motion.div>
      </div>

      <div className="w-full relative z-10 mt-auto space-y-4">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Ascension_Progress</span>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-indigo-400 fill-indigo-400/20" />
              <span className="text-sm font-black text-white tracking-widest">{xp} <span className="text-zinc-700">XP</span></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Next_Node</span>
            <span className="text-sm font-black text-zinc-400 tracking-widest">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="h-4 w-full bg-white/[0.03] rounded-full p-1 border border-white/5 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2, type: 'spring', bounce: 0.1 }}
            className={`h-full rounded-full relative ${
              mood === 'galaxy' ? 'bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500' : 
              mood === 'excited' ? 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400' : 
              'bg-gradient-to-r from-blue-600 via-emerald-500 to-cyan-400'
            }`}
          >
            {/* High-speed shimmer */}
            <motion.div 
              animate={{ x: ['-200%', '300%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />
          </motion.div>
        </div>
      </div>
      
      {/* Streak Fire Effect */}
      <AnimatePresence>
        {streak > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          >
             <motion.div
               animate={{ 
                 scale: [1, 1.1, 1],
                 rotate: [0, 5, -5, 0],
                 opacity: [0.05, 0.15, 0.05]
               }}
               transition={{ duration: 3, repeat: Infinity }}
             >
               <Flame size={180} className="text-orange-500/40 blur-sm" />
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

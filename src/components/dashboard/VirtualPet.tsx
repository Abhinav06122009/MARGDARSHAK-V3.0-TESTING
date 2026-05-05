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

export const VirtualPet: React.FC<VirtualPetProps> = React.memo(({ stats, tasks }) => {
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
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl p-7 flex flex-col items-center justify-center group h-full transition-all duration-500 hover:border-white/20">
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none ${petState.glow}`} 
      />
      
      <div className="w-full flex justify-between items-start mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider italic">
              Aether Buddy
            </h3>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className={`w-1 h-1 rounded-full ${petState.color.replace('text-', 'bg-')}`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{petState.message}</p>
        </div>
        
        <div className="text-right">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-tighter"
          >
            <Star size={10} className="fill-amber-400 animate-pulse" /> LEVEL {level}
          </motion.div>
        </div>
      </div>

      <div className="relative my-4">
        {/* Halo Effect */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border border-dashed border-white/5 rounded-full pointer-events-none"
        />
        
        <motion.div 
          layoutId="pet-emoji"
          animate={{ 
            y: [0, -15, 0],
            rotate: mood === 'excited' ? [-5, 5, -5] : mood === 'galaxy' ? [0, 360, 0] : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            y: { repeat: Infinity, duration: mood === 'excited' || mood === 'galaxy' ? 1.5 : 3, ease: "easeInOut" },
            rotate: { repeat: Infinity, duration: mood === 'excited' ? 0.5 : 8, ease: "linear" },
            scale: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
          className="text-7xl relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] cursor-pointer select-none"
        >
          {petState.emoji}
        </motion.div>
      </div>

      <div className="w-full relative z-10 mt-auto space-y-3">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Essence Progress</span>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-blue-400 fill-blue-400/20" />
              <span className="text-xs font-black text-white tracking-tighter">{xp} <span className="text-zinc-600">XP</span></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Next Tier</span>
            <span className="text-xs font-black text-zinc-400 tracking-tighter">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="h-2.5 w-full bg-white/5 rounded-full p-0.5 border border-white/10 relative overflow-hidden group/bar">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
            className={`h-full rounded-full relative ${
              mood === 'galaxy' ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500' : 
              mood === 'excited' ? 'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400' : 
              'bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400'
            }`}
          >
            {/* Shimmer effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
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

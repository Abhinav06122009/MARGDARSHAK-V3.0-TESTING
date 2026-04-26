import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Zap, Flame } from 'lucide-react';
import { calculateXP, calculateLevel } from '@/lib/gamification/streakService';

interface VirtualPetProps {
  stats: any;
  tasks: any[];
}

const PET_STATES = {
  sad: { emoji: '🥺', color: 'text-blue-400', message: 'I miss studying with you...' },
  neutral: { emoji: '🙂', color: 'text-zinc-400', message: 'Ready to learn?' },
  happy: { emoji: '😄', color: 'text-green-400', message: 'Great job today!' },
  excited: { emoji: '🤩', color: 'text-amber-400', message: 'You are on fire!!' },
  galaxy: { emoji: '🌌', color: 'text-purple-400', message: 'Ascended intelligence!' }
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
    <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-2xl shadow-xl p-6 flex flex-col items-center justify-center group h-full">
      <div className={`absolute top-0 right-0 w-[200px] h-[200px] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-20 ${
        mood === 'galaxy' ? 'bg-purple-500' : mood === 'excited' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />
      
      <div className="w-full flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Study Buddy <Sparkles size={14} className={petState.color} />
          </h3>
          <p className="text-xs text-zinc-400 mt-1">{petState.message}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end text-xs font-bold text-amber-400">
            <Star size={12} className="fill-amber-400" /> Lvl {level}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">{xp} Total XP</div>
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: mood === 'excited' || mood === 'galaxy' ? 2 : 4, ease: "easeInOut" }}
        className={`text-6xl my-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
      >
        {petState.emoji}
      </motion.div>

      <div className="w-full relative z-10 mt-auto">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">
          <span className="flex items-center gap-1"><Zap size={10} /> {currentTierXP} XP</span>
          <span>Next Lvl</span>
        </div>
        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${
              mood === 'galaxy' ? 'from-purple-600 to-fuchsia-500' : 
              mood === 'excited' ? 'from-amber-600 to-orange-400' : 
              'from-blue-600 to-cyan-400'
            }`}
          />
        </div>
      </div>
      
      {streak > 0 && (
        <div className="absolute top-4 left-4 right-4 flex justify-center pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
           <Flame size={120} className="text-orange-500 mix-blend-screen" />
        </div>
      )}
    </div>
  );
};

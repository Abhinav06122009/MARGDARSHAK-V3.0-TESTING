import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Flame } from 'lucide-react';
import { calculateXP, calculateLevel } from '@/lib/gamification/streakService';
import { useRankTheme } from '@/context/ThemeContext';

interface VirtualPetProps {
  stats: any;
  tasks: any[];
}

const PET_STATES = {
  sad: { emoji: '🥺', color: 'text-blue-400', message: 'Synchronization failing...', glow: 'bg-blue-500/20' },
  neutral: { emoji: '🙂', color: 'text-zinc-400', message: 'Core initialized.', glow: 'bg-zinc-500/10' },
  happy: { emoji: '😄', color: 'text-green-400', message: 'Optimal performance.', glow: 'bg-green-500/20' },
  excited: { emoji: '🤩', color: 'text-amber-400', message: 'Neural surge detected!', glow: 'bg-amber-500/30' },
  galaxy: { emoji: '🌌', color: 'text-purple-400', message: 'Ascended Intelligence!', glow: 'bg-purple-600/40' }
};

export const VirtualPet: React.FC<VirtualPetProps> = ({ stats, tasks }) => {
  const { theme } = useRankTheme();
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const minutes = stats?.minutes_today || 0;
  
  const xp = calculateXP(completedTasks, minutes) + (stats?.xp || 0);
  const { level, progress } = calculateLevel(xp);
  
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
    <div className="relative overflow-hidden rounded-[2.5rem] border bg-zinc-950/80 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 flex flex-col items-center justify-center group h-full transition-all duration-700"
      style={{ borderColor: theme.colors.border }}>
      
      {/* Dynamic Theme Aura */}
      <motion.div 
        animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none" 
        style={{ backgroundColor: theme.colors.glow }}
      />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-10"
        style={{ backgroundColor: theme.colors.accent }} />

      <div className="w-full flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white uppercase tracking-[0.2em] italic drop-shadow-lg">
              {theme.id.includes('a+') ? 'RHODIUM_CORE' : 'AETHER_CORE'}
            </h3>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 2, 1], opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.25em] leading-tight">{petState.message}</p>
        </div>
        
        <div className="text-right">
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-widest shadow-2xl"
            style={{ backgroundColor: `${theme.colors.primary}10`, borderColor: `${theme.colors.primary}30`, color: theme.colors.primary }}
          >
            <Star size={12} className="fill-current" /> LVL {level}
          </motion.div>
        </div>
      </div>

      <div className="relative my-8 group-hover:scale-110 transition-transform duration-700">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-16 border border-dashed rounded-full pointer-events-none opacity-20"
          style={{ borderColor: theme.colors.primary }}
        />
        
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: mood === 'excited' ? [-8, 8, -8] : mood === 'galaxy' ? [0, 360] : 0,
            scale: [1, 1.15, 1],
            filter: [`drop-shadow(0 0 20px ${theme.colors.glow})`, `drop-shadow(0 0 40px ${theme.colors.glow})`, `drop-shadow(0 0 20px ${theme.colors.glow})`]
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
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Neural_Progress</span>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: theme.colors.primary }} className="fill-current opacity-50" />
              <span className="text-sm font-black text-white tracking-widest">{xp} <span className="text-zinc-700">NODE_XP</span></span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] block">Next_Rank</span>
            <span className="text-sm font-black text-zinc-400 tracking-widest">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="h-4 w-full bg-white/[0.03] rounded-full p-1 border border-white/5 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2, type: 'spring' }}
            className="h-full rounded-full relative"
            style={{ background: theme.gradients.main }}
          >
            <motion.div 
              animate={{ x: ['-200%', '300%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

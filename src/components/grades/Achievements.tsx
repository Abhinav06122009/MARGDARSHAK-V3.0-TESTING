
import React from 'react';
import { motion } from 'framer-motion';
import AchievementBadge from './AchievementBadge';
import type { Achievement } from './achievements';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="mt-16 space-y-10">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em]">Merit Repository</span>
          </div>
          <motion.h2 
            className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Achievements
          </motion.h2>
        </div>
        <div className="flex items-center gap-6 pb-2">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-white tracking-tighter">{unlockedAchievements.length}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Unlocked</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-zinc-700 tracking-tighter">{lockedAchievements.length}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Pending</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unlockedAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementBadge achievement={achievement} />
          </motion.div>
        ))}
        {lockedAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (unlockedAchievements.length + index) * 0.1 }}
          >
            <AchievementBadge achievement={achievement} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;

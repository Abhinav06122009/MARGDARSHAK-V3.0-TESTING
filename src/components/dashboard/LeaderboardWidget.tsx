import React, { useEffect, useState } from 'react';
import { fetchRealLeaderboard, calculateXP } from '@/lib/gamification/streakService';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';

export const LeaderboardWidget: React.FC = () => {
  const { currentUser, stats, recentTasks } = useDashboardData();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const loadLeaderboard = async () => {
        const completedTasks = recentTasks?.filter(t => t.status === 'completed').length || 0;
        const minutes = stats?.minutes_today || 0;
        const xp = calculateXP(completedTasks, minutes) + (stats?.xp || 0);
        
        const data = await fetchRealLeaderboard(currentUser.id, xp);
        setLeaderboard(data);
        setLoading(false);
      };
      loadLeaderboard();
    }
  }, [currentUser, stats, recentTasks]);

  if (loading) {
    return <div className="w-full flex justify-center py-8"><Loader2 className="animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-bold text-white flex items-center gap-2">
           <Trophy size={16} className="text-amber-400" /> Global League
         </h3>
         <span className="text-[10px] text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest font-bold">Top 5</span>
      </div>

      <div className="flex flex-col gap-2">
        {leaderboard.map((user, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={user.id} 
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              user.isCurrentUser 
              ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
              : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 text-center font-bold text-xs ${
                index === 0 ? 'text-amber-400' : 
                index === 1 ? 'text-zinc-300' : 
                index === 2 ? 'text-orange-400' : 'text-zinc-600'
              }`}>
                {index < 3 ? <Medal size={16} className="mx-auto" /> : `#${index + 1}`}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg shadow-inner">
                  {user.avatar}
                </div>
                <div>
                  <p className={`text-xs font-bold ${user.isCurrentUser ? 'text-amber-400' : 'text-zinc-200'}`}>
                    {user.name}
                  </p>
                  <p className="text-[10px] text-zinc-500">{user.xp.toLocaleString()} XP</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { fetchRealLeaderboard, calculateXP } from '@/lib/gamification/streakService';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';

interface LeaderboardWidgetProps {
  currentUser: any;
  stats: any;
  recentTasks: any[];
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = React.memo(({ currentUser, stats, recentTasks }) => {
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
    <div className="w-full flex flex-col gap-6 relative group">
      {/* Subtle Background Header */}
      <div className="flex items-center justify-between px-1">
         <div className="space-y-0.5">
           <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight italic">
             <Trophy size={16} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> Aether League
           </h3>
           <div className="flex items-center gap-1.5">
             <motion.div 
               animate={{ opacity: [1, 0.4, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" 
             />
             <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Live Updates</span>
           </div>
         </div>
         <span className="text-[10px] text-amber-500 font-black bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 uppercase tracking-tighter shadow-xl backdrop-blur-md">
           Season 1
         </span>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((user, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: index * 0.05 
              }}
              key={user.id} 
              className={`relative overflow-hidden group/item flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                user.isCurrentUser 
                ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_10px_30px_rgba(245,158,11,0.1)]' 
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
              }`}
            >
              {/* Highlight for current user */}
              {user.isCurrentUser && (
                <motion.div 
                  layoutId="current-user-glow"
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" 
                />
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className="flex flex-col items-center justify-center min-w-[24px]">
                  {index < 3 ? (
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.2 }}
                    >
                      <Medal size={20} className={
                        index === 0 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' : 
                        index === 1 ? 'text-zinc-300 drop-shadow-[0_0_10px_rgba(212,212,216,0.3)]' : 
                        'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]'
                      } />
                    </motion.div>
                  ) : (
                    <span className="text-xs font-black text-zinc-600 tracking-tighter">#{index + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-xl shadow-2xl overflow-hidden group-hover/item:scale-110 transition-transform duration-500">
                      {user.avatar}
                      {/* Reflection Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <p className={`text-xs font-black tracking-tight ${user.isCurrentUser ? 'text-amber-400' : 'text-white'}`}>
                      {user.name}
                      {user.isCurrentUser && <span className="ml-2 text-[8px] font-black uppercase text-amber-500/60 tracking-widest leading-none bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20">You</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (user.xp / leaderboard[0].xp) * 100)}%` }}
                          className={`h-full ${user.isCurrentUser ? 'bg-amber-500' : 'bg-zinc-600'}`}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 tracking-tighter">{user.xp.toLocaleString()} <span className="text-[8px] opacity-60">XP</span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rank Shift Indicator (Mock) */}
              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500/80 uppercase">Steady</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});
